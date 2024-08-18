class Upload3DModel {
  public name: string;
  public filePath: string;
  public fileSize: string;

  constructor() {
    this.name = ""
    this.filePath = "";
    this.fileSize = "";
  }

  public setFile(file: File) {
    if(!file) {
      throw new Error('File is required');
    }

    this.name = file.name;
    this.filePath = URL.createObjectURL(file);
    this.fileSize = this.getFileSize(file);
  }

  private getFileSize(file: File) {
    const size = file.size;
    if (size < 1024) {
      return size + 'B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + 'KB';
    } else {
      return (size / 1024 / 1024).toFixed(1) + 'MB';
    }
  }
}

export default Upload3DModel;
