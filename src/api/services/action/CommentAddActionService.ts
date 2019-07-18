// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { SmsgService } from '../SmsgService';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { CoreRpcService } from '../CoreRpcService';
import { MessageException } from '../../exceptions/MessageException';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { ompVersion } from 'omp-lib/dist/omp';
import { BaseActionService } from './BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { CommentAddRequest } from '../../requests/action/CommentAddRequest';
import { CommentAddMessage } from '../../messages/action/CommentAddMessage';
import { CommentAddMessageFactory } from '../../factories/message/CommentAddMessageFactory';
import { CommentService } from '../model/CommentService';
import { CommentAddMessageCreateParams } from '../../requests/message/CommentAddMessageCreateParams';
import { CommentCreateRequest } from '../../requests/model/CommentCreateRequest';
import { CommentCreateParams } from '../../factories/model/ModelCreateParams';
import { CommentFactory } from '../../factories/model/CommentFactory';
import { CommentAddValidator } from '../../messages/validator/CommentValidator';

export interface CommentTicket {
    address: string;
    type: string;
    target: string;
    message: string;
    parentCommentHash: string;
}

export class CommentAddActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,

        @inject(Types.Factory) @named(Targets.Factory.message.CommentAddMessageFactory) private commentAddMessageFactory: CommentAddMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.CommentFactory) private commentFactory: CommentFactory,
        @inject(Types.Service) @named(Targets.Service.model.CommentService) public commentService: CommentService,

        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(smsgService, smsgMessageService, smsgMessageFactory);
        this.log = new Logger(__filename);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * @param params
     */
    public async createMessage(params: CommentAddRequest): Promise<MarketplaceMessage> {

        // this.log.debug('createMessage, params: ', JSON.stringify(params, null, 2));
        const signature = await this.signComment(params);
        // this.log.debug('createMessage, signature: ', signature);

        const actionMessage: CommentAddMessage = await this.commentAddMessageFactory.get({
            sender: params.sender,
            receiver: params.receiver,
            type: params.type,
            target: params.target,
            message: params.message,
            parentComment: params.parentComment,
            signature
        } as CommentAddMessageCreateParams);

        return {
            version: ompVersion(),
            action: actionMessage
        } as MarketplaceMessage;
    }

    /**
     * validate the MarketplaceMessage to which is to be posted to the network
     *
     * @param marketplaceMessage
     */
    public async validateMessage(marketplaceMessage: MarketplaceMessage): Promise<boolean> {
        return CommentAddValidator.isValid(marketplaceMessage);
    }

    /**
     * called before post is executed and message is sent
     *
     * @param params
     * @param marketplaceMessage
     */
    public async beforePost(commentRequest: CommentAddRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
        return marketplaceMessage;
    }


    /**
     * called after post is executed and message is sent
     *
     * @param params
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public async afterPost(commentRequest: CommentAddRequest, marketplaceMessage: MarketplaceMessage, smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {

        // processVote "processes" the Vote, creating or updating the Vote.
        // called from both beforePost() and onEvent()
        // TODO: currently do not pass smsgMessage to the processVote here as that would set the values from smsgMessage
        // TODO: maybe add received or similar flag instead of this

        await this.processComment(marketplaceMessage.action as CommentAddMessage);

        if (smsgSendResponse.msgid) {
            await this.commentService.updateMsgId(marketplaceMessage.action.hash, smsgSendResponse.msgid);
        } else {
            throw new MessageException('Failed to set Comment msgid');
        }

        return smsgSendResponse;
    }

    /**
     * send a coment
     *
     * @param commentRequest
     */
    public async send(commentRequest: CommentAddRequest): Promise<SmsgSendResponse> {

        const smsgSendResponse = await this.post(commentRequest);

        const result = {
            result: 'Sent.',
            msgid: smsgSendResponse.msgid
        } as SmsgSendResponse;

        this.log.debug('comment(), result: ', JSON.stringify(result, null, 2));
        return result;
    }

    /**
     */
    public async processComment(commentAddMessage: CommentAddMessage, smsgMessage?: resources.SmsgMessage): Promise<resources.Comment | undefined> {

        let parentCommentId;
        if (commentAddMessage.parentCommentHash) {
            parentCommentId = await this.commentService.findOneByHash(commentAddMessage.parentCommentHash)
            .then(value => value.toJSON().id);
        }
        const commentRequest: CommentCreateRequest = await this.commentFactory.get({
            msgid: smsgMessage ? smsgMessage.msgid : '',
            sender: commentAddMessage.sender,
            receiver: commentAddMessage.receiver,
            type: commentAddMessage.commentType,
            target: commentAddMessage.target,
            message: commentAddMessage.message,
            parentCommentId
        } as CommentCreateParams, commentAddMessage, smsgMessage);

        this.log.debug('processComment(), commentAddMessage.hash: ', commentAddMessage.hash);
        this.log.debug('processComment(), commentRequest.hash: ', commentRequest.hash);

        let comment: resources.Comment = await this.commentService.findOneByHash(commentRequest.hash)
            .then(value => value.toJSON())
            .catch(async () => {

                // comment doesnt exist yet, so we need to create it.
                const createdComment: resources.Comment = await this.commentService.create(commentRequest).then(value => value.toJSON());

                return await this.commentService.findOne(createdComment.id).then(value => value.toJSON());
            });

        if (commentRequest.postedAt !== Number.MAX_SAFE_INTEGER) {
            // means processComment was called from onEvent() and we should update the Comment data
            comment = await this.commentService.updateTimes(comment.id, commentRequest.postedAt, commentRequest.receivedAt,
                commentRequest.expiredAt).then(value => value.toJSON());
            this.log.debug('processComment(), comment updated');
        } else {
            // called from send(), we already created the Comment so nothing else needs to be done
        }

        // this.log.debug('processComment(), comment:', JSON.stringify(comment, null, 2));
        return comment;
    }

    /**
     * signs the comment, returns signature
     *
     * @param proposal
     * @param proposalOption
     * @param address
     */
    private async signComment(data: CommentAddRequest): Promise<string> {
        const commentTicket = {
            type: data.type,
            address: data.sender.address,
            target: data.target,
            parentCommentHash: data.parentComment ? data.parentComment.hash : '',
            message: data.message
        } as CommentTicket;

        return await this.coreRpcService.signMessage(data.sender.address, commentTicket);
    }

    /**
     * verifies Comment, returns boolean
     *
     * @param voteMessage
     * @param address
     */
    private async verifyVote(commentAddMessage: CommentAddMessage): Promise<boolean> {
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
