// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Core, Targets, Types } from '../../constants';
import { CoreRpcService } from '../services/CoreRpcService';
import { Logger as LoggerType } from '../../core/Logger';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ValidationException } from '../exceptions/ValidationException';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { MessageException } from '../exceptions/MessageException';
import { CommentAction } from '../enums/CommentAction';
import { ActionDirection } from '../enums/ActionDirection';
import { CommentAddMessage } from '../messages/action/CommentAddMessage';
import { CommentTicket } from '../services/action/CommentAddActionService';

/**
 *
 */
export class CommentAddValidator implements ActionMessageValidatorInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async validateMessage(marketplaceMessage: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        if (!marketplaceMessage.version) {
            throw new MessageException('version: missing');
        }

        if (!marketplaceMessage.action) {
            throw new MessageException('action: missing');
        }

        if (!marketplaceMessage.action.type) {
            throw new MessageException('action.type: missing');
        }

        if (marketplaceMessage.action.type !== CommentAction.MPA_COMMENT_ADD) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + CommentAction.MPA_COMMENT_ADD]);
        }

        const actionMessage: CommentAddMessage = marketplaceMessage.action as CommentAddMessage;

        // verify that the comment was actually sent by the owner of the address
        const verified = await this.verifyComment(actionMessage);
        if (!verified) {
            throw new MessageException('Received signature failed validation.');
        } else {
            this.log.debug('Comment verified!');
        }

        return true;
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        return true;
    }

    /**
     * verifies Comment, returns boolean
     *
     * @param {CommentAddMessage} commentAddMessage
     */
    private async verifyComment(commentAddMessage: CommentAddMessage): Promise<boolean> {
        const commentTicket = {
            address: commentAddMessage.sender,
            type: commentAddMessage.commentType,
            target: commentAddMessage.target,
            parentCommentHash: commentAddMessage.parentCommentHash,
            message: commentAddMessage.message
        } as CommentTicket;

        return await this.coreRpcService.verifyMessage(commentAddMessage.sender, commentAddMessage.signature, commentTicket);
    }
}
