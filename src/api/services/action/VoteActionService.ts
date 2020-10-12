// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { VoteCreateRequest } from '../../requests/model/VoteCreateRequest';
import { SmsgService } from '../SmsgService';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { EventEmitter } from 'events';
import { VoteFactory } from '../../factories/model/VoteFactory';
import { VoteService } from '../model/VoteService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { CoreRpcService } from '../CoreRpcService';
import { MessageException } from '../../exceptions/MessageException';
import { VoteMessage } from '../../messages/action/VoteMessage';
import { ProposalService } from '../model/ProposalService';
import { ProposalOptionService } from '../model/ProposalOptionService';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { ListingItemService } from '../model/ListingItemService';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { ProposalResultService } from '../model/ProposalResultService';
import { VoteUpdateRequest } from '../../requests/model/VoteUpdateRequest';
import { VoteMessageFactory } from '../../factories/message/VoteMessageFactory';
import { VoteCreateParams } from '../../factories/ModelCreateParams';
import { BaseActionService } from '../BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { VoteRequest } from '../../requests/action/VoteRequest';
import { RpcUnspentOutput } from 'omp-lib/dist/interfaces/rpc';
import { VoteValidator } from '../../messagevalidators/VoteValidator';
import { toSatoshis } from 'omp-lib/dist/util';
import { ItemVote } from '../../enums/ItemVote';
import { OutputType } from 'omp-lib/dist/interfaces/crypto';
import { MarketService } from '../model/MarketService';
import { FlaggedItemService } from '../model/FlaggedItemService';
import { BlacklistService } from '../model/BlacklistService';
import { GovernanceAction } from '../../enums/GovernanceAction';
import { NotificationService } from '../NotificationService';
import { ActionDirection } from '../../enums/ActionDirection';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';

// todo: move
export interface AddressInfo {
    address: string;
    balance: number;            // in satoshis
}

export interface CombinedVote {
    voter: string;
    count: number;
    weight: number;
    postedAt: number;
    receivedAt: number;
    expiredAt: number;
    votedProposalOption: resources.ProposalOption;
    proposalOptions: resources.ProposalOption[];
    createdAt: number;
    updatedAt: number;
}

export class VoteActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.NotificationService) public notificationService: NotificationService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalResultService) public proposalResultService: ProposalResultService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalOptionService) public proposalOptionService: ProposalOptionService,
        @inject(Types.Service) @named(Targets.Service.model.VoteService) public voteService: VoteService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.FlaggedItemService) public flaggedItemService: FlaggedItemService,
        @inject(Types.Service) @named(Targets.Service.model.BlacklistService) public blacklistService: BlacklistService,
        @inject(Types.Factory) @named(Targets.Factory.message.VoteMessageFactory) private actionMessageFactory: VoteMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.VoteFactory) private voteFactory: VoteFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.VoteValidator) public validator: VoteValidator,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(GovernanceAction.MPA_VOTE,
            smsgService,
            smsgMessageService,
            notificationService,
            smsgMessageFactory,
            validator,
            Logger);
        this.log = new Logger(__filename);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * @param actionRequest
     */
    public async createMarketplaceMessage(actionRequest: VoteRequest): Promise<MarketplaceMessage> {
        return await this.actionMessageFactory.get(actionRequest);
    }

    /**
     * called before post is executed and message is sent
     *
     * @param actionRequest
     * @param marketplaceMessage
     */
    public async beforePost(actionRequest: VoteRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
        this.log.debug('beforePost(), marketplaceMessage:', JSON.stringify(marketplaceMessage, null, 2));
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
    public async afterPost(actionRequest: VoteRequest,
                           marketplaceMessage: MarketplaceMessage,
                           smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {
        return smsgSendResponse;
    }

    /**
     * vote for given Proposal and ProposalOption using all identity wallet addresses
     *
     * @param voteRequest
     */
    public async vote(voteRequest: VoteRequest): Promise<SmsgSendResponse[]> {

        const addressInfos: AddressInfo[] = await this.getPublicWalletAddressInfos(voteRequest.sender.wallet, 0);

        if (_.isEmpty(addressInfos)) {
            this.log.error('Wallet has no usable addresses for voting.');

            // not throwing since this is not really an error
            return [{
                result: 'Wallet has no usable addresses for voting.'
            }] as SmsgSendResponse[];
        }

        const smsgSendResponses: SmsgSendResponse[] = [];
        for (const addressInfo of addressInfos) {
            this.log.debug('================================================');
            this.log.debug('vote(), addressInfo: ', JSON.stringify(addressInfo, null, 2));

            if (addressInfo.balance > 0) {
                // change sender to be the output address, then post the vote
                voteRequest.sendParams.fromAddress = addressInfo.address;
                voteRequest.addressInfo = addressInfo;

                await this.post(voteRequest).then(async smsgSendResponse => {
                    // const vote: resources.Vote = await this.voteService.findOneByMsgId(smsgSendResponse.msgid!).then(value => value.toJSON());
                    smsgSendResponses.push(smsgSendResponse);
                });
            }
        }

        if (voteRequest.proposal.category !== ProposalCategory.PUBLIC_VOTE) {
            for (const flaggedItem of voteRequest.proposal.FlaggedItems) {
                const proposalResult: resources.ProposalResult = await this.proposalResultService.findLatestByProposalHash(voteRequest.proposal.hash)
                    .then(value => value.toJSON());
                await this.setRemovedFlags(voteRequest); // todo: remove, sets the removed on ListingItem or Market
            }

            await this.blacklistService.updateBlacklistsByVote(voteRequest);
        }

        return smsgSendResponses;
    }

    /**
     * processMessage "processes" the Vote, creating or updating the Vote.
     * called from send() and onEvent(), meaning before the VoteMessage is sent
     * and after the VoteMessage is received.
     *
     * - processMessage()
     *   - verify the vote is valid
     *     - verifymessage address votemessage.signature votemessage.voteticket
     *     - get the balance for the address
     *   - if Vote is valid and has balance:
     *     - save/update Vote locally (update: add the fields from smsgmessage)
     *     - proposalService.recalculateProposalResult(proposal)
     *     - if ITEM_VOTE
     *       - check if listingitem should be removed
     *
     * @param marketplaceMessage
     * @param actionDirection
     * @param actionRequest
     * @param smsgMessage
     */
    public async processMessage(marketplaceMessage: MarketplaceMessage,
                                actionDirection: ActionDirection,
                                smsgMessage: resources.SmsgMessage,
                                actionRequest?: VoteRequest): Promise<resources.SmsgMessage> {

        this.log.debug('processMessage(), actionDirection: ', actionDirection);

        const voteMessage: VoteMessage = marketplaceMessage.action as VoteMessage;

        let proposal: resources.Proposal = await this.proposalService.findOneByHash(voteMessage.proposalHash).then(value => value.toJSON());

        if (smsgMessage && smsgMessage.sent > proposal.expiredAt) {
            this.log.error('Vote is invalid, it was sent after Proposal expiration.');
            return smsgMessage;
        }

        if (smsgMessage && Date.now() > proposal.expiredAt) {
            this.log.error('Vote is invalid, Proposal has already been expired.');
            return smsgMessage;
        }

        const votedProposalOption = await this.proposalOptionService.findOneByHash(voteMessage.proposalOptionHash).then(value => value.toJSON());
        const votingAddressBalance = await this.coreRpcService.getAddressBalance(voteMessage.voter).then(value => parseInt(value.balance, 10));

        const vote: resources.Vote = await this.voteService.findOneByVoterAndProposalId(voteMessage.voter, proposal.id)
            .then(async value => {
                const foundVote: resources.Vote = value.toJSON();
                const voteUpdateRequest: VoteUpdateRequest = await this.voteFactory.get({
                        actionMessage: voteMessage,
                        smsgMessage,
                        msgid: smsgMessage.msgid,
                        proposalOption: votedProposalOption,
                        weight: votingAddressBalance
                    } as VoteCreateParams);
                return await this.voteService.update(foundVote.id, voteUpdateRequest).then(value2 => value2.toJSON());
            })
            .catch(async () => {
                this.log.debug('did not find Vote, creating...');
                const voteCreateRequest: VoteCreateRequest = await this.voteFactory.get({
                        actionMessage: voteMessage,
                        smsgMessage,
                        msgid: smsgMessage ? smsgMessage.msgid : undefined,
                        proposalOption: votedProposalOption,
                        weight: votingAddressBalance
                    } as VoteCreateParams);
                return await this.voteService.create(voteCreateRequest).then(value => value.toJSON());
            });

        // after creating/updating the Vote, recalculate the ProposalResult
        proposal = await this.proposalService.findOne(vote.ProposalOption.Proposal.id).then(value => value.toJSON());
        const proposalResult: resources.ProposalResult = await this.proposalService.recalculateProposalResult(proposal);

        // after recalculating the ProposalResult, we can now update the removed flags for flaggedItems
        for (const flaggedItem of proposal.FlaggedItems) {

            // todo: remove, sets the removed on ListingItem or Market, replaced by blacklisting
            await this.flaggedItemService.setRemovedFlagIfNeeded(flaggedItem.id, proposalResult, vote);

            // blacklists will be updated when the
        }

        return smsgMessage;
    }

    public async createNotification(marketplaceMessage: MarketplaceMessage,
                                    actionDirection: ActionDirection,
                                    smsgMessage: resources.SmsgMessage): Promise<MarketplaceNotification | undefined> {
        // undefined -> don't send notifications
        return undefined;
    }


    /**
     * Get SummaryVote for a Proposal
     *
     * @param identity
     * @param proposal
     */
    public async getCombinedVote(identity: resources.Identity, proposal: resources.Proposal): Promise<CombinedVote> {

        // TODO: move this and getPublicWalletAddressInfos elsewhere, maybe VoteService
        const addressInfos: AddressInfo[] = await this.getPublicWalletAddressInfos(identity.wallet);
        this.log.debug('getCombinedVote(), addressInfos:', JSON.stringify(addressInfos, null, 2));

        const addresses = addressInfos.map(addressInfo => {
            return addressInfo.address;
        });
        this.log.debug('getCombinedVote(), addresses:', JSON.stringify(addresses, null, 2));

        const votes: resources.Vote[] = await this.voteService.findAllByVotersAndProposalHash(addresses, proposal.hash)
            .then(value => value.toJSON());

        // this.log.debug('getCombinedVote(), votes:', JSON.stringify(votes, null, 2));

        const combinedVote = {
            voter: identity.address,
            weight: 0,
            count: 0,
            postedAt: Date.now(),
            receivedAt: Date.now(),
            expiredAt: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            // votedProposalOption: undefined,
            proposalOptions: proposal.ProposalOptions
        } as CombinedVote;

        for (const vote of votes) {
            combinedVote.weight = combinedVote.weight + vote.weight;
            combinedVote.votedProposalOption = vote.ProposalOption;
            combinedVote.count = combinedVote.count + 1;
        }

        return combinedVote;
    }

    /**
     * update the removed flags based on proposal category, user is voting, so set the flag based on the vote
     * todo: remove this, should be replaced with blacklist
     *
     * @param voteRequest
     */
    private async setRemovedFlags(voteRequest: VoteRequest): Promise<void> {

        const remove = voteRequest.proposalOption.description === ItemVote.REMOVE.toString();

        for (const flaggedItem of voteRequest.proposal.FlaggedItems) {

            switch (voteRequest.proposal.category) {
                case ProposalCategory.ITEM_VOTE:
                    if (_.isNil(flaggedItem.ListingItem)) {
                        return; // should not happen
                    }
                    await this.listingItemService.setRemovedFlag(flaggedItem.ListingItem!.id, remove);
                    break;

                case ProposalCategory.MARKET_VOTE:
                    if (_.isNil(flaggedItem.Market)) {
                        return; // should not happen
                    }
                    await this.marketService.setRemovedFlag(flaggedItem.Market!.id, remove);
                    break;

                default:
                    break;
            }
        }
    }



    /**
     * get the Identity wallets addresses
     * minimum 1 confirmations, ones without balance not included
     *
     * @param wallet
     * @param minconf
     */
    private async getPublicWalletAddressInfos(wallet: string, minconf: number = 0): Promise<AddressInfo[]> {
        const addressList: AddressInfo[] = [];
        const outputs: RpcUnspentOutput[] = await this.coreRpcService.listUnspent(wallet, OutputType.PART, minconf); // , 9999999, addresses);

        this.log.debug('getPublicWalletAddressInfos(), outputs.length: ', outputs.length);

        for (const output of outputs) {
            if (output.spendable && output.solvable && output.safe && output.amount > 0) {
                // we could have multiple outputs from one address and we only want to send one Vote per address.
                const exists = _.find(addressList, addressInfo => {
                    return addressInfo.address === output.address;
                });

                if (!exists) {
                    addressList.push({
                        address: output.address,
                        balance: toSatoshis(output.amount)
                    } as AddressInfo);
                } else {
                    this.log.error('output address already on addressList');
                }

            } else {
                if (output.amount <= 0) {
                    this.log.error('unusable output (amount): ', JSON.stringify(output, null, 2));
                } else {
                    this.log.error('unusable output (!spendable || !solvable || !safe): ', JSON.stringify(output, null, 2));
                }
            }
        }
        return addressList;
    }

}
