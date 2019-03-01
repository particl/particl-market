// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { SmsgMessageStatus } from '../../api/enums/SmsgMessageStatus';
import { VoteMessageType } from '../../api/enums/VoteMessageType';
import { ProposalMessageType } from '../../api/enums/ProposalMessageType';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

type AllowedMessageTypes = MPAction | ProposalMessageType | VoteMessageType;

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
        type: AllowedMessageTypes; // | string;
        status: SmsgMessageStatus;

        createdAt: Date;
        updatedAt: Date;
    }

}
