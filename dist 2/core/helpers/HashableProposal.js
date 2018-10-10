"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
class HashableProposal {
    constructor(hashThis) {
        const input = JSON.parse(JSON.stringify(hashThis));
        if (input) {
            this.submitter = input.submitter;
            this.blockStart = input.blockStart;
            this.blockEnd = input.blockEnd;
            this.type = input.type;
            this.title = input.title;
            this.description = input.description;
            this.item = input.item;
            this.options = '';
            input.options = input.options || [];
            for (const option of input.options) {
                this.options = this.options + option.optionId + ':' + option.description + ':';
            }
        }
    }
}
exports.HashableProposal = HashableProposal;
//# sourceMappingURL=HashableProposal.js.map