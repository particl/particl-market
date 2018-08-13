// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ProposalMessageType } from '../enums/ProposalMessageType';
import { MessageBody } from '../../core/api/MessageBody';
import { ProposalType } from '../enums/ProposalType';
import { ProposalMessageInterface } from './ProposalMessageInterface';

export class ProposalMessage extends MessageBody implements ProposalMessageInterface {

    // @IsNotEmpty()
    // @IsEnum(BidMessageType)
    public action: ProposalMessageType;
    public item?: string;
    public submitter: string;
    public blockStart: number;
    public blockEnd: number;
    public title: string;
    public description: string;
    public options: any[];
    public type: ProposalType;
    public hash: string;

}
