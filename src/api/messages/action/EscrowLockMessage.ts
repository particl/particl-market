// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:variable-name
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../../core/api/MessageBody';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BuyerData, LockInfo, MPA_LOCK } from 'omp-lib/dist/interfaces/omp';
import { KVS } from 'omp-lib/dist/interfaces/common';

export class EscrowLockMessage extends MessageBody implements ActionMessageInterface, MPA_LOCK {

    @IsNotEmpty()
    @IsEnum(MPAction)
    public type: MPAction.MPA_LOCK;

    @IsNotEmpty()
    public bid: string;

    @IsNotEmpty()
    public buyer: BuyerData;

    @IsNotEmpty()
    public info: LockInfo;

    public objects?: KVS[];

    @IsNotEmpty()
    public generated: number;
    @IsNotEmpty()
    public hash: string;
}
// tslint:enable:variable-name
