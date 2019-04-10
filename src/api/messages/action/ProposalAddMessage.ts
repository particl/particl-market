// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MessageBody } from '../../../core/api/MessageBody';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';
import { GovernanceAction } from '../../enums/GovernanceAction';
import {MPAction} from 'omp-lib/dist/interfaces/omp-enums';
import {KVS} from 'omp-lib/dist/interfaces/common';
import { HashableMessageInterface } from './HashableMessageInterface';

export class ProposalAddMessage extends MessageBody implements ActionMessageInterface, HashableMessageInterface {

    @IsNotEmpty()
    @IsEnum(GovernanceAction)
    public type: GovernanceAction.MPA_PROPOSAL_ADD;
    @IsNotEmpty()
    public submitter: string;
    @IsNotEmpty()
    public title: string;
    @IsNotEmpty()
    public description: string;
    @IsNotEmpty()
    public options: any[];
    @IsNotEmpty()
    public category: ProposalCategory;
    @IsNotEmpty()
    public hash: string;
    public item?: string;   // itemHash

    public objects?: KVS[];

    @IsNotEmpty()
    public generated: number;

    // TODO: requires an interface
    public toHashable(): any {
        const msg: any = {
            type: this.type,
            generated: this.generated,
            submitter: this.submitter, // I'm pretty sure this field is untrusted! Do not rely on it, use sender of message instead.
            title: this.title,
            description: this.description,
            options: this.options,
            category: this.category,
        };

        if (this.item) {
            msg.item = this.item;
        }

        if (this.objects) {
            msg.objects = this.objects;
        }

        return msg;
    }

}
