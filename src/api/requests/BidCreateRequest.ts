// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { BidDataCreateRequest } from './BidDataCreateRequest';
import { AddressCreateRequest } from './AddressCreateRequest';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

// tslint:disable:variable-name
export class BidCreateRequest extends RequestBody {

    @IsNotEmpty()
    public listing_item_id: number;

    @IsEnum(MPAction)
    @IsNotEmpty()
    public action: MPAction;

    @IsNotEmpty()
    public address: AddressCreateRequest;

    public address_id: number;

    @IsNotEmpty()
    public bidder: string;

    public bidDatas: BidDataCreateRequest[];
}
// tslint:enable:variable-name
