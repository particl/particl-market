import { ImageVersion } from './ImageVersion';
export declare class ImageProcessing {
    static milkcat: string;
    static milkcatBroken: string;
    static milkcatSmall: string;
    static milkcatTall: string;
    static milkcatWide: string;
    static PIEXIF_JPEG_START_STR: string;
    /**
     * Takes a PNG, GIF, or JPEG image in base64 string format, and converts it to a JPEG,
     * stripping out the metadata in the process.
     *
     * @param {string} imageRaw
     * @returns {Promise<string>}
     */
    static convertToJPEG(imageRaw: string): Promise<string>;
    /**
     * resize given image to different sized versions
     *
     * @param {string} imageRaw, base64
     * @param {ImageVersion[]} toVersions
     * @returns {Promise<Map<ImageVersion, string>>}
     */
    static resizeImageData(imageRaw: string, toVersions: ImageVersion[]): Promise<Map<string, string>>;
    /**
     * resize a single image to given image version size
     *
     * @param {string} imageRaw, base64
     * @param {ImageVersion} version
     * @returns {Promise<string>}
     */
    static resizeImageToVersion(imageRaw: string, version: ImageVersion): Promise<string>;
}
