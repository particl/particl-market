// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * core.api.HashableOrder
 *
 */
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BidCreateRequest } from '../../api/requests/BidCreateRequest';

export class HashableBid {

    public bidder: string;
    public generatedAt: number;
    public type: MPAction;
    public bidDatas = '';

    constructor(hashThis: BidCreateRequest) {
        const input: BidCreateRequest = JSON.parse(JSON.stringify(hashThis));

        if (input) {
            this.bidder = input.bidder;
            this.generatedAt = input.generatedAt;
            this.type = input.type;
            input.bidDatas = input.bidDatas.sort();
            for (const item of input.bidDatas) {
                this.bidDatas = this.bidDatas + item.key + ':' + item.value + ':';
            }

        }
    }

}
