import images = require('images');

declare const Buffer;

export class ImageProcessing {
    /*
     * Convert to JPEG and strip out metadata.
     * TODO: Error handling for invalid types, or maybe checking type based on args?
     */
    public static prepareImageForSaving(imageRaw: string): string {
        const dataBuffer = Buffer.from(imageRaw, 'base64');
        const imageBuffer = images(dataBuffer);
        imageRaw = imageBuffer.encode('jpg');
        imageRaw = new Buffer(imageRaw).toString('base64');
        return imageRaw;
    }
}
