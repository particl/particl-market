// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand, CommandParamValidationRules, ParamValidationRule } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ProfileService } from '../../services/model/ProfileService';
import { MarketService } from '../../services/model/MarketService';
import { ProposalAddActionService } from '../../services/action/ProposalAddActionService';
import { ItemVote } from '../../enums/ItemVote';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { ProposalAddRequest } from '../../requests/action/ProposalAddRequest';
import { IdentityService } from '../../services/model/IdentityService';
import { ProposalService } from '../../services/model/ProposalService';
import { VoteRequest } from '../../requests/action/VoteRequest';
import { VoteActionService } from '../../services/action/VoteActionService';


export class ListingItemFlagCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.action.ProposalAddActionService) public proposalAddActionService: ProposalAddActionService,
        @inject(Types.Service) @named(Targets.Service.action.VoteActionService) public voteActionService: VoteActionService
    ) {
        super(Commands.ITEM_FLAG);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [{
                name: 'listingItemId',
                required: true,
                type: 'number'
            }, {
                name: 'identityId',
                required: true,
                type: 'number'
            }, {
                name: 'reason',
                required: false,
                type: 'string',
                defaultValue: 'This ListingItem should be removed.'
            }] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: listingItem: resources.ListingItem
     *  [1]: identity: resources.Identity
     *  [2]: reason
     *  [3]: expiryTime (set in validate)
     *
     * @param data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const listingItem: resources.ListingItem = data.params[0];
        const identity: resources.Identity = data.params[1];
        const description = data.params[2];
        const daysRetention = data.params[3];

        const title = listingItem.hash;
        const options: string[] = [ItemVote.KEEP, ItemVote.REMOVE];

        // get the ListingItem market
        const market: resources.Market = await this.marketService.findOneByProfileIdAndReceiveAddress(identity.Profile.id, listingItem.market)
            .then(value => value.toJSON()); // throws if not found

        const fromAddress = identity.address;
        const toAddress = market.receiveAddress;

        const proposalAddRequest = {
            sendParams: new SmsgSendParams(identity.wallet, fromAddress, toAddress, true, daysRetention, false),
            sender: identity,
            market,
            category: ProposalCategory.ITEM_VOTE, // type should always be ITEM_VOTE when using this command
            title,
            description,
            options,
            target: listingItem.hash
        } as ProposalAddRequest;

        // first post the Proposal
        const smsgSendResponse: SmsgSendResponse = await this.proposalAddActionService.post(proposalAddRequest);

        // then post the Votes for removal
        const proposal: resources.Proposal = await this.proposalService.findOneByMsgId(smsgSendResponse.msgid!).then(value => value.toJSON());

        if (ProposalCategory.ITEM_VOTE === proposal.category || ProposalCategory.MARKET_VOTE === proposal.category) {
            // find the REMOVE option
            const proposalOption: resources.ProposalOption | undefined = _.find(proposal.ProposalOptions, (o: resources.ProposalOption) => {
                return o.description === ItemVote.REMOVE;
            });
            if (!proposalOption) {
                const error = new MessageException('ProposalOption ' + ItemVote.REMOVE + ' not found.');
                this.log.error(error.getMessage());
                throw error;
            }

            // prepare the VoteRequest for sending votes
            const voteRequest = {
                sendParams: proposalAddRequest.sendParams,
                sender: proposalAddRequest.sender,          // Identity
                market: proposalAddRequest.market,
                proposal,
                proposalOption
            } as VoteRequest;

            voteRequest.sendParams.paidMessage = false; // vote messages should be free, proposal messages not

            // we're not calling post here as post will only post a single message
            // send the VoteMessages from each of senders Identity wallets addresses
            const voteSmsgSendResponse = await this.voteActionService.vote(voteRequest);
            smsgSendResponse.msgids = voteSmsgSendResponse.msgids;
            // ProposalResult will be calculated after each vote has been sent...
        } else {
            // should not be possible...
            const error = new MessageException('Invalid ProposalCategory: ' + proposal.category);
            this.log.error(error.getMessage());
            throw error;
        }

        return smsgSendResponse;
    }

    /**
     * data.params[]:
     *  [0]: listingItemId, number
     *  [1]: identityId, number
     *  [2]: reason, string, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const listingItemId: number = data.params[0];
        const identityId: number = data.params[1];
        const reason: string = data.params[2];

        // this.log.debug('data.params: ', JSON.stringify(data.params, null, 2));

        const listingItem: resources.ListingItem = await this.listingItemService.findOne(listingItemId)
            .then(value => value.toJSON())
            .catch(ex => {
                throw new ModelNotFoundException('ListingItem');
            });

        // check if item is already flagged
        if (!_.isEmpty(listingItem.FlaggedItem)) {
            this.log.error('ListingItem is already flagged.');
            throw new MessageException('ListingItem is already flagged.');
        }

        // make sure identity with the id exists
        const identity: resources.Identity = await this.identityService.findOne(identityId)
            .then(value => value.toJSON())
            .catch(ex => {
                throw new ModelNotFoundException('Identity');
            });

        // check whether the identity is used on the ListingItems Market
        const foundMarket = _.find(identity.Markets, market => {
            return market.receiveAddress === listingItem.market;
        });

        if (!foundMarket) {
            throw new MessageException('Given Identity is not used on the Market which the ListingItem was posted to.');
        }

        const daysRetention = Math.ceil((listingItem.expiredAt  - Date.now()) / 1000 / 60 / 60 / 24);

        data.params[0] = listingItem;
        data.params[1] = identity;
        data.params[2] = reason;
        data.params[3] = daysRetention;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemId> <identityId> [reason]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemId>    - number, The id of the ListingItem we want to report. \n'
            + '    <identityId>       - number, The id of the Identity used to report the item. \n'
            + '    <reason>           - [optional] string, Optional reason for the flagging';
    }

    public description(): string {
        return 'Report a ListingItem.';
    }

    public example(): string {
        return 'item 1 1';
    }
}
