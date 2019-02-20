import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { CommentService } from './CommentService';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';

import { CommentCreateRequest } from '../requests/CommentCreateRequest';

import { NotImplementedException } from '../exceptions/NotImplementedException';

export class CommentActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CommentService) public commentService: CommentService
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
        // TODO: Change this to comment stuff not vote stuff
        const signature = await this.signComment(proposal, proposalOption, senderAddress.address);
        const voteMessage = await this.voteFactory.getMessage(VoteMessageType.MP_VOTE, proposal.hash,
            proposalOption.hash, senderAddress.address, signature);

        const msg: MarketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: voteMessage
        };

        // Get a fee estimate on the message,
        //  throws error if message too large
        return this.smsgService.smsgSend(senderAddress.address, marketplace.address, msg, true, daysRetention);

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
    private async signComment(request: CommentCreateRequest): Promise<string> {
    	const marketHash = this.marketService.findOne(request.marketId);
        const commentTicket = {
        	request.type,
        	marketHash,
        	request.address,
        	request.target,
        	request.parentHash,
        	request.message
        } as CommentTicket;

        return await this.coreRpcService.signMessage(address, commentTicket);
    }
}
