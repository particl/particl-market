import { EnumValue } from 'ts-enums';
export declare class ImageVersion extends EnumValue {
    private name;
    private height;
    private width;
    constructor(name: string, height?: number, width?: number);
    readonly imageHeight: number;
    readonly imageWidth: number;
}
