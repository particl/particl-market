// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { SmsgService } from '../SmsgService';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { CoreRpcService } from '../CoreRpcService';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { ompVersion } from 'omp-lib/dist/omp';
import { BaseActionService } from '../BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { CommentAddRequest } from '../../requests/action/CommentAddRequest';
import { CommentAddMessage } from '../../messages/action/CommentAddMessage';
import { CommentAddMessageFactory } from '../../factories/message/CommentAddMessageFactory';
import { CommentService } from '../model/CommentService';
import { CommentAddMessageCreateParams } from '../../requests/message/CommentAddMessageCreateParams';
import { CommentCreateRequest } from '../../requests/model/CommentCreateRequest';
import { CommentCreateParams } from '../../factories/model/ModelCreateParams';
import { CommentFactory } from '../../factories/model/CommentFactory';
import { CommentAddValidator } from '../../messagevalidators/CommentAddValidator';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { NotificationType } from '../../enums/NotificationType';
import { NotificationService } from '../NotificationService';
import { IdentityService } from '../model/IdentityService';
import { ActionDirection } from '../../enums/ActionDirection';
import { CommentAddNotification } from '../../messages/notification/CommentAddNotification';
import { CommentAction } from '../../enums/CommentAction';

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
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.NotificationService) public notificationService: NotificationService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.CommentService) public commentService: CommentService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.CommentFactory) private commentFactory: CommentFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.CommentAddMessageFactory) private commentAddMessageFactory: CommentAddMessageFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.CommentAddValidator) public validator: CommentAddValidator,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(CommentAction.MPA_COMMENT_ADD,
            smsgService,
            smsgMessageService,
            notificationService,
            smsgMessageFactory,
            validator,
            Logger
        );
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * @param actionRequest
     */
    public async createMarketplaceMessage(actionRequest: CommentAddRequest): Promise<MarketplaceMessage> {

        // this.log.debug('createMessage, params: ', JSON.stringify(params, null, 2));
        const signature = await this.signComment(actionRequest);
        // this.log.debug('createMessage, signature: ', signature);

        const actionMessage: CommentAddMessage = await this.commentAddMessageFactory.get({
            sender: actionRequest.sender,
            receiver: actionRequest.receiver,
            type: actionRequest.type,
            target: actionRequest.target,
            message: actionRequest.message,
            parentComment: actionRequest.parentComment,
            signature
        } as CommentAddMessageCreateParams);

        return {
            version: ompVersion(),
            action: actionMessage
        } as MarketplaceMessage;
    }

    /**
     * called before post is executed and message is sent
     *
     * @param actionRequest
     * @param marketplaceMessage
     */
    public async beforePost(actionRequest: CommentAddRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
        return marketplaceMessage;
    }


    /**
     * called after post is executed and message is sent
     *
     * @param actionRequest
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public async afterPost(actionRequest: CommentAddRequest,
                           marketplaceMessage: MarketplaceMessage,
                           smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {

        return smsgSendResponse;
    }

    /**
     * send a Comment
     *
     * @param commentAddRequest
     */
    public async send(commentAddRequest: CommentAddRequest): Promise<SmsgSendResponse> {

        // TODO: why not call post directly?
        const smsgSendResponse = await this.post(commentAddRequest);

        const result = {
            result: 'Sent.',
            msgid: smsgSendResponse.msgid
        } as SmsgSendResponse;

        this.log.debug('comment(), result: ', JSON.stringify(result, null, 2));
        return result;
    }

    /**
     * called after posting a message and after receiving it
     *
     * processMessage "processes" the Message (ListingItemAdd/Bid/ProposalAdd/Vote/etc), often creating and/or updating
     * the whatever we're "processing" here.
     *
     * @param marketplaceMessage
     * @param actionDirection
     * @param smsgMessage
     * @param actionRequest, undefined when called from onEvent
     */
    public async processMessage(marketplaceMessage: MarketplaceMessage,
                                actionDirection: ActionDirection,
                                smsgMessage: resources.SmsgMessage,
                                actionRequest?: CommentAddRequest): Promise<resources.SmsgMessage> {

        const commentAddMessage: CommentAddMessage = marketplaceMessage.action as CommentAddMessage;

        let parentCommentId;
        if (commentAddMessage.parentCommentHash) {
            parentCommentId = await this.commentService.findOneByHash(commentAddMessage.parentCommentHash)
            .then(value => value.toJSON().id);
        }
        this.log.debug('processMessage(), commentAddMessage.hash: ', commentAddMessage.hash);

        const comment: resources.Comment = await this.commentService.findOneByHash(commentAddMessage.hash)
            .then(value => value.toJSON())
            .catch(async () => {
                // if Comment doesnt exist yet, we need to create it.

                const commentCreateRequest: CommentCreateRequest = await this.commentFactory.get({
                        msgid: smsgMessage.msgid,
                        sender: commentAddMessage.sender,
                        receiver: commentAddMessage.receiver,
                        type: commentAddMessage.commentType,
                        target: commentAddMessage.target,
                        message: commentAddMessage.message,
                        parentCommentId
                    } as CommentCreateParams,
                    commentAddMessage,
                    smsgMessage) as CommentCreateRequest;

                this.log.debug('processMessage(), commentCreateRequest.hash: ', commentCreateRequest.hash);

                return await this.commentService.create(commentCreateRequest).then(value => value.toJSON());
            });

        // update the time fields each time a message is received
        if (ActionDirection.INCOMING === actionDirection) {
            // means processMessage was called from onEvent() and we should update the Comment data
            await this.commentService.updateTimes(comment.id, smsgMessage.sent, smsgMessage.received, smsgMessage.expiration)
                .then(value => value.toJSON());
            this.log.debug('processMessage(), comment times updated');
        } else {
            // when called from send(), the times do not need to be updated
        }

        return smsgMessage;
    }

    public async createNotification(marketplaceMessage: MarketplaceMessage,
                                    actionDirection: ActionDirection,
                                    smsgMessage: resources.SmsgMessage): Promise<MarketplaceNotification | undefined> {

        // only send notifications when receiving messages
        if (ActionDirection.INCOMING === actionDirection) {

            // only notify if the Comment is not from you
            const comment: resources.Comment = await this.commentService.findOneByMsgId(smsgMessage.msgid)
                .then(value => value.toJSON())
                .catch(err => undefined);

            if (comment) {
                // TODO: this doesn't consider that there could be different Profiles!!!
                const isMyComment = await this.identityService.findOneByAddress(comment.sender).then(value => {
                    return true;
                }).catch(reason => {
                    return false;
                });

                // Dont need notifications about my own comments
                if (isMyComment) {
                    return undefined;
                }

                const notification: MarketplaceNotification = {
                    event: NotificationType.NEW_COMMENT,    // TODO: NotificationType could be replaced with ActionMessageTypes
                    payload: {
                        id: comment.id,
                        hash: comment.hash,
                        target: comment.target,
                        sender: comment.sender,
                        receiver: comment.receiver,
                        commentType: comment.commentType
                    } as CommentAddNotification
                };

                if (comment.ParentComment) {
                    (notification.payload as CommentAddNotification).parent = {
                        id: comment.ParentComment.id,
                        hash: comment.ParentComment.hash
                    } as CommentAddNotification;
                }
                return notification;
            }
        }
        return undefined;
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
