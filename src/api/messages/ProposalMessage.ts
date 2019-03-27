// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MessageBody } from '../../core/api/MessageBody';
import { ProposalCategory } from '../enums/ProposalCategory';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './actions/ActionMessageInterface';
import { GovernanceAction } from '../enums/GovernanceAction';

export class ProposalMessage extends MessageBody implements ActionMessageInterface {

    @IsNotEmpty()
    @IsEnum(GovernanceAction)
    public action: GovernanceAction;
    public submitter: string;
    public title: string;
    public description: string;
    public options: any[];
    public category: ProposalCategory;
    public hash: string;
    public item?: string;   // itemHash

}
