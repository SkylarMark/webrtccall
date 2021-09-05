/* eslint-disable max-len */
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import xss from 'xss-clean';
import {Server} from 'socket.io';
import {AddressInfo} from 'net';
import bodyParser from 'body-parser';
import ConfigUtils from '../utils/config';
import rateLimit from 'express-rate-limit';
import express, {Application} from 'express';
import expressSanatizer from 'express-sanitizer';
import {createServer, Server as HttpServer} from 'https';

/**
 * Server Call to Start the Server
 */
export default class KServer {
  // Initializing Express Server
  public app: express.Application = express();
  public io: any;

  /**
   * Start Server Config and Start the Server
   */
  constructor() {
    this.configServer();
    this.startServer();
    // Bindings
    this.startServer = this.startServer.bind(this);
    this.configServer = this.configServer.bind(this);
  }

  /**
   * Configuration of Server
   *
   * Includes
   * CORS
   * Rate Limit
   * XSS
   * Express Sanatizer
   * Body Parser
   * Express JSON
   */
  configServer() {
    const {app} = this;
    app.set('trust proxy', 1);
    app.use(express.static('public'));
    // Enable Cross Origin Resource Sharing (CORS)
    app.use(cors({
      'allowedHeaders': ['sessionId', 'Content-Type'],
      'exposedHeaders': ['sessionId'],
      'origin': '*',
      'methods': 'POST',
      'preflightContinue': false,
    }));

    // Enable Helmet (Basic Protection)
    app.use(helmet());

    // Limits of Requests on API
    const limit = rateLimit({
      /**
       * Max Requests at a Time 1000 Requests in window time.
       */
      max: 1000,
      /**
       * Timer window for above limit in (Miliseconds)
       */
      windowMs: 5000,
      message: 'Too many requests', // message to send
    });

    app.use(xss());
    app.use(expressSanatizer());
    app.use('/', limit);
    app.use(express.json({limit: '5kb'}));
    app.use(bodyParser.urlencoded({extended: true}));
  }

  /** Start Express Server */
  startServer() {
    if (ConfigUtils.get('express.socket')) {
      const httpServer = createServer({key: fs.readFileSync(require.main?.path + '/key.pem'), cert: fs.readFileSync(require.main?.path + '/cert.pem')}, this.app);
      this.io = new Server(httpServer, {'transports': ['websocket']});
      this.startExpress(httpServer);
    } else {
      this.startExpress(this.app);
    }
  }

  /**
   * Start Express Server without Socket.IO
   * @param {express.Application | HttpServer} server
  */
  startExpress(server: Application | HttpServer) {
    const eServer: any = server.listen(ConfigUtils.get('express.PORT'), ConfigUtils.get('express.HOST'), () => {
      const serverInfo: AddressInfo = eServer.address() as AddressInfo;
      console.log('REST API Active and Listing at https://%s:%s on %s Interface', serverInfo.address, serverInfo.port, serverInfo.family);
    });
  }
}
