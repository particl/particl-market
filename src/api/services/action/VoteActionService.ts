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
import { VoteCreateParams } from '../../factories/model/ModelCreateParams';
import { ompVersion } from 'omp-lib/dist/omp';
import { VoteMessageCreateParams } from '../../requests/message/VoteMessageCreateParams';
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
import { BlacklistType } from '../../enums/BlacklistType';
import { BlacklistCreateRequest } from '../../requests/model/BlacklistCreateRequest';
import { NotImplementedException } from '../../exceptions/NotImplementedException';
import { BlacklistService } from '../model/BlacklistService';
import { GovernanceAction } from '../../enums/GovernanceAction';
import { NotificationService } from '../NotificationService';
import { ActionDirection } from '../../enums/ActionDirection';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { VerifiableMessage } from './ListingItemAddActionService';

// todo: move
export interface VoteTicket extends VerifiableMessage {
    proposalHash: string;       // proposal being voted for
    proposalOptionHash: string; // proposal option being voted for
    address: string;            // voting address having balance
}

// todo: move
export interface AddressInfo {
    address: string;
    balance: number;            // in satoshis
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
        @inject(Types.Factory) @named(Targets.Factory.message.VoteMessageFactory) private voteMessageFactory: VoteMessageFactory,
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

        const signature = await this.signVote(actionRequest.sendParams.wallet, actionRequest.proposal, actionRequest.proposalOption,
            actionRequest.addressInfo.address);

        const actionMessage: VoteMessage = await this.voteMessageFactory.get({
            proposalHash: actionRequest.proposal.hash,
            proposalOptionHash: actionRequest.proposalOption.hash,
            voter: actionRequest.addressInfo.address,
            signature
        } as VoteMessageCreateParams);

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
    public async beforePost(actionRequest: VoteRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
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

        // processVote "processes" the Vote, creating or updating the Vote.
        // called from both beforePost() and onEvent()
        // TODO: currently do not pass smsgMessage to the processVote here as that would set the values from smsgMessage
        // TODO: maybe add received or similar flag instead of this
        // await this.processMessage(marketplaceMessage.action as VoteMessage);

        // if (smsgSendResponse.msgid) {
        //    await this.voteService.updateMsgId((marketplaceMessage.action as VoteMessage).signature, smsgSendResponse.msgid);
        // } else {
        //     throw new MessageException('Failed to set Proposal msgid');
        // }

        return smsgSendResponse;
    }

    /**
     * vote for given Proposal and ProposalOption using all identity wallet addresses
     *
     * - vote( profile, ... ):
     *   - get all addresses having balance
     *   - for (voteAddress: addresses):
     *     - this.send( voteAddress )
     *
     * @param voteRequest
     */
    public async vote(voteRequest: VoteRequest): Promise<SmsgSendResponse> {

        const addressInfos: AddressInfo[] = await this.getPublicWalletAddressInfos(voteRequest.sender.wallet, 0);

        this.log.debug('posting votes from addresses: ', JSON.stringify(addressInfos, null, 2));
        if (_.isEmpty(addressInfos)) {
            this.log.error('Wallet has no usable addresses for voting.');
            return {
                result: 'Wallet has no usable addresses for voting.'
            } as SmsgSendResponse;
        }

        const msgids: string[] = [];
        for (const addressInfo of addressInfos) {
            this.log.debug('================================================');
            this.log.debug('vote(), addressInfo: ', JSON.stringify(addressInfo, null, 2));

            if (addressInfo.balance > 0) {
                // change sender to be the output address, then post the vote
                voteRequest.sendParams.fromAddress = addressInfo.address;
                voteRequest.sendParams.paidMessage = false; // vote messages should be free
                voteRequest.addressInfo = addressInfo;

                await this.post(voteRequest)
                    .then(smsgSendResponse => {
                        if (smsgSendResponse.msgid) {
                            msgids.push(smsgSendResponse.msgid);
                        }
                    });
            }
        }

        // once we have posted the votes, update the removed flag based on the vote, if ItemVote.REMOVE -> true, else false
        // TODO: removed flag should not be needed anymore
        if (voteRequest.proposal.category === ProposalCategory.ITEM_VOTE) {

            this.log.debug('vote(), voteRequest.proposal.target: ', voteRequest.proposal.target);
            this.log.debug('vote(), voteRequest.market.receiveAddress: ', voteRequest.market.receiveAddress);

            const listingItem: resources.ListingItem = await this.listingItemService.findOneByHashAndMarketReceiveAddress(
                voteRequest.proposal.target, voteRequest.market.receiveAddress).then(value => value.toJSON());

            await this.listingItemService.setRemovedFlag(listingItem.id, voteRequest.proposalOption.description === ItemVote.REMOVE.toString());
            this.log.debug('vote(), removed flag set');

            // todo: get rid of the remove flag, use Blacklist...


        } else if (voteRequest.proposal.category === ProposalCategory.MARKET_VOTE) {
            // TODO: await this.marketService.setRemovedFlag()
        }

        if (voteRequest.proposal.category === ProposalCategory.ITEM_VOTE
            || voteRequest.proposal.category === ProposalCategory.MARKET_VOTE) {

            // Blacklist the ListingItem.hash/Market.receiveAddress for the Profile thats voting
            if (voteRequest.proposalOption.description === ItemVote.REMOVE.toString()) {
                // only if voting for removal
                await this.createBlacklistForVote(voteRequest);
            } else {
                await this.removeBlacklistForVote(voteRequest);
            }

        }

        if (msgids.length === 0) {
            throw new MessageException('Wallet has no usable addresses for voting.');
        }

        const result = {
            result: 'Sent.',
            msgids
        } as SmsgSendResponse;

        this.log.debug('vote(), result: ', JSON.stringify(result, null, 2));
        return result;
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

        const voteMessage: VoteMessage = marketplaceMessage.action as VoteMessage;

        // TODO: dont return undefined
        // TODO: way too long method, needs to be refactored

        // get the address balance
        // TODO: balance can be checked later
        const balance = await this.coreRpcService.getAddressBalance(voteMessage.voter).then(value => parseInt(value.balance, 10));
        this.log.debug('processMessage(), voteMessage.voter: ', voteMessage.voter);
        this.log.debug('processMessage(), balance: ', balance);

        let proposal: resources.Proposal = await this.proposalService.findOneByHash(voteMessage.proposalHash).then(value => value.toJSON());
        if (smsgMessage && smsgMessage.sent > proposal.expiredAt) {
            this.log.error('proposal.expiredAt: ' + proposal.expiredAt + ' < ' + 'smsgMessage.sent: ' + smsgMessage.sent);
            // smsgMessage -> message was received, there's no smsgMessage if the vote was just saved locally
            // smsgMessage.sent > proposal.expiredAt -> message was sent after expiration
            throw new MessageException('Vote is invalid, it was sent after Proposal expiration.');
        }

        // find the ProposalOption for which the Vote is for
        const votedProposalOption = await this.proposalOptionService.findOneByHash(voteMessage.proposalOptionHash).then(value => value.toJSON());

        // find the Vote and if it exists, update it, and if not, then create it
        const vote: resources.Vote = await this.voteService.findOneByVoterAndProposalId(voteMessage.voter, proposal.id)
            .then(async value => {
                // Vote was found, update it
                const foundVote: resources.Vote = value.toJSON();
                const voteUpdateRequest: VoteUpdateRequest = await this.voteFactory.get({
                        msgid: smsgMessage.msgid,
                        proposalOption: votedProposalOption,
                        weight: balance
                    } as VoteCreateParams,
                    voteMessage,
                    smsgMessage);

                return await this.voteService.update(foundVote.id, voteUpdateRequest).then(value2 => value.toJSON());

            })
            .catch(async () => {

                // if Vote doesnt exist yet, we need to create it.
                this.log.debug('did not find Vote, creating...');
                const voteCreateRequest: VoteCreateRequest = await this.voteFactory.get({
                        msgid: smsgMessage ? smsgMessage.msgid : '',
                        proposalOption: votedProposalOption,
                        weight: balance
                    } as VoteCreateParams,
                    voteMessage,
                    smsgMessage);

                return await this.voteService.create(voteCreateRequest).then(value => value.toJSON());
            });

        // after creating/updating the Vote, recalculate the ProposalResult
        proposal = await this.proposalService.findOne(vote.ProposalOption.Proposal.id).then(value => value.toJSON());
        const proposalResult: resources.ProposalResult = await this.proposalService.recalculateProposalResult(proposal);

        // after recalculating the ProposalResult, we can now flag the ListingItem/Market as removed, if needed
        await this.flaggedItemService.flagAsRemovedIfNeeded(proposal.FlaggedItem.id, proposalResult, vote);

        return smsgMessage;
    }

    public async createNotification(marketplaceMessage: MarketplaceMessage,
                                    actionDirection: ActionDirection,
                                    smsgMessage: resources.SmsgMessage): Promise<MarketplaceNotification | undefined> {
        // undefined -> don't send notifications
        return undefined;
    }

    /**
     * When we are voting for removal, a Blacklist is created for whatever we vote to remove for.
     *
     * @param voteRequest
     */
    public async createBlacklistForVote(voteRequest: VoteRequest): Promise<resources.Blacklist> {

        const proposal: resources.Proposal = voteRequest.proposal;
        const voterIdentity: resources.Identity = voteRequest.sender;

        const type: BlacklistType = this.getBlacklistType(proposal.category);
        const target = proposal.title;  // hash/marketReceiveAddress in title

        const profileId = voterIdentity.Profile.id;

        let listingItem: resources.ListingItem | undefined;
        if (!_.isEmpty(proposal.FlaggedItem.ListingItem)) {
            listingItem = proposal.FlaggedItem.ListingItem;
        }

        // only create if Blacklist doesn't exist
        const blacklisted: resources.Blacklist[] = await this.blacklistService.findAllByTargetAndProfileId(target, profileId).then(value => value.toJSON());

        if (_.isEmpty(blacklisted)) {
            const blacklistCreateRequest = {
                type,
                target,
                market: proposal.market,
                profile_id: profileId,
                listing_item_id: listingItem ? listingItem.id : undefined
            } as BlacklistCreateRequest;

            return await this.blacklistService.create(blacklistCreateRequest).then(value => value.toJSON());
        } else {
            return blacklisted[0];
        }
    }

    /**
     * When we are voting to NOT remove, remove the existing Blacklist if such exists.
     *
     * @param voteRequest
     */
    public async removeBlacklistForVote(voteRequest: VoteRequest): Promise<void> {

        const target = voteRequest.proposal.title;  // hash/marketReceiveAddress in title
        const profileId = voteRequest.sender.Profile.id;

        // only remove if Blacklist exists
        const blacklisted: resources.Blacklist[] = await this.blacklistService.findAllByTargetAndProfileId(target, profileId).then(value => value.toJSON());

        if (!_.isEmpty(blacklisted)) {
            // there shouldn't be multiple, but wth
            // todo: add findOne...
            for (const blacklist of blacklisted) {
                await this.blacklistService.destroy(blacklist.id);
            }
        }
    }

    /**
     * Get SummaryVote for a Proposal
     *
     * @param identity
     * @param proposal
     */
    public async getCombinedVote(identity: resources.Identity, proposal: resources.Proposal): Promise<resources.Vote> {

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

        if (_.isEmpty(votes)) {
            throw new MessageException('No Votes found.');
        }

        const combinedVote = {
            id: 0,
            voter: identity.address,
            weight: 0,
            postedAt: Date.now(),
            receivedAt: Date.now(),
            expiredAt: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            ProposalOption: {} as resources.ProposalOption
        } as resources.Vote;

        for (const vote of votes) {
            combinedVote.weight = combinedVote.weight + vote.weight;
            combinedVote.ProposalOption = vote.ProposalOption;
        }

        return combinedVote;
    }

    /**
     *
     * @param proposalCategory
     */
    private getBlacklistType(proposalCategory: ProposalCategory): BlacklistType {
        switch (proposalCategory) {
            case ProposalCategory.ITEM_VOTE:
                return BlacklistType.LISTINGITEM;
            case ProposalCategory.MARKET_VOTE:
                return BlacklistType.MARKET;
            case ProposalCategory.PUBLIC_VOTE:
            default:
                throw new NotImplementedException();
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

    /**
     * signs the VoteTicket, returns signature
     *
     * @param wallet
     * @param proposal
     * @param proposalOption
     * @param address
     */
    private async signVote(wallet: string, proposal: resources.Proposal, proposalOption: resources.ProposalOption, address: string): Promise<string> {
        const voteTicket = {
            proposalHash: proposal.hash,
            proposalOptionHash: proposalOption.hash,
            address
        } as VoteTicket;

        return await this.coreRpcService.signMessage(wallet, address, voteTicket);
    }

}
