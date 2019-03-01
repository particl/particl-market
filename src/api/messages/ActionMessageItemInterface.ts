// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ProposalMessageType } from '../enums/ProposalMessageType';
import { VoteMessageType } from '../enums/VoteMessageType';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ActionMessageInterface } from './ActionMessageInterface';

type AllowedMessageTypes = MPAction | ProposalMessageType | VoteMessageType;

export interface ActionMessageItemInterface extends ActionMessageInterface {
    action: AllowedMessageTypes;
    item: string;
    objects?: any;
}
