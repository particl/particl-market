// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { SmsgMessageStatus } from '../../api/enums/SmsgMessageStatus';
import {EscrowMessageType} from '../../api/enums/EscrowMessageType';
import {BidMessageType} from '../../api/enums/BidMessageType';
import {VoteMessageType} from '../../api/enums/VoteMessageType';
import {ListingItemMessageType} from '../../api/enums/ListingItemMessageType';
import {ProposalMessageType} from '../../api/enums/ProposalMessageType';

declare module 'resources' {

    interface SmsgMessage {
        // these fields are in the incoming message
        msgid: string;
        version: string;
        read: boolean;
        paid: boolean;
        payloadsize: number;
        received: number;
        sent: number;
        expiration: number;
        daysretention: number;
        from: string;
        to: string;
        text: string; // this should propably be cleared after message has been succesfully processed

        // model also has these
        id: number;
        type: ListingItemMessageType | BidMessageType | EscrowMessageType | ProposalMessageType | VoteMessageType; // | string;
        status: SmsgMessageStatus;

        createdAt: Date;
        updatedAt: Date;
    }

}
