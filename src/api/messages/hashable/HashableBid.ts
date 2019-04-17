// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * core.api.HashableOrder
 *
 */
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BidCreateRequest } from '../../requests/model/BidCreateRequest';
import { BidDataCreateRequest } from '../../requests/model/BidDataCreateRequest';

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
            // input.bidDatas = input.bidDatas.sort();

            input.bidDatas.sort((a: BidDataCreateRequest, b: BidDataCreateRequest) => {
                if (a.key < b.key) {
                    return 1;
                }
                if (a.key > b.key) {
                    return -1;
                }
                return 0;
            });

            for (const item of input.bidDatas) {
                this.bidDatas = this.bidDatas + item.key + ':' + item.value + ':';
            }

        }
    }

}
