class FileSize {
  constructor() {}

  static formatFileSize(size: number) {
    if (size < 1024) {
      return size + 'B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + 'KB';
    } else if (size < 1024 * 1024 * 1024) {
      return (size / 1024 / 1024).toFixed(1) + 'MB';
    } else {
      return (size / 1024 / 1024 / 1024).toFixed(1) + 'GB';
    }
  }
}

export default FileSize;