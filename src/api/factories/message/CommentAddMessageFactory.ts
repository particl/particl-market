// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { CommentAddMessage } from '../../messages/action/CommentAddMessage';
import { CommentAction } from '../../enums/CommentAction';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableCommentAddMessageConfig } from '../hashableconfig/message/HashableCommentAddMessageConfig';
import { CommentAddRequest } from '../../requests/action/CommentAddRequest';
import { CoreRpcService } from '../../services/CoreRpcService';
import { VerifiableMessage } from './ListingItemAddMessageFactory';
import { BaseMessageFactory } from './BaseMessageFactory';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';

// todo: move
export interface CommentTicket extends VerifiableMessage {
    address: string;
    type: string;
    target: string;
    message: string;
    parentCommentHash: string;
}

export class CommentAddMessageFactory  extends BaseMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super();
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param {CommentAddRequest} actionRequest
     * @returns {Promise<MarketplaceMessage>}
     */
    public async get(actionRequest: CommentAddRequest): Promise<MarketplaceMessage> {

        const signature = await this.signComment(actionRequest);

        const message = {
            type: CommentAction.MPA_COMMENT_ADD,
            sender: actionRequest.sender.address,
            receiver: actionRequest.receiver,
            commentType: actionRequest.type,
            target: actionRequest.target,
            message: actionRequest.message,
            parentCommentHash: actionRequest.parentComment ? actionRequest.parentComment.hash : '',
            signature,
            generated: +Date.now()
        } as CommentAddMessage;

        message.hash = ConfigurableHasher.hash(message, new HashableCommentAddMessageConfig());

        return await this.getMarketplaceMessage(message);
    }

    /**
     * signs the comment, returns signature
     *
     * @param {CommentAddRequest} data
     */
    private async signComment(data: CommentAddRequest): Promise<string> {
        const commentTicket = {
            type: data.type,
            address: data.sender.address,
            target: data.target,
            parentCommentHash: data.parentComment ? data.parentComment.hash : '',
            message: data.message
        } as CommentTicket;

        return await this.coreRpcService.signMessage(data.sender.wallet, data.sender.address, commentTicket);
    }

}
