// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { FlaggedItemRepository } from '../../repositories/FlaggedItemRepository';
import { FlaggedItem } from '../../models/FlaggedItem';
import { FlaggedItemCreateRequest } from '../../requests/model/FlaggedItemCreateRequest';
import { FlaggedItemUpdateRequest } from '../../requests/model/FlaggedItemUpdateRequest';
import { ListingItemService } from './ListingItemService';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { ProposalResultService } from './ProposalResultService';
import { MarketService } from './MarketService';
import { ItemVote } from '../../enums/ItemVote';
import { CoreRpcService } from '../CoreRpcService';
import {MessageException} from '../../exceptions/MessageException';


export class FlaggedItemService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalResultService) public proposalResultService: ProposalResultService,
        @inject(Types.Repository) @named(Targets.Repository.FlaggedItemRepository) public flaggedItemRepo: FlaggedItemRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<FlaggedItem>> {
        return this.flaggedItemRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<FlaggedItem> {
        const flaggedItem = await this.flaggedItemRepo.findOne(id, withRelated);
        if (flaggedItem === null) {
            this.log.warn(`FlaggedItem with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return flaggedItem;
    }

    @validate()
    public async create( @request(FlaggedItemCreateRequest) body: any): Promise<FlaggedItem> {

        // If the request body was valid we will create the flaggedItem
        const flaggedItem = await this.flaggedItemRepo.create(body);

        // finally find and return the created flaggedItem
        const newFlaggedItem = await this.findOne(flaggedItem.id);
        return newFlaggedItem;
    }

    @validate()
    public async update(id: number, @request(FlaggedItemUpdateRequest) body: any): Promise<FlaggedItem> {

        // find the existing one without related
        const flaggedItem = await this.findOne(id, false);

        // set new values
        flaggedItem.Reason = body.reason;

        // update flaggedItem record
        const updatedFlaggedItem = await this.flaggedItemRepo.update(id, flaggedItem.toJSON());

        // return newFlaggedItem;
        return updatedFlaggedItem;
    }

    public async destroy(id: number): Promise<void> {
        await this.flaggedItemRepo.destroy(id);
    }

    /**
     *
     * @param proposal
     */
    public async createFlaggedItemsForProposal(proposal: resources.Proposal): Promise<resources.FlaggedItem[]> {

        const flaggedItems: resources.FlaggedItem[] = [];

        switch (proposal.category) {
            case ProposalCategory.ITEM_VOTE:
                const listingItem: resources.ListingItem = await this.listingItemService.findOneByHashAndMarketReceiveAddress(proposal.target, proposal.market)
                    .then(value => value.toJSON());

                let flaggedItem: resources.FlaggedItem;

                if (_.isEmpty(listingItem.FlaggedItem)) {
                    flaggedItem = await this.create({
                        proposal_id: proposal.id,
                        listing_item_id: listingItem.id,
                        reason: proposal.description
                    } as FlaggedItemCreateRequest).then(value => value.toJSON());
                } else {
                    flaggedItem = await this.findOne(listingItem.FlaggedItem.id).then(value => value.toJSON());
                }
                flaggedItems.push(flaggedItem);
                break;

            case ProposalCategory.MARKET_VOTE:

                const marketsByAddress: resources.Market[] = await this.marketService.findAllByReceiveAddress(proposal.target).then(value => value.toJSON());
                const marketsByHash: resources.Market[] = await this.marketService.findAllByHash(proposal.target).then(value => value.toJSON());
                const markets: resources.Market[] = [...marketsByAddress, ...marketsByHash];

                // create FlaggedItem for all the found Markets
                for (const market of markets) {
                    let flaggedMarketItem: resources.FlaggedItem;

                    if (_.isEmpty(market.FlaggedItem)) {
                        flaggedMarketItem = await this.create({
                            proposal_id: proposal.id,
                            market_id: market.id,
                            reason: proposal.description
                        } as FlaggedItemCreateRequest).then(value => value.toJSON());
                    } else {
                        // else just return the existing
                        flaggedMarketItem = await this.findOne(market.FlaggedItem.id).then(value => value.toJSON());
                    }
                    flaggedItems.push(flaggedMarketItem);
                }
                break;

            default:
                break;
        }
        return flaggedItems;
    }

    /**
     * called from VoteActionService to set the removed flag if needed after processing the incoming vote
     * todo: this is propably unnecessary, we can do this when periodically running the new proposal results
     *
     * todo: setting the removed flag is also problematic with multiple profiles as not all voted to remove the listing
     * the whole idea of removing anything before the voting is done is stupid.
     *
     * @param id
     * @param proposalResult
     * @param vote
     */
    public async setRemovedFlagIfNeeded(id: number, proposalResult: resources.ProposalResult, vote: resources.Vote): Promise<void> {

        // fetch the FlaggedItem and remove if thresholds are hit
        if (proposalResult.Proposal.category !== ProposalCategory.PUBLIC_VOTE) {
            const flaggedItem: resources.FlaggedItem = await this.findOne(id, true)
                .then(value => value.toJSON())
                .catch(reason => {
                    this.log.error('ERROR: ', reason);
                });

            if (flaggedItem) {

                const remove = vote.ProposalOption.description === ItemVote.REMOVE.toString();
                const shouldRemove = await this.proposalResultService.shouldRemoveFlaggedItem(proposalResult, flaggedItem);

                if (shouldRemove) { // only consider remove if thresholds are hit
                    switch (proposalResult.Proposal.category) {

                        case ProposalCategory.ITEM_VOTE:
                            if (_.isNil(flaggedItem.ListingItem)) {
                                return; // should not happen
                            }

                            const markets: resources.Market[] = await this.marketService.findAllByReceiveAddress(flaggedItem.ListingItem.market)
                                .then(value => value.toJSON());

                            for (const market of markets) {
                                await this.coreRpcService.getAddressInfo(market.Identity.wallet, vote.voter)
                                    .then(async addressInfo => {
                                        if (addressInfo && addressInfo.ismine) {
                                            await this.listingItemService.setRemovedFlag(flaggedItem.ListingItem!.id, remove);
                                        }
                                    });
                            }

                            break;

                        case ProposalCategory.MARKET_VOTE:
                            if (_.isNil(flaggedItem.Market)) {
                                return; // should not happen
                            }

                            const flaggedMarket: resources.Market = await this.marketService.findOne(flaggedItem.Market.id).then(value => value.toJSON());

                            // only flag if voter address is ours
                            await this.coreRpcService.getAddressInfo(flaggedMarket.Identity.wallet, vote.voter)
                                .then(async addressInfo => {
                                    if (addressInfo && addressInfo.ismine) {
                                        await this.marketService.setRemovedFlag(flaggedMarket.id, remove);
                                    }
                                });
                            break;

                        default:
                            break;
                    }
                }
            }

        }
    }
}
