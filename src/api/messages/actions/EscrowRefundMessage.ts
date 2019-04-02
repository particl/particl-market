// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../../core/api/MessageBody';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BuyerData, MPA_REFUND} from 'omp-lib/dist/interfaces/omp';
import {KVS} from 'omp-lib/dist/interfaces/common';

export class EscrowRefundMessage extends MessageBody implements ActionMessageInterface, MPA_REFUND {

    @IsNotEmpty()
    @IsEnum(MPAction)
    public type: MPAction.MPA_REFUND;

    @IsNotEmpty()
    public bid: string;

    @IsNotEmpty()
    public buyer: BuyerData;

    public objects?: KVS[];

}
