import { ImageTriplet } from './ImageTriplet';
import images = require('images');

declare const Buffer;

export enum MEDIUM_IMAGE_SIZE {
    height = 400,
    width = 400
}

export enum THUMBNAIL_IMAGE_SIZE {
    height = 250,
    width = 200
}

export class ImageProcessing {
    public static PIEXIF_JPEG_START_STR: string = 'data:image/jpeg;base64,';

    /*
     * Takes a PNG, GIF, or JPEG image in base64 string format, and converts it to a JPEG, stripping out the metadata in the process.
     * Then resize the image to three sizes and return them.
     * TODO: Error handling for invalid types, or maybe checking type based on args?
     */
    public static prepareImageForSaving(imageRaw: string): ImageTriplet {
        // Convert image to JPEG (and strip metadata in the process)
        // TODO: trycatch 'Unknow format'
        let imageBuffer;
        try {
            const dataBuffer = Buffer.from(imageRaw, 'base64');
            imageBuffer = images(dataBuffer);
        } catch ( ex ) {
            if( ex.toString() === 'Error: ../src/Image.cc:341 Unknow format' ){
                throw new Error('Image data was an unknown format. Supports: JPEG, PNG, GIF.');
            }
            else {
                throw ex;
            }
        }

        imageRaw = imageBuffer.encode('jpg');
        imageRaw = new Buffer(imageRaw).toString('base64');

        // Resize to three sizes (big, medium, and thumbnail)
        const imageResized: ImageTriplet = this.tripleSizeImage(imageRaw);

        return imageResized;
    }

    /*
     * Takes a JPEG image in base64 string format and resizes it to three different sizes, big, medium, and thumbmail.
     */
    public static tripleSizeImage(imageRaw: string): ImageTriplet {
        // Shrink medium image
        let medImage: string = this.resizeImage(imageRaw, MEDIUM_IMAGE_SIZE.width, MEDIUM_IMAGE_SIZE.height);

        // Shrink thumbnail image
        let thumbImage: string = this.resizeImage(imageRaw, THUMBNAIL_IMAGE_SIZE.width, THUMBNAIL_IMAGE_SIZE.height);

        return {
            big: imageRaw,
            medium: medImage,
            thumbnail: thumbImage
        } as ImageTriplet;
    }

    /*
     * Resize a single image.
     */
    public static resizeImage(imageRaw: string, maxWidth: number, maxHeight: number): string {
        const dataBuffer = Buffer.from(imageRaw, 'base64');
        const imageBuffer = images(dataBuffer);

        const widthScale = maxWidth / imageBuffer.width();
        const heightScale = maxHeight / imageBuffer.height();
        const scale = Math.min(heightScale, widthScale);
        const resizedImage = imageBuffer.resize(
            imageBuffer.width() * scale,
            imageBuffer.height() * scale
        );
        
        return new Buffer(resizedImage.encode('jpg')).toString('base64');
    }
}
