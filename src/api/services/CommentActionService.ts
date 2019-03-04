// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { SmsgService } from './SmsgService';

import { CoreRpcService } from './CoreRpcService';
import { MarketService } from './MarketService';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';

import { CommentService } from './CommentService';
import { CommentFactory } from '../factories/CommentFactory';
import { CommentMessage } from '../messages/CommentMessage';
import { CommentMessageType } from '../enums/CommentMessageType';
import { CommentCreateRequest } from '../requests/CommentCreateRequest';
import { CommentUpdateRequest } from '../requests/CommentUpdateRequest';

import { NotImplementedException } from '../exceptions/NotImplementedException';

import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { MessageException } from '../exceptions/MessageException';

export interface CommentTicket {
    type: string;
    marketHash: string;
    address: string;
    target: string;
    parentHash: string;
    message: string;
}

export class CommentActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.CommentFactory) private commentFactory: CommentFactory,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.CommentService) public commentService: CommentService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService
    ) {
        this.log = new Logger(__filename);
    }


    /**
     * Send a public Comment
     *
     * @param {module:resources.ListingItem} listingItem
     * @param {module:resources.Profile} bidderProfile
     * @param {any[]} additionalParams
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async send(@request(CommentCreateRequest) data: CommentCreateRequest): Promise<SmsgSendResponse> {
        this.log.error('1000:');
        let parentCommentHash;
        if (data.parent_comment_id) {
            // Get market parent_comment_hash
            const parentComment = await this.commentService.findOne(data.parent_comment_id);
            parentCommentHash = parentComment.Hash;
        }

        // Get market addr
        const market = await this.marketService.findOne(data.market_id);
        const marketAddr = market.Address;

        /*
         * Validate message size
         */
        // Build the message
        const signature = await this.signComment(data);
        const commentMessage = await this.commentFactory.getMessage(data.type, data.sender, marketAddr,
                                data.target, parentCommentHash, data.message, signature);

        const msg: MarketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: commentMessage
        };

        // Get a fee estimate on the message,
        //  throws error if message too large
        const daysRetention = 2; // 2 days from now // Math.ceil((listingItem.expiredAt - new Date().getTime()) / 1000 / 60 / 60 / 24);
        const tmp = await this.smsgService.smsgSend(data.sender, data.receiver, msg, true, daysRetention);

        // Set postedAt
        data.postedAt = new Date().getTime();

        // create
        this.commentService.create(data);

        // send
        return await this.smsgService.smsgSend(data.sender, data.receiver, msg, false, daysRetention);
    }

    /**
     * process received Comment
     * - save ActionMessage
     * - create Comment
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Comment>}
     */
    public async processCommentReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {

        const commentMessage: CommentMessage = event.marketplaceMessage.mpaction as CommentMessage;
        const comment = event.smsgMessage.from;
        const message = event.marketplaceMessage;

        // type
        if (!message.mpaction || !message.mpaction.item) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        // TODO: Validate comment signature

        // TODO: Check bid with given details doesn't already exist
        // {
        //// TODO: Check comment isn't ours, otherwise ignore
        //// Comment is ours if it already exists and sender is us
        //// 	fetchBySendersAndProposalHash (senders with an s)
        //// {
        //// }
        //// TODO: Update
        // }
        // else {
        //// TODO: Create
        // }
        return SmsgMessageStatus.PROCESSED;
    }

    /**
     * signs the VoteTicket, returns signature
     *
     * @param proposal
     * @param proposalOption
     * @param address
     */
    private async signComment(data: CommentCreateRequest): Promise<string> {
        // Get market marketHash
        const market = await this.marketService.findOne(data.market_id);
        const marketHash = market.Address;

        // Get market parent_comment_hash
        const parentComment = await this.commentService.findOne(data.parent_comment_id);
        const parentCommentHash = parentComment.Hash;

        const commentTicket = {
            type: data.type,
            marketHash,
            address: data.sender,
            target: data.target,
            parentHash: parentCommentHash,
            message: data.message
        } as CommentTicket;

        return await this.coreRpcService.signMessage(data.sender, commentTicket);
    }

    /**
     * verifies CommentTicket, returns boolean
     *
     * @param voteMessage
     * @param address
     */
    private async verifyComment(commentMessage: CommentMessage): Promise<boolean> {
        const commentTicket = {
            type: commentMessage.type,
            marketHash: commentMessage.marketHash,
            address: commentMessage.sender,
            target: commentMessage.target,
            parentHash: commentMessage.parentHash,
            message: commentMessage.message
        } as CommentTicket;
        return await this.coreRpcService.verifyMessage(commentMessage.sender, commentMessage.signature, commentTicket);
    }

}
