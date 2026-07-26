import FileSize from "../utils/FileSize";

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
    if(this.isUnSupportedFileType(file.name)) {
      throw new Error('Unsupported file type');
      // TODO: アラートを表示する
    }

    this.name = file.name;
    this.filePath = URL.createObjectURL(file);
    this.fileSize = this.getFileSize(file);
  }

  private getFileSize(file: File) {
    const size = file.size;
    return FileSize.formatFileSize(size);
  }

  private isUnSupportedFileType(fileName: string) {
    const supportedFileTypes = ['glb', 'gltf'];
    const extension = fileName.split('.').pop() || "";
    return !supportedFileTypes.includes(extension);
  }
}

export default Upload3DModel;
