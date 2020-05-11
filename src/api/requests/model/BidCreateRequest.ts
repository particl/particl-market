// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { BidDataCreateRequest } from './BidDataCreateRequest';
import { AddressCreateRequest } from './AddressCreateRequest';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ModelRequestInterface } from './ModelRequestInterface';
import {ActionMessageTypes} from '../../enums/ActionMessageTypes';
import {MPActionExtended} from '../../enums/MPActionExtended';

// tslint:disable:variable-name
export class BidCreateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public listing_item_id: number;
    public parent_bid_id: number;

    public msgid: string;

    // @IsEnum(MPAction || MPActionExtended)
    @IsNotEmpty()
    public type: ActionMessageTypes;

    public address: AddressCreateRequest;
    public address_id: number;

    @IsNotEmpty()
    public bidder: string;
    @IsNotEmpty()
    public hash: string;
    @IsNotEmpty()
    public generatedAt: number;

    public bidDatas: BidDataCreateRequest[];
}
// tslint:enable:variable-name
