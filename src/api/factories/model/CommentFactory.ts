// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core } from '../../../constants';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { CommentCreateParams } from './ModelCreateParams';
import { CommentCreateRequest } from '../../requests/model/CommentCreateRequest';
import { CommentUpdateRequest } from '../../requests/model/CommentUpdateRequest';
import { CommentAddMessage } from '../../messages/action/CommentAddMessage';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashMismatchException } from '../../exceptions/HashMismatchException';
import { HashableCommentCreateRequestConfig } from '../hashableconfig/createrequest/HashableCommentCreateRequestConfig';

export class CommentFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param {CommentCreateParams} params
     * @param {CommentAddMessage} commentMessage
     * @param {resources.SmsgMessage} smsgMessage
     * @returns {Promise<ProposalCreateRequest>}
     */
    public async get(params: CommentCreateParams, commentMessage: CommentAddMessage, smsgMessage?: resources.SmsgMessage):
        Promise<CommentCreateRequest | CommentUpdateRequest> {

        const smsgData: any = {
            postedAt: Number.MAX_SAFE_INTEGER,
            receivedAt: Number.MAX_SAFE_INTEGER,
            expiredAt: Number.MAX_SAFE_INTEGER
        };

        if (smsgMessage) {
            smsgData.postedAt = smsgMessage.sent;
            smsgData.receivedAt = smsgMessage.received;
            smsgData.expiredAt = smsgMessage.expiration;
            smsgData.msgid = smsgMessage.msgid;
        }

        const commentRequest = {
            sender: params.sender,
            receiver: params.receiver,
            type: params.type,
            target: params.target,
            message: params.message,
            parentCommentId: params.parentCommentId,
            ...smsgData
        } as CommentCreateRequest || CommentUpdateRequest;

        commentRequest.hash = ConfigurableHasher.hash({
            ...commentRequest,
            parentCommentHash: commentMessage.parentCommentHash
        }, new HashableCommentCreateRequestConfig());

        // validate that the commentMessage.hash should have a matching hash with the incoming or outgoing message
        if (commentMessage.hash !== commentRequest.hash) {
            const error = new HashMismatchException('CommentCreateRequest', commentMessage.hash, commentRequest.hash);
            this.log.error(error.getMessage());
            throw error;
        }

        return commentRequest;
    }
}
