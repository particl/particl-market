// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../../core/api/MessageBody';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { MPActionExtended } from '../../enums/MPActionExtended';

export class OrderItemShipMessage extends MessageBody implements ActionMessageInterface {

    @IsNotEmpty()
    @IsEnum(MPAction)
    public type: MPActionExtended.MPA_SHIP;

    @IsNotEmpty()
    public bid: string;

    public objects?: KVS[];

    @IsNotEmpty()
    public generated: number;
    @IsNotEmpty()
    public hash: string;

}
