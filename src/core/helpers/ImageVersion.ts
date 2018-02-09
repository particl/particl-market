import { Enum, EnumValue } from 'ts-enums';

export class ImageVersion extends EnumValue {

    constructor(private name: string, private height: number = 0, private width: number = 0) {
        super(name);
    }

    get imageHeight(): number {
        return this.height;
    }

    get imageWidth(): number {
        return this.width;
    }
}
