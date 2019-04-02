// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import {inject, named} from 'inversify';
import {Logger as LoggerType} from '../../core/Logger';
import {Core, Events, Targets, Types} from '../../constants';
import {VoteCreateRequest} from '../requests/VoteCreateRequest';
import {SmsgService} from './SmsgService';
import {MarketplaceMessage} from '../messages/MarketplaceMessage';
import {EventEmitter} from 'events';
import {MarketplaceEvent} from '../messages/MarketplaceEvent';
import {VoteFactory} from '../factories/model/VoteFactory';
import {VoteService} from './VoteService';
import {SmsgSendResponse} from '../responses/SmsgSendResponse';
import {CoreRpcService} from './CoreRpcService';
import {MessageException} from '../exceptions/MessageException';
import {VoteMessage} from '../messages/actions/VoteMessage';
import {ProposalService} from './ProposalService';
import {ProposalOptionService} from './ProposalOptionService';
import {ProposalCategory} from '../enums/ProposalCategory';
import {ListingItemService} from './ListingItemService';
import {SmsgMessageService} from './SmsgMessageService';
import {SmsgMessageStatus} from '../enums/SmsgMessageStatus';
import {ProposalResultService} from './ProposalResultService';
import {VoteUpdateRequest} from '../requests/VoteUpdateRequest';
import {ompVersion} from 'omp-lib/dist/omp';
import {GovernanceAction} from '../enums/GovernanceAction';
import {VoteMessageFactory} from '../factories/message/VoteMessageFactory';
import {MarketplaceMessageFactory} from '../factories/message/MarketplaceMessageFactory';
import {VoteMessageCreateParams} from '../factories/message/MessageCreateParams';
import {ProposalAddMessage} from '../messages/actions/ProposalAddMessage';
import {VoteCreateParams} from '../factories/model/ModelCreateParams';

export interface VoteTicket {
    proposalHash: string;       // proposal being voted for
    proposalOptionHash: string; // proposal option being voted for
    address: string;            // voting address having balance
}

export interface AddressInfo {
    address: string;
    balance: number;            // in satoshis
}

export class VoteActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.message.VoteMessageFactory) private voteMessageFactory: VoteMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.MarketplaceMessageFactory) private marketplaceMessageFactory: MarketplaceMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.VoteFactory) private voteFactory: VoteFactory,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.ProposalResultService) public proposalResultService: ProposalResultService,
        @inject(Types.Service) @named(Targets.Service.ProposalOptionService) public proposalOptionService: ProposalOptionService,
        @inject(Types.Service) @named(Targets.Service.VoteService) public voteService: VoteService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.SmsgMessageService) private smsgMessageService: SmsgMessageService,
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
     *
     * @param profile
     * @param marketplace
     * @param proposal
     * @param proposalOption
     */
    public async vote(profile: resources.Profile, marketplace: resources.Market, proposal: resources.Proposal,
                      proposalOption: resources.ProposalOption): Promise<SmsgSendResponse> {

        const addressInfos: AddressInfo[] = await this.getProfileAddressInfos(profile);

        this.log.debug('posting votes from addresses: ', JSON.stringify(addressInfos, null, 2));
        if (_.isEmpty(addressInfos)) {
            throw new MessageException('Wallet has no usable addresses for voting.');
        }

        const msgids: string[] = [];
        for (const addressInfo of addressInfos) {
            const response: SmsgSendResponse = await this.send(proposal, proposalOption, addressInfo, marketplace);
            if (response.msgid) {
                msgids.push(response.msgid);
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
                      senderAddress: AddressInfo, marketplace: resources.Market): Promise<SmsgSendResponse> {

        if (senderAddress.balance > 0) {
            const signature = await this.signVote(proposal, proposalOption, senderAddress.address);

            const marketplaceMessage: MarketplaceMessage = await this.marketplaceMessageFactory.get(GovernanceAction.MP_VOTE, {
                proposalHash: proposal.hash,
                proposalOptionHash: proposalOption.hash,
                voter: senderAddress.address,
                signature
            } as VoteMessageCreateParams);

            const voteMessage = marketplaceMessage.action as VoteMessage;

            // processVote "processes" the Vote, creating or updating the Vote.
            // called from send() and processVoteReceivedEvent()
            const vote: resources.Vote | undefined = await this.processVote(voteMessage);

            if (vote) {
                const daysRetention = Math.ceil((proposal.expiredAt - new Date().getTime()) / 1000 / 60 / 60 / 24);
                return this.smsgService.smsgSend(senderAddress.address, marketplace.address, marketplaceMessage, false, daysRetention);
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
     *
     * @param profile
     * @param proposal
     */
    public async getCombinedVote(profile: resources.Profile, proposal: resources.Proposal): Promise<resources.Vote> {

        const addressInfos: AddressInfo[] = await this.getProfileAddressInfos(profile);
        const addresses = addressInfos.map(addressInfo => {
            return addressInfo.address;
        });

        const votes: resources.Vote[] = await this.voteService.findAllByVotersAndProposalHash(addresses, proposal.hash)
            .then(value => value.toJSON());

        if (_.isEmpty(votes)) {
            throw new MessageException('No Votes found.');
        }

        const combinedVote = {
            id: 0,
            voter: profile.address,
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
     * process received VoteMessage
     * - this.processVote()
     * - proposalService.recalculateProposalResult(proposal)
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Bid>}
     */
    public async processVoteReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {
        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const voteMessage: VoteMessage = event.marketplaceMessage.action as VoteMessage;

        // processProposal will create or update the Proposal
        return await this.processVote(voteMessage, smsgMessage)
            .then(vote => {
                if (vote) {
                    this.log.debug('==> PROCESSED VOTE: ', vote.id);
                    return SmsgMessageStatus.PROCESSED;
                } else {
                    this.log.debug('==> IGNORED VOTE: ', 'voter: ' + voteMessage.voter + ', proposal: ' + voteMessage.proposalHash);
                    return SmsgMessageStatus.IGNORED;
                }
            })
            .catch(reason => {
                this.log.debug('processing failed: ', JSON.stringify(reason, null, 2));
                // todo: return different status for different reasons the vote was ignored
                // todo: some of the errors should set return SmsgMessageStatus.IGNORED
                return SmsgMessageStatus.PROCESSING_FAILED;
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
     *     - proposalService.recalculateProposalResult(proposal)
     *     - if ITEM_VOTE
     *       - check if listingitem should be removed
     *
     * @param voteMessage
     * @param smsgMessage
     */
    private async processVote(voteMessage: VoteMessage, smsgMessage?: resources.SmsgMessage): Promise<resources.Vote | undefined> {

        // get the address balance
        const balance = await this.coreRpcService.getAddressBalance([voteMessage.voter])
            .then(value => value.balance);

        // verify that the vote was actually sent by the owner of the address
        const verified = await this.verifyVote(voteMessage);
        if (!verified) {
            throw new MessageException('Received signature failed validation.');
        }

        let proposal: resources.Proposal = await this.proposalService.findOneByHash(voteMessage.proposalHash)
            .then(value => value.toJSON());

        if (smsgMessage && smsgMessage.sent > proposal.expiredAt) {
            this.log.debug('proposal.expiredAt: ' + proposal.expiredAt + ' < ' + 'smsgMessage.sent: ' + smsgMessage.sent);
            // smsgMessage -> message was received, there's no smsgMessage if the vote was just saved locally
            // smsgMessage.sent > proposal.expiredAt -> message was sent after expiration
            throw new MessageException('Vote is invalid, it was sent after Proposal expiration.');
        }

        // address needs to have balance for the vote to matter
        // allready checked in send, but doing it again since we call this also from processVoteReceivedEvent()
        if (balance > 0) {

            const votedProposalOption = await this.proposalOptionService.findOneByHash(voteMessage.proposalOptionHash)
                .then(value => value.toJSON());

            // find the vote and if it exists, update it, and if not, then create it
            let vote: resources.Vote | undefined = await this.voteService.findOneByVoterAndProposalId(voteMessage.voter, proposal.id)
                // empty .catch() wont work!
                .catch(reason => this.log.debug('Vote not found: ', reason))
                .then(value => {
                    if (value) {
                        return value.toJSON();
                    }
                });

            // todo: createOrUpdateVote
            if (vote) {
                // Vote was found, update it
                // when vote is found, we are either receiving our own vote or someone is voting again
                // if this is our own vote, then the relevant smsgMessage data will be updated and included in the request
                const voteUpdateRequest: VoteUpdateRequest = await this.voteFactory.get(voteMessage, smsgMessage, {
                    proposalOption: votedProposalOption,
                    weight: balance,
                    create: false
                } as VoteCreateParams );
                this.log.debug('found vote, updating the existing one');
                this.log.debug('voteRequest.voter: ' + voteUpdateRequest.voter);
                this.log.debug('proposal.id: ' + proposal.id);
                vote = await this.voteService.update(vote.id, voteUpdateRequest)
                    .then(value => {
                        return value.toJSON();
                    });

            } else {
                // Vote doesnt exist yet, so we need to create it.
                // when called from send() we create a VoteCreateRequest with fake smsgMessage data, which will be updated when the message is received.
                this.log.debug('did not find vote, creating...');
                const voteCreateRequest: VoteCreateRequest = await this.voteFactory.get(voteMessage, smsgMessage, {
                    proposalOption: votedProposalOption,
                    weight: balance,
                    create: true
                } as VoteCreateParams );

                vote = await this.voteService.create(voteCreateRequest)
                    .then(value => {
                        return value.toJSON();
                    });
                // this.log.debug('created vote: ', JSON.stringify(vote, null, 2));
            }

            if (vote) {
                // after creating/updating the Vote, recalculate the ProposalResult
                proposal = await this.proposalService.findOne(vote.ProposalOption.Proposal.id)
                    .then(value => value.toJSON());
                const proposalResult: resources.ProposalResult = await this.proposalService.recalculateProposalResult(proposal);

                // after recalculating the ProposalResult, if proposal is of category ITEM_VOTE,
                // we can now check whether the ListingItem should be removed or not
                if (proposal.category === ProposalCategory.ITEM_VOTE) {
                    const listingItem: resources.ListingItem = await this.listingItemService.findOneByHash(proposalResult.Proposal.item)
                        .then(value => value.toJSON());
                    await this.proposalResultService.shouldRemoveListingItem(proposalResult, listingItem)
                        .then(async remove => {
                            if (remove) {
                                await this.listingItemService.destroy(listingItem.id);
                            }
                        });
                }
                return vote;
            }
        }

        // returning undefined vote in case there's no balance
        // we could also throw in this situation
        return;
    }


    /**
     * get the Profiles wallets addresses
     * minimum 3 confirmations, ones without balance not included
     *
     * the profile param is not used for anything yet, but included already while we wait and build multiwallet support
     *
     * @param profile
     * @param addresses
     */
    private async getProfileAddressInfos(profile: resources.Profile, addresses: string[] = []): Promise<AddressInfo[]> {
        const addressList: AddressInfo[] = [];
        const outputs: any = await this.coreRpcService.listUnspent(1, 9999999, addresses);
        // this.log.debug('getProfileAddressInfos(), outputs: ', JSON.stringify(outputs, null, 2));

        for (const output of outputs) {
            if (output.spendable && output.solvable && output.safe && output.amount > 0) {
                // we could have multiple outputs from one address and we only want to send one Vote per address.
                const exists = addressList.find(addressInfo => addressInfo.address === output.address);
                if (!exists) {
                    addressList.push({
                        address: output.address,
                        balance: output.amount * 100000000 // in satoshis
                    } as AddressInfo);
                }
            }
        }
        return addressList;
        // const validChars = 'pP';
        // return addressList.filter(address => validChars.includes(address.charAt(0)));
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

    private configureEventListeners(): void {
        this.log.info('Configuring EventListeners ');

        this.eventEmitter.on(Events.VoteReceivedEvent, async (event) => {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            await this.processVoteReceivedEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status)
                        .then(value => {
                            const msg: resources.SmsgMessage = value.toJSON();
                            if (msg.status !== status) {
                                throw new MessageException('Failed to set SmsgMessageStatus.');
                            }
                        });
                })
                .catch(async reason => {
                    this.log.error('PROCESSING ERROR: ', reason);
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PARSING_FAILED);
                });
        });
    }
}
