// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { MessageBody } from '../../../core/api/MessageBody';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { MarketType } from '../../enums/MarketType';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ContentReference } from 'omp-lib/dist/interfaces/dsn';
import {MarketRegion} from '../../enums/MarketRegion';

export class MarketAddMessage extends MessageBody implements ActionMessageInterface {

    @IsEnum(MPActionExtended)
    @IsNotEmpty()
    public type: MPActionExtended.MPA_MARKET_ADD;

    @IsNotEmpty()
    public name: string;
    public description: string;
    public marketType: MarketType;
    public region: string;

    public receiveKey: string;
    public publishKey: string;

    public image: ContentReference;

    @IsNotEmpty()
    public generated: number;
    public objects?: KVS[];
    @IsNotEmpty()
    public hash: string;
}
