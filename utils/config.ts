import fs from 'fs';

/**
 * Config Utils
 * Resonsible for handling configuration
 */
export default class ConfigUtils {
  static loadedConfigFile = ConfigUtils.file();

  /**
   * Get Value of The Desired Config Result
   * @param {string} string
   * @return {any}
  */
  public static get(string: string): any {
    let config: any;

    if (ConfigUtils.loadedConfigFile == undefined) {
      config = ConfigUtils.file();
    } else {
      config = ConfigUtils.loadedConfigFile;
    }

    const resolvedData = ConfigUtils.resolve(config, string);

    if (resolvedData == undefined) {
      throw Error('Config Property Not Found');
    }

    return resolvedData;
  }

  /**
   * Get Config From A JSON File.
   * @param {string} filename
   * @return {JSON}
   */
  public static file(): JSON {
    const data = fs.readFileSync(require.main?.path + '/config.json');
    return JSON.parse(data.toString());
  }

  /**
   * Get Config
   * @param {any} jsonObject
   * @param {string} string
   * @return {any}
   */
  private static resolve(jsonObject: any, string: string): string | undefined {
    if (typeof jsonObject !== 'object') {
      throw Error('getProp: obj is not an object');
    }

    if (typeof string !== 'string') {
      throw Error('getProp: prop is not a string');
    }

    // Replace [] notation with dot notation
    string = string.replace(/\[["'`](.*)["'`]\]/g, '.$1');

    return string.split('.').reduce((prev: string, curr: string) => {
      return prev ? prev[curr] : undefined;
    }, jsonObject || self);
  }
}
