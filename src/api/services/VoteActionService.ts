// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { Vote } from '../models/Vote';
import { VoteCreateRequest } from '../requests/VoteCreateRequest';
import { SmsgService } from './SmsgService';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { EventEmitter } from 'events';
import * as resources from 'resources';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { VoteFactory } from '../factories/VoteFactory';
import { VoteService } from './VoteService';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { VoteMessageType } from '../enums/VoteMessageType';
import { CoreRpcService } from './CoreRpcService';
import { MessageException } from '../exceptions/MessageException';
import { VoteMessage } from '../messages/VoteMessage';
import { ProposalService } from './ProposalService';
import { VoteUpdateRequest } from '../requests/VoteUpdateRequest';
import { ProposalResultService } from './ProposalResultService';
import { ProposalOptionService } from './ProposalOptionService';
import { ProposalOptionResultService } from './ProposalOptionResultService';
import { ProposalType } from '../enums/ProposalType';
import { ListingItemService } from './ListingItemService';
import { SmsgMessageService } from './SmsgMessageService';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { ProfileService } from './ProfileService';
import { BidService } from './BidService';
import { ProposalCreateRequest } from '../requests/ProposalCreateRequest';
import { ProposalUpdateRequest } from '../requests/ProposalUpdateRequest';
import { Proposal } from '../models/Proposal';
import { ProposalMessage } from '../messages/ProposalMessage';

interface VoteTicket {
    proposalHash: string;       // proposal being voted for
    proposalOptionHash: string; // proposal option being voted for
    address: string;            // voting address having balance
}

export class VoteActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.VoteFactory) private voteFactory: VoteFactory,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.ProposalOptionService) public proposalOptionService: ProposalOptionService,
        @inject(Types.Service) @named(Targets.Service.ProposalResultService) public proposalResultService: ProposalResultService,
        @inject(Types.Service) @named(Targets.Service.ProposalOptionResultService) public proposalOptionResultService: ProposalOptionResultService,
        @inject(Types.Service) @named(Targets.Service.VoteService) public voteService: VoteService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     * vote for given Proposal and ProposalOption using given Profiles (wallets) addresses
     *
     * - vote( profile, ... ):
     *   - get all addresses having balance
     *   - for (voteAddress: addresses):
     *     - this.send( voteAddress )
     *   - proposalService.recalculateProposalResult(proposal)
     *
     * @param profile
     * @param marketplace
     * @param proposal
     * @param proposalOption
     */
    public async vote(profile: resources.Profile, marketplace: resources.Market, proposal: resources.Proposal,
                      proposalOption: resources.ProposalOption): Promise<SmsgSendResponse[]> {

        const addresses: string[] = await this.getProfileWalletAddresses(profile);
        const responses: SmsgSendResponse[] = [];

        for (const address of addresses) {
            const response: SmsgSendResponse = await this.send(proposal, proposalOption, address, marketplace);
            responses.push(response);
        }

        // we just created all the votes and sent them, so we can now recalculate the ProposalResults
        await this.proposalService.recalculateProposalResult(proposal);

        return responses;
    }

    /**
     * send a VoteMessage from a single given address
     *
     * - send( voteAddress, ... ):
     *   - create VoteMessage
     *     - call signmessage "address" "message", address being the address with balance, message being the resources.VoteTicket
     *     - add resulting signature to voteMessage.signature and voteticket to voteMessage.ticket
     *   - this.processVote()
     *   - post VoteMessage, as a free message, from voteAddress
     *
     * @param {"resources".Proposal} proposal
     * @param {"resources".ProposalOption} proposalOption
     * @param senderAddress
     * @param {"resources".Market} marketplace
     * @returns {Promise<SmsgSendResponse>}
     */
    public async send(proposal: resources.Proposal, proposalOption: resources.ProposalOption,
                      senderAddress: string, marketplace: resources.Market): Promise<SmsgSendResponse> {

        // confirm that the address actually has balance
        const balance = await this.coreRpcService.getAddressBalance([senderAddress])
            .then(value => value.balance);

        if (balance > 0) {
            const signature = await this.signVote(proposal, proposalOption, senderAddress);
            const voteMessage = await this.voteFactory.getMessage(VoteMessageType.MP_VOTE, proposal.hash,
                proposalOption.hash, senderAddress, signature);

            const msg: MarketplaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: voteMessage
            };

            // processVote "processes" the Vote, creating or updating the Vote.
            // called from send() and processVoteReceivedEvent()
            const vote: resources.Vote | undefined = await this.processVote(voteMessage);

            if (vote) {
                const daysRetention = Math.ceil((proposal.expiredAt  - new Date().getTime()) / 1000 / 60 / 60 / 24);
                return this.smsgService.smsgSend(senderAddress, marketplace.address, msg, false, daysRetention);
            }
        }

        return {
            result: 'skipping.',
            txid: '0',
            fee: 0,
            error: 'no balance.'
        } as SmsgSendResponse;
    }

    /**
     * process received VoteMessage
     * - save ActionMessage
     * - create Proposal
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Bid>}
     */
    public async processVoteReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {
        const message = event.marketplaceMessage;
        if (!message.mpaction) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        const voteMessage: VoteMessage = event.marketplaceMessage.mpaction as VoteMessage;
        const sender = event.smsgMessage.from;

        // Get vote message signature
        // Verify signature
        const signature = await this.verifyVote(voteMessage, sender);

        const passedVerification = await this.coreRpcService.verifyMessage(voteMessage.voter, voteMessage.signature, voteMessage);
        if (!passedVerification) {
            throw new MessageException('Received signature failed validation.');
        } else {
            this.log.debug('Received signature passed validation.');
        }

        // get proposal and ignore vote if we're past the final block of the proposal
        return await this.proposalService.findOneByHash(voteMessage.proposalHash)
            .then(async proposalModel => {

                const proposal = proposalModel.toJSON();
                /*
                 * Are any of these votes from one of our profiles?
                 *     Ignore the vote, we've already created it locally
                 * Else, process vote
                 */
                let weAreTheVoter = false;
                const addrCollection: any = await this.coreRpcService.getWalletAddresses();
                for (const addr of addrCollection) {
                    if (addr.address === voteMessage.voter) {
                        this.log.debug(`Address (${addr.address}) === voteMessage.voter (${voteMessage.voter})`);
                        weAreTheVoter = true;
                        break;
                    }
                }
                if (weAreTheVoter) {
                    this.log.debug('This vote should have already been created locally. Skipping.');
                } else {
                    this.log.debug('This vote should not exist already locally. Process the vote.');

                    // just make sure we have one
                    if (_.isEmpty(proposal.ProposalResults)) {
                        throw new MessageException('ProposalResult should not be empty!');
                    }

                    // const currentBlock: number = await this.coreRpcService.getBlockCount();
                    // this.log.debug('before update, proposal:', JSON.stringify(proposal, null, 2));

                    if (voteMessage && event.smsgMessage.daysretention >= 1) {
                        const weight = await this.voteService.getVoteWeight(voteMessage.voter);
                        await this.decideOnProposal(voteMessage, proposal.FlaggedItem.listingItemId, proposal, weight);
                        return SmsgMessageStatus.PROCESSED;
                    } else {
                        throw new MessageException('Missing VoteMessage');
                    }
                }
                return SmsgMessageStatus.PROCESSED;
            })
            .catch(reason => {
                return SmsgMessageStatus.WAITING;
            });
    }

    /**
     * todo: move to listingItemService
     *
     * @param {"resources".ProposalResult} proposalResult
     * @returns {Promise<boolean>}
     */
    public async shouldRemoveListingItem(proposalResult: resources.ProposalResult): Promise<boolean> {
        // TODO: Currently this should work fine, the new weights are calculated in recalculateProposalResult, which is called when we recieve a vote
        // If this function is ever called somewhere other than just after we receive a vote, we need to make sure recalculateProposalResult is called first,
        //     alternatively, we can calculate it here.
        const okOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult: resources.ProposalOptionResult) => {
            return proposalOptionResult.ProposalOption.optionId === 0;
        });
        const removeOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult: resources.ProposalOptionResult) => {
            return proposalOptionResult.ProposalOption.optionId === 1; // 1 === REMOVE
        });

        const bid = await this.bidService.findAllByListingItemHash(proposalResult.Proposal.item, true);
        if (bid) {
            // We don't want to remove listings that have bids on them.
            // Bids are only visible to buyer and seller so everybody else will remove eligable listings.
            return false;
        }

        // Requirements to remove the ListingItem from the testnet marketplace, these should also be configurable:
        // at minimum, a total of env.MINIMUM_REQUIRED_VOTES votes
        // at minimum, 50% of votes saying remove

        const networkInfo = await this.coreRpcService.getNetworkInfo();
        const networkSupply = 1000; // networkInfo.moneysupply * 100000000;

        this.log.debug('process.env.MINIMUM_REQUIRED_VOTES = ' + process.env.MINIMUM_REQUIRED_VOTES);
        if (removeOptionResult && okOptionResult) {
            // const totalNumVoters = okOptionResult.voters + removeOptionResult.voters;
            const totalWeight = okOptionResult.weight + removeOptionResult.weight;
            this.log.debug(`totalWeight / networkSupply = ${totalWeight} / ${networkSupply} = `
                           + (totalWeight / networkSupply) + ' >=? 0.1 = ' + (totalWeight / networkSupply >= 0.1 ? 'TRUE' : 'FALSE'));
            if (totalWeight / networkSupply >= 0.1) {
                /*(totalNumVoters > (process.env.MINIMUM_REQUIRED_VOTES || 1000))
                && (totalWeight > (process.env.MINIMUM_REQUIRED_WEIGHT || 100000000000))
                && ((removeOptionResult.weight / (totalWeight)) > 0.5)) {*/
                this.log.debug('Item should be destroyed');
                return true;
            }
        }
        this.log.debug('Item should NOT be destroyed');
        return false;
    }


    /**
     * get the Profiles wallets addresses
     * minimum 3 confirmations, empty ones not included
     *
     * the profile param is not used for anything yet, but included allready while we wait and build multiwallet support
     *
     * @param profile
     */
    private async getProfileWalletAddresses(profile: resources.Profile): Promise<string[]> {
        const addressList: string[] = [];
        const addresses: any = await this.coreRpcService.listReceivedByAddress(3, false);
        for (const address of addresses) {
            addressList.push(address.address);
        }
        return addressList;
    }

    /**
     * signs the VoteTicket, returns signature
     *
     * @param proposal
     * @param proposalOption
     * @param address
     */
    private async signVote(proposal: resources.Proposal, proposalOption: resources.ProposalOption, address: string): Promise<string> {
        const voteTicket = {
            proposalHash: proposal.hash,
            proposalOptionHash: proposalOption.hash,
            address
        } as VoteTicket;

        return await this.coreRpcService.signMessage(address, voteTicket);
    }

    /**
     * verifies VoteTicket, returns boolean
     *
     * @param voteMessage
     * @param address
     */
    private async verifyVote(voteMessage: VoteMessage): Promise<boolean> {
        const voteTicket = {
            proposalHash: voteMessage.proposalHash,
            proposalOptionHash: voteMessage.proposalOptionHash,
            address: voteMessage.voter
        } as VoteTicket;
        return await this.coreRpcService.verifyMessage(voteMessage.voter, voteMessage.signature, voteTicket);
    }

    private async instaVote(senderAddress: string, proposal: resources.Proposal, proposalOptionId: number): Promise<resources.Vote> {
        const proposalOption: resources.ProposalOption | undefined = _.find(proposal.ProposalOptions, (o: resources.ProposalOption) => {
            return o.optionId === proposalOptionId; // TODO: Or is it 1????
        });
        if (!proposalOption) {
            this.log.debug(`Proposal option ${proposalOptionId} wasn't found.`);
            throw new MessageException(`Proposal option ${proposalOptionId} wasn't found.`);
        }

        // Local (instant) votes
        // this.log.debug('Casting instant vote for ' + senderAddress);
        const weight = await this.voteService.getVoteWeight(senderAddress);
        // this.log.debug('Weight calculated');
        const voteMessage = await this.voteFactory.getMessage(VoteMessageType.MP_VOTE, proposal, proposalOption, senderAddress);
        // this.log.debug('Vote message created');
        const voteCreateRequest: VoteCreateRequest = await this.voteFactory.getModel(voteMessage, proposal, proposalOption, weight, false);

        let lastVote: any;
        try {
            const lastVoteModel = await this.voteService.findOneByVoterAndProposalId(voteMessage.voter, proposal.id);
            lastVote = lastVoteModel.toJSON();
        } catch (ex) {
            lastVote = null;
        }
        const create: boolean = lastVote == null;
        let voteModel;
        if (create) {
            // this.log.debug('CREATE VOTE');
            // this.log.debug('Creating vote request = ' + JSON.stringify(voteRequest, null, 2));
            voteModel = await this.voteService.create(voteCreateRequest);
            // this.log.debug('Vote create request created');
        } else {
            // this.log.debug(`Updating vote with id = ${lastVote.id}, vote request = ` + JSON.stringify(voteRequest, null, 2));
            // this.log.debug('UPDATE VOTE');
            voteModel = await this.voteService.update(lastVote.id, voteCreateRequest);
            // this.log.debug('Vote create request updated');
            // this.voteService.destroy(lastVote.id);
            // voteModel = await this.voteService.create(voteRequest as VoteCreateRequest);
        }
        if (!voteModel) {
            this.log.debug('VoteActionService.createOrUpdateVote(): Vote wasn\'t saved or updated properly. Return val is empty.');
            throw new MessageException('Vote wasn\'t saved or updated properly. Return val is empty.');
        }

        const listingItem = await this.listingItemService.findOneByHash(proposal.item);
        const listingItemId = listingItem.Id;
        await this.decideOnProposal(voteMessage, listingItemId, proposal, weight);

        const vote = voteModel.toJSON();
        return vote;
    }

    private async decideOnProposal(voteMessage: VoteMessage, listingItemId: number, proposal: resources.Proposal, weight: number): Promise<void> {
        // If vote has weight of 0, ignore, no point saving a weightless vote.
        // If vote has a weight > 0, process and save it.
        if (weight > 0) {
            const createdVote = await this.createOrUpdateVote(voteMessage, proposal, weight);
            this.log.debug('created/updated Vote:', JSON.stringify(createdVote, null, 2));

            let proposalResult: any = this.proposalResultService.findOneByProposalHash(proposal.hash);
            if (!proposalResult) {
                proposalResult = await this.proposalService.createFirstProposalResult(proposal);
            }
            proposalResult = await this.proposalService.recalculateProposalResult(proposal);

            // todo: extract method
            if (proposal.type === ProposalType.ITEM_VOTE
                && await this.shouldRemoveListingItem(proposalResult)) {

                // remove the ListingItem from the marketplace (unless user has Bid/Order related to it).
                const tmpListingItemId = await this.listingItemService.findOne(listingItemId, false)
                    .then(value => {
                        return value.Id;
                    }).catch(reason => {
                        // ignore
                        return null;
                    });
                if (tmpListingItemId) {
                    await this.listingItemService.destroy(tmpListingItemId);
                }
            } else {
                this.log.debug('No item destroyed.');
            }
            // TODO: do whatever else needs to be done
        }
    }

    private configureEventListeners(): void {
        this.log.info('Configuring EventListeners ');

        this.eventEmitter.on(Events.VoteReceivedEvent, async (event) => {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            await this.processVoteReceivedEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
                })
                .catch(async reason => {
                    this.log.error('PROCESSING ERROR: ', reason);
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PARSING_FAILED);
                });
        });
    }

    /**
     * processVote "processes" the Vote, creating or updating the Vote.
     * called from send() and processVoteReceivedEvent(), meaning before the VoteMessage is sent
     * and after the VoteMessage is received.
     *
     * - private processVote()
     *   - verify the vote is valid
     *     - verifymessage address votemessage.signature votemessage.voteticket
     *     - get the balance for the address
     *   - if Vote is valid and has balance:
     *     - save/update Vote locally (update: add the fields from smsgmessage)
     *
     * @param voteMessage
     * @param smsgMessage
     */
    private async processVote(voteMessage: VoteMessage, smsgMessage?: resources.SmsgMessage): Promise<resources.Vote | undefined> {

        // get the address balance
        const balance = await this.coreRpcService.getAddressBalance([voteMessage.voter])
            .then(value => value.balance);

        const verified = this.verifyVote(voteMessage);

        if (balance > 0 && verified) {

            const proposalOption = await this.proposalOptionService.findOneByHash(voteMessage.proposalOptionHash)
                .then(value => value.toJSON());

            // when called from send() we create a VoteCreateRequest with no smsgMessage data.
            // later, when the smsgMessage for this vote is received,
            // the relevant smsgMessage data will be updated and included in the request
            const voteRequest: VoteCreateRequest = await this.voteFactory.getModel(voteMessage, proposalOption, balance, smsgMessage);
            const voteModel: Vote = await this.voteService.findOneBySignature(voteRequest.signature)
                .catch(async reason => {
                    // vote doesnt exist yet, so we need to create it.
                    return await this.voteService.create(voteRequest);
                });

            let vote: resources.Vote = voteModel.toJSON();
            if (voteRequest.postedAt !== Number.MAX_SAFE_INTEGER) {
                // means processProposal was called from processVoteReceivedEvent() and we should update the Vote data
                vote = await this.voteService.update(vote.id, voteRequest)
                    .then(value => value.toJSON());
            } else {
                // called from send(), we already created the Vote so nothing needs to be done
            }
            return vote;
        }
        return;
    }

}
