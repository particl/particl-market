// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { CommentMessage } from '../messages/CommentMessage';
import { CommentMessageType } from '../enums/CommentMessageType';
import { CommentCreateRequest } from '../requests/CommentCreateRequest';
import { CommentUpdateRequest } from '../requests/CommentUpdateRequest';

export class CommentFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param {CommentMessageType} commentMessageType
     * @returns {Promise<CommentMessage>}
     */
    public async getMessage(action: string, sender: string, marketHash: string, target: string,
                            parentHash: string, message: string, signature: string): Promise<CommentMessage> {

        const commentMessage = {
            action,
            sender,
            marketHash,
            target,
            parentHash,
            message,
            signature
        } as CommentMessage;

        return commentMessage;
    }

    /**
     *
     * @param {CommentMessage} voteMessage
     * @param proposalOption
     * @param {number} weight
     * @param create
     * @param smsgMessage
     * @returns {Promise<CommentCreateRequest | CommentUpdateRequest>}
     */
    public async getModel(voteMessage: CommentMessage, proposalOption: resources.ProposalOption, weight: number,
                          create: boolean, smsgMessage?: resources.SmsgMessage): Promise<CommentCreateRequest | CommentUpdateRequest> {

        /*const smsgData: any = {
            postedAt: Number.MAX_SAFE_INTEGER,
            receivedAt: Number.MAX_SAFE_INTEGER,
            expiredAt: Number.MAX_SAFE_INTEGER
        };

        if (smsgMessage) {
            smsgData.postedAt = smsgMessage.sent;
            smsgData.receivedAt = smsgMessage.received;
            smsgData.expiredAt = smsgMessage.expiration;
        }

        if (create) {
            return {
                proposal_option_id: proposalOption.id,
                signature: voteMessage.signature,
                voter: voteMessage.voter,
                weight,
                ...smsgData
            } as VoteCreateRequest;
        } else {
            return {
                proposal_option_id: proposalOption.id,
                signature: voteMessage.signature,
                voter: voteMessage.voter,
                weight,
                ...smsgData
            } as VoteUpdateRequest;
        }*/
    }

}
