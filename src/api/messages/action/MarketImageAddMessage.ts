// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { MessageBody } from '../../../core/api/MessageBody';
import { ActionMessageInterface } from './ActionMessageInterface';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { DSN } from 'omp-lib/dist/interfaces/dsn';

export class MarketImageAddMessage extends MessageBody implements ActionMessageInterface {

    @IsEnum(MPActionExtended)
    @IsNotEmpty()
    public type: MPActionExtended.MPA_MARKET_IMAGE_ADD;

    @IsNotEmpty()
    public signature: string;

    @IsNotEmpty()
    public hash: string;            // ItemImage hash

    @IsNotEmpty()
    public data: DSN[];

    @IsNotEmpty()
    public target: string;          // ListingItem hash

    public objects?: KVS[];

    @IsNotEmpty()
    public generated: number;

}
