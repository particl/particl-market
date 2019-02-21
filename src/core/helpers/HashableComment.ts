// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * core.api.HashableComment
 *
 */
import { CommentCreateRequest } from '../../api/requests/CommentCreateRequest';

export class HashableComment {

    public action: string;
    public sender: string;
    public marketHash: string;
    public target: string;
    public parentHash: string;
    public message: string;

    constructor(hashThis: CommentCreateRequest) {
        const input = JSON.parse(JSON.stringify(hashThis));

        if (input) {
            this.action = input.action;
            this.sender = input.sender;
            this.marketHash = input.marketHash;
            this.target = input.target;
            this.parentHash = input.parentHash;
            this.message = input.message;
        }
    }
}
