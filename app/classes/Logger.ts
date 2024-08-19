export enum LogType {
  ERROR = "ERROR",
  WARNING = "WARNING",
  INFO = "INFO"
}

class Logger {
  constructor() {}

  static log({logType, message}: {logType: LogType, message: string}) {
    switch (logType) {
      case LogType.ERROR:
        console.error(`${LogType.ERROR}: ${message}`);
        return `${LogType.ERROR}: ${message}`;
      case LogType.WARNING:
        console.warn(`${LogType.WARNING}: ${message}`);
        return `${LogType.WARNING}: ${message}`;
      case LogType.INFO:
        console.info(`${LogType.INFO}: ${message}`);
        return `${LogType.INFO}: ${message}`;
      default:
        console.log(`${LogType.INFO}: ${message}`);
        return `${LogType.INFO}: ${message}`;
    }
  }
}

export default Logger;