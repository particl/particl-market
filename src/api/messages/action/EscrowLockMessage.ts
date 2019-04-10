// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../../core/api/MessageBody';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { LockInfo, MPA_LOCK, PaymentDataLock, MPA_CANCEL } from 'omp-lib/dist/interfaces/omp';
import {KVS} from 'omp-lib/dist/interfaces/common';
import { HashableMessageInterface } from './HashableMessageInterface';

export class EscrowLockMessage extends MessageBody implements ActionMessageInterface, MPA_LOCK, HashableMessageInterface {

    @IsNotEmpty()
    @IsEnum(MPAction)
    public type: MPAction.MPA_LOCK;

    @IsNotEmpty()
    public bid: string;

    @IsNotEmpty()
    public buyer: {
        payment: PaymentDataLock;
    };

    @IsNotEmpty()
    public info: LockInfo;

    public objects?: KVS[];

    @IsNotEmpty()
    public generated: number;
    @IsNotEmpty()
    public hash: string;

    public toHashable(): MPA_LOCK {
        const msg = <MPA_LOCK>{
            type: this.type,
            generated: this.generated,
            bid: this.bid,
            buyer: this.buyer,
            info: this.info
        };

        if (this.objects) {
            msg.objects = this.objects;
        }
        
        return msg;
    }
}
