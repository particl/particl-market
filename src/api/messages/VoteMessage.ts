// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { VoteMessageType } from '../enums/VoteMessageType';
import { MessageBody } from '../../core/api/MessageBody';
import { VoteMessageInterface } from './VoteMessageInterface';

export class VoteMessage extends MessageBody implements VoteMessageInterface {

    // @IsNotEmpty()
    // @IsEnum(VoteMessageType)
    public action: VoteMessageType;

    public proposalHash: string;
    public optionId: number;
    // public optionHash: string; // todo: use hash instead?
    public voter: string; // todo: will be removed later
    public signature: string;
}
