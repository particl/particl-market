// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { SmsgService } from '../SmsgService';
import { ProfileService } from './ProfileService';

import { CoreRpcService } from '../CoreRpcService';
import { MarketService } from './MarketService';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';

import { CommentService } from '../model/CommentService';
import { CommentFactory } from '../../factories/model/CommentFactory';
import { CommentMessage } from '../../messages/CommentMessage';
import { CommentMessageType } from '../../enums/CommentMessageType';
import { CommentCreateRequest } from '../../requests/CommentCreateRequest';
import { CommentUpdateRequest } from '../../requests/CommentUpdateRequest';

import { NotImplementedException } from '../../exceptions/NotImplementedException';

import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { MessageException } from '../../exceptions/MessageException';

import { ObjectHash } from '../../core/helpers/ObjectHash';
import { HashableObjectType } from '../../enums/HashableObjectType';
import { SearchOrder } from '../../enums/SearchOrder';
import {AddressInfo} from './VoteActionService';
import {Exception} from '../../../core/api/Exception';

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
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService
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
        // Get market addr
        const market = await this.marketService.findOne(data.market_id);
        const marketAddr = market.Address;

        /*
         * Validate message size
         */
        // Build the message
        const signature = await this.signComment(data);
        const commentMessage = await this.commentFactory.getMessage(data.type, data.sender, marketAddr,
                                data.target, data.parent_comment_hash, data.message, signature);

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
        data.expiredAt = new Date().getTime() + daysRetention * 60 * 60 * 24;
        data.receivedAt = new Date().getTime();

        const commentHash = ObjectHash.getHash(data, HashableObjectType.COMMENT_CREATEREQUEST);
        let existingComment;
        try {
            existingComment = await this.commentService.findOneByHash(data.market_id, commentHash);
        } catch (ex) {
            this.log.error('Comment with that hash DOESNT exist');
        }
        if (existingComment) {
            // Comment with that hash exists
            this.log.error(`Comment with hash = ${commentHash} exists`);
            const existingComment2 = await this.commentService.findAllByCommentorsAndCommentHash([ data.sender ], commentHash);
            if (existingComment2) {
                // Comment is ours, just update it
                this.log.error(`Comment with that hash = ${commentHash} exists and belongs to us.`
                               + 'Either hash collision or replica. Ignored locally and not broadcast.');
                const createdComment = await this.commentService.update(existingComment.id, data);
            } else {
                this.log.error('Comment with that hash exists but doesnt belong to us. Hash collision?');
                return {} as SmsgSendResponse;
            }
        } else {
            // Comment doesn't exist in our DB yet
            // Create
            const createdComment = await this.commentService.create(data);
        }

        // send
        return await this.smsgService.smsgSend(data.sender, data.receiver, msg, false, daysRetention);
    }

    /**
     * process received Comment
     * - save ActionMessage
     * - create Comments
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Comment>}
     */
    public async processCommentReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {
        // TODO: Wire this up so its actually called

        const commentMessage: CommentMessage = event.marketplaceMessage.mpaction as CommentMessage;
        const commentReceiver = event.smsgMessage.from;
        const message = event.marketplaceMessage;

        // Validate comment signature
        const verified = this.verifyComment(commentMessage);
        if (!verified) {
            throw new MessageException('Received signature failed validation.');
        }

        // Check comment with given details doesn't already exist
        const commentHash = ObjectHash.getHash(commentMessage, HashableObjectType.COMMENT_CREATEREQUEST);

        const market = await this.marketService.findByAddress(commentMessage.marketHash);
        const marketId = market.id;

        const existingComment = await this.commentService.findOneByHash(marketId, commentHash);
        if (existingComment) {
            // Comment exists
            // Check if comment is ours
            const myAddresses = await this.profileService.findAll();
            const myAddressesStr = myAddresses.map(profile => {
                return profile.Address;
            });

            const existingComment2 = await this.commentService.findAllByCommentorsAndCommentHash(myAddressesStr, commentHash);
            if (existingComment2) {
                // Comment is ours
                this.log.error('Comment is ours');
                return SmsgMessageStatus.IGNORED;
            } else {
                // Comment isn't ours, but we already have it
                this.log.error('Comment is not ours');

                // Update command
                const commentBody = {
                    sender: commentMessage.sender,
                    receiver: commentReceiver,
                    target: commentMessage.target,
                    message: commentMessage.message,
                    type: commentMessage.type,
                    postedAt: event.smsgMessage.sent,
                    receivedAt: event.smsgMessage.received,
                    expiredAt: new Date().getTime() + event.smsgMessage.daysretention * 60 * 60 * 24
                } as CommentUpdateRequest;
                const updatedComment = await this.commentService.update(existingComment.id, commentBody);
                return SmsgMessageStatus.PROCESSED;
            }
        } else {
            // Comment doesn't exist
            // Create it
            const commentBody = {
                sender: commentMessage.sender,
                receiver: commentReceiver,
                target: commentMessage.target,
                message: commentMessage.message,
                type: commentMessage.type,
                postedAt: event.smsgMessage.sent,
                receivedAt: event.smsgMessage.received,
                expiredAt: new Date().getTime() + event.smsgMessage.daysretention * 60 * 60 * 24
            } as CommentCreateRequest;
            const createdComment = await this.commentService.create(commentBody);
            return SmsgMessageStatus.PROCESSED;
        }
        // throw new MessageException('Something went wrong, this code should not be reachable.');
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

        const commentTicket = {
            type: data.type,
            marketHash,
            address: data.sender,
            target: data.target,
            parentHash: data.parent_comment_hash,
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
