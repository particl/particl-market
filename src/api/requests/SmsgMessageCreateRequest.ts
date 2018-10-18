// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import { BidMessageType } from '../enums/BidMessageType';
import { VoteMessageType } from '../enums/VoteMessageType';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';

type AllowedMessageTypes = EscrowMessageType | BidMessageType | ListingItemMessageType | ProposalMessageType | VoteMessageType | string;

// tslint:disable:variable-name
export class SmsgMessageCreateRequest extends RequestBody {

    @IsNotEmpty()
    public type: AllowedMessageTypes;

    @IsNotEmpty()
    public status: SmsgMessageStatus;

    @IsNotEmpty()
    public msgid: string;

    @IsNotEmpty()
    public version: string;

    public read: boolean;
    public paid: boolean;
    public payloadsize: number;

    @IsNotEmpty()
    public received: number;

    @IsNotEmpty()
    public sent: number;

    @IsNotEmpty()
    public expiration: number;

    @IsNotEmpty()
    public daysretention: number;

    @IsNotEmpty()
    public from: string;

    @IsNotEmpty()
    public to: string;

    @IsNotEmpty()
    public text: string;

}
// tslint:enable:variable-name
