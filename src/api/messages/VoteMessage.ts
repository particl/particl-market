// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { VoteMessageType } from '../enums/VoteMessageType';
import { MessageBody } from '../../core/api/MessageBody';
import { VoteMessageInterface } from './VoteMessageInterface';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class VoteMessage extends MessageBody implements VoteMessageInterface {

    @IsNotEmpty()
    @IsEnum(VoteMessageType)
    public action: VoteMessageType;
    public proposalHash: string;
    public proposalOptionHash: string;
    public voter: string;
    public signature: string;
}
