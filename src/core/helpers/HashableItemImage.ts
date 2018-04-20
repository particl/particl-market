/**
 * core.api.HashableItemImage
 *
 */
export class HashableItemImage {

    public protocol: string;
    public imageVersion: string;
    public encoding: string;
    public data: string;
    public originalMime: string;
    public originalName: string;

    constructor(hashThis: any) {
        const input = JSON.parse(JSON.stringify(hashThis));

        if (input) {
            this.protocol       = input.protocol;
            this.imageVersion   = input.imageVersion;
            this.encoding       = input.encoding;
            this.data           = input.data;
            this.originalMime   = input.originalMime;
            this.originalName   = input.originalName;
        }
    }

}
