// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core } from '../../../constants';
import { ModelFactoryInterface } from '../ModelFactoryInterface';
import { CommentCreateParams } from '../ModelCreateParams';
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
     * @returns {Promise<ProposalCreateRequest>}
     */
    public async get(params: CommentCreateParams): Promise<CommentCreateRequest | CommentUpdateRequest> {

        const actionMessage: CommentAddMessage = params.actionMessage;
        const smsgMessage: resources.SmsgMessage = params.smsgMessage;

        const createRequest = {
            sender: actionMessage.sender,
            receiver: actionMessage.receiver,
            type: actionMessage.commentType,
            target: actionMessage.target,
            message: actionMessage.message,
            parent_comment_id: params.parentCommentId,
            generatedAt: actionMessage.generated,

            msgid: smsgMessage ? smsgMessage.msgid : undefined,
            postedAt: smsgMessage ? smsgMessage.sent : undefined,
            expiredAt: smsgMessage ? smsgMessage.expiration : undefined,
            receivedAt: smsgMessage ? smsgMessage.received : undefined
        } as CommentCreateRequest || CommentUpdateRequest;

        createRequest.hash = ConfigurableHasher.hash(createRequest, new HashableCommentCreateRequestConfig());

/*
        commentRequest.hash = ConfigurableHasher.hash({
            ...commentRequest,
            parentCommentHash: actionMessage.parentCommentHash
        }, new HashableCommentCreateRequestConfig());

        // validate that the commentAddMessage.hash should have a matching hash with the incoming or outgoing message
        if (actionMessage.hash !== commentRequest.hash) {
            const error = new HashMismatchException('CommentCreateRequest', actionMessage.hash, commentRequest.hash);
            this.log.error(error.getMessage());
            throw error;
        }
*/
        return createRequest;
    }
}
