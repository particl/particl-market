// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { MessageBody } from '../../../core/api/MessageBody';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { Item, MPA_LISTING_ADD } from 'omp-lib/dist/interfaces/omp';
import { ActionMessageInterface } from './ActionMessageInterface';
import {KVS} from 'omp-lib/dist/interfaces/common';
import { HashableMessageInterface } from './HashableMessageInterface';

export class ListingItemAddMessage extends MessageBody implements ActionMessageInterface, MPA_LISTING_ADD, HashableMessageInterface {

    @IsEnum(MPAction)
    @IsNotEmpty()
    public type: MPAction.MPA_LISTING_ADD;

    @IsNotEmpty()
    public item: Item;

    @IsNotEmpty()
    public hash: string;

    public objects?: KVS[];

    @IsNotEmpty()
    public generated: number;

    public toHashable(): MPA_LISTING_ADD {
        const msg = <MPA_LISTING_ADD>{
            type: this.type,
            generated: this.generated,
            item: this.item
        };

        if (this.objects) {
            msg.objects = this.objects;
        }
        
        return msg;
    }

}
