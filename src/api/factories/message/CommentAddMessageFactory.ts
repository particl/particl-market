// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { CommentAddMessage } from '../../messages/action/CommentAddMessage';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import { CommentAction } from '../../enums/CommentAction';
import { CommentAddMessageCreateParams } from '../../requests/message/CommentAddMessageCreateParams';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableCommentAddMessageConfig } from '../hashableconfig/message/HashableCommentAddMessageConfig';

export class CommentAddMessageFactory implements MessageFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param {CommentAddMessageCreateParams} params
     * @returns {Promise<CommentAddMessage>}
     */
    public async get(params: CommentAddMessageCreateParams): Promise<CommentAddMessage> {

        const commentMessage = {
            type: CommentAction.MPA_COMMENT_ADD,
            sender: params.sender.address,
            receiver: params.receiver,
            commentType: params.type,
            target: params.target,
            message: params.message,
            parentCommentHash: params.parentComment ? params.parentComment.hash : '',
            signature: params.signature
        } as CommentAddMessage;

        commentMessage.hash = ConfigurableHasher.hash(commentMessage, new HashableCommentAddMessageConfig());

        return commentMessage;
    }
}
