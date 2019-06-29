// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * core.api.HashableComment
 *
 */
import * as resources from 'resources';
import { CommentCreateRequest } from '../../api/requests/CommentCreateRequest';

type AllowedHashableTypes = resources.Comment | CommentCreateRequest;

export class HashableComment {

    public sender: string;
    public receiver: string;
    public target: string;
    public message: string;
    public type: string;
    // we might need to add some timestamp here

    constructor(hashThis: AllowedHashableTypes) {
        const input = JSON.parse(JSON.stringify(hashThis));

        if (input) {
            this.sender = input.sender;
            this.receiver = input.receiver;
            this.target = input.target;
            this.message = input.message;
            this.type = input.type;
        }
    }
}
