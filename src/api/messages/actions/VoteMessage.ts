// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MessageBody } from '../../../core/api/MessageBody';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { GovernanceAction } from '../../enums/GovernanceAction';

export class VoteMessage extends MessageBody implements ActionMessageInterface {

    @IsNotEmpty()
    @IsEnum(GovernanceAction)
    public type: GovernanceAction;
    public proposalHash: string;
    public proposalOptionHash: string;
    public voter: string;
    public signature: string;
}
