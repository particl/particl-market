"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_enums_1 = require("ts-enums");
class ImageVersion extends ts_enums_1.EnumValue {
    constructor(name, height = 0, width = 0) {
        super(name);
        this.name = name;
        this.height = height;
        this.width = width;
    }
    get imageHeight() {
        return this.height;
    }
    get imageWidth() {
        return this.width;
    }
}
exports.ImageVersion = ImageVersion;
//# sourceMappingURL=ImageVersion.js.map