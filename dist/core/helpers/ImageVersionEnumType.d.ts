import { Enum } from 'ts-enums';
import { ImageVersion } from './ImageVersion';
export declare class ImageVersionEnumType extends Enum<ImageVersion> {
    ORIGINAL: ImageVersion;
    THUMBNAIL: ImageVersion;
    MEDIUM: ImageVersion;
    LARGE: ImageVersion;
    constructor();
}
export declare const ImageVersions: ImageVersionEnumType;
