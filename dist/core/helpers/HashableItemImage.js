"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * core.api.HashableItemImage
 *
 */
class HashableItemImage {
    constructor(hashThis) {
        const input = JSON.parse(JSON.stringify(hashThis));
        if (input) {
            this.protocol = input.protocol;
            this.imageVersion = input.imageVersion;
            this.encoding = input.encoding;
            this.data = input.data;
            this.originalMime = input.originalMime;
            this.originalName = input.originalName;
        }
    }
}
exports.HashableItemImage = HashableItemImage;
//# sourceMappingURL=HashableItemImage.js.map