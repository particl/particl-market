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
    public async send(@request(CommentCreateRequest) data: CommentCreateRequest): Promise<SmsgSendResponse> {
        /*
         * Validate message size
         */
        // Build the message
        const signature = await this.signComment(data);
        const commentMessage = await this.commentFactory.getMessage(data.action, data.sender, data.marketHash,
                                data.target, data.parentHash, data.message, signature);

        const msg: MarketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: commentMessage
        };

        // Get a fee estimate on the message,
        //  throws error if message too large
        const daysRetention = 2; // 2 days from now // Math.ceil((listingItem.expiredAt - new Date().getTime()) / 1000 / 60 / 60 / 24);
        const tmp = this.smsgService.smsgSend(data.sender, data.marketHash, msg, true, daysRetention);

        // create
        this.commentService.create(data);

        // send
        throw new NotImplementedException();
    }

    /**
     * signs the VoteTicket, returns signature
     *
     * @param proposal
     * @param proposalOption
     * @param address
     */
    private async signComment(data: CommentCreateRequest): Promise<string> {
        const commentTicket = {
            type: data.action,
            marketHash: data.marketHash,
            address: data.sender,
            target: data.target,
            parentHash: data.parentHash,
            message: data.message
        } as CommentTicket;

        return await this.coreRpcService.signMessage(data.sender, commentTicket);
    }
}
