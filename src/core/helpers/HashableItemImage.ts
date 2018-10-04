// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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
