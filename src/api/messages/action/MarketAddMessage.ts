// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { MessageBody } from '../../../core/api/MessageBody';
import { Item } from 'omp-lib/dist/interfaces/omp';
import { ActionMessageInterface } from './ActionMessageInterface';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { MPActionExtended } from '../../enums/MPActionExtended';

export class ListingItemAddMessage extends MessageBody implements ActionMessageInterface {

    @IsEnum(MPActionExtended)
    @IsNotEmpty()
    public type: MPActionExtended.MPA_MARKET_ADD;

    @IsNotEmpty()
    public item: Item;

    @IsNotEmpty()
    public hash: string;

    public objects?: KVS[];

    @IsNotEmpty()
    public generated: number;

}
