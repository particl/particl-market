// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../../core/api/MessageBody';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BuyerData, MPA_BID } from 'omp-lib/dist/interfaces/omp';
import { KVS } from 'omp-lib/dist/interfaces/common';

export class BidMessage extends MessageBody implements ActionMessageInterface, MPA_BID {

    @IsEnum(MPAction)
    @IsNotEmpty()
    public type: MPAction.MPA_BID;

    @IsNotEmpty()
    public generated: number;

    @IsNotEmpty()
    public hash: string;

    @IsNotEmpty()
    public item: string;

    @IsNotEmpty()
    public buyer: BuyerData;

    public objects?: KVS[];

}
