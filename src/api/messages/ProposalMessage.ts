// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ProposalMessageType } from '../enums/ProposalMessageType';
import { MessageBody } from '../../core/api/MessageBody';
import { ProposalType } from '../enums/ProposalType';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';

export class ProposalMessage extends MessageBody implements ActionMessageInterface {

    @IsNotEmpty()
    @IsEnum(ProposalMessageType)
    public action: ProposalMessageType;
    public submitter: string;
    public title: string;
    public description: string;
    public options: any[];
    public type: ProposalType;
    public hash: string;
    public item?: string;   // itemHash

}
