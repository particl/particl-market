// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../../core/api/MessageBody';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MPA_BID, PaymentDataBid } from 'omp-lib/dist/interfaces/omp';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { HashableMessageInterface } from './HashableMessageInterface';

export class BidMessage extends MessageBody implements ActionMessageInterface, MPA_BID, HashableMessageInterface {

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
    public buyer: {
        payment: PaymentDataBid;
    };

    public objects?: KVS[];

    public toHashable(): MPA_BID {
        // We have to force the cast here because the interfaces in omp-lib currently require the hash field.
        const msg =  <MPA_BID>{
            type: this.type,
            generated: this.generated,
            item: this.item,
            buyer: this.buyer
        };

        if (this.objects) {
            msg.objects = this.objects;
        }
        return msg;
    }

}
