export enum LogType {
  ERROR = "ERROR",
  WARNING = "WARNING",
  INFO = "INFO"
}

export interface Log {
  logType: LogType,
  message: string
}

class Logger {
  constructor() {}

  static log({logType, message}: {logType: LogType, message: string}): Log {
    let type = LogType.INFO;
    switch (logType) {
      case LogType.ERROR:
        console.error(`${LogType.ERROR}: ${message}`);
        type = LogType.ERROR;
        break;
      case LogType.WARNING:
        console.warn(`${LogType.WARNING}: ${message}`);
        type = LogType.WARNING;
        break;
      case LogType.INFO:
        console.info(`${LogType.INFO}: ${message}`);
        type = LogType.INFO;
        break;
      default:
        console.log(`${LogType.INFO}: ${message}`);
        type = LogType.INFO;
        break;
    }
    return {
      logType: type,
      message,
    }
  }
}

export default Logger;