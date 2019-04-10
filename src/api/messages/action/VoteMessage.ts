// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MessageBody } from '../../../core/api/MessageBody';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { GovernanceAction } from '../../enums/GovernanceAction';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { HashableMessageInterface } from './HashableMessageInterface';

export class VoteMessage extends MessageBody implements ActionMessageInterface, HashableMessageInterface {

    @IsNotEmpty()
    @IsEnum(GovernanceAction)
    public type: GovernanceAction.MPA_VOTE;
    @IsNotEmpty()
    public proposalHash: string;
    @IsNotEmpty()
    public proposalOptionHash: string;
    @IsNotEmpty()
    public voter: string;
    @IsNotEmpty()
    public signature: string;

    public objects?: KVS[];

    @IsNotEmpty()
    public hash: string;
    @IsNotEmpty()
    public generated: number;

    // TODO: requires an interface
    public toHashable(): any {
        const msg: any = {
            type: this.type,
            generated: this.generated,
            proposalHash: this.proposalHash,
            proposalOptionHash: this.proposalOptionHash,
            voter: this.voter,
            signature: this.signature
        };

        if (this.objects) {
            msg.objects = this.objects;
        }

        return msg;
    }
}
