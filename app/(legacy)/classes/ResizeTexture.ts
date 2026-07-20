// types
import Texture, { TextureType } from "./Texture";

class ResizeTexture {
  private canvas: HTMLCanvasElement;

  constructor() {
    this.canvas = document.createElement("canvas");
  }

  resize({texture, width}: {texture: TextureType, width: number}) {
    return new Promise((resolve, _) => {
      this.canvas.width = width;
      const image = new Image();
      image.onload = () => {
        const aspectRatio = image.width / image.height;
        const height = Math.round(width / aspectRatio);
        this.canvas.height = height;

        const ctx2d = this.canvas.getContext("2d");
        if (!ctx2d) return;

        ctx2d.drawImage(image, 0, 0, width, height);
        const imageData = ctx2d.getImageData(0, 0, 1, 1).data;
        const isAlpha = imageData[3] < 255 ? true : false;
        const imageSrc = this.canvas.toDataURL(isAlpha ? "image/png" : "image/jpeg");
        this.canvas.remove();
        const resizeTexture = {
          ...texture,
          src: imageSrc,
          width: width,
          height: height,
          fileSize: Texture.getFileSize(imageSrc),
        } as TextureType;
        resolve(resizeTexture)
      };
      image.src = texture.src;
    })
  }
}

export default ResizeTexture;