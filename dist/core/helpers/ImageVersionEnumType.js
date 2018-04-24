"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_enums_1 = require("ts-enums");
const ImageVersion_1 = require("./ImageVersion");
class ImageVersionEnumType extends ts_enums_1.Enum {
    constructor() {
        super();
        this.ORIGINAL = new ImageVersion_1.ImageVersion('ORIGINAL');
        this.THUMBNAIL = new ImageVersion_1.ImageVersion('THUMBNAIL', 250, 200);
        this.MEDIUM = new ImageVersion_1.ImageVersion('MEDIUM', 400, 400);
        this.LARGE = new ImageVersion_1.ImageVersion('LARGE', 1920, 2560);
        this.initEnum('ImageVersion');
    }
}
exports.ImageVersionEnumType = ImageVersionEnumType;
exports.ImageVersions = new ImageVersionEnumType();
//# sourceMappingURL=ImageVersionEnumType.js.map