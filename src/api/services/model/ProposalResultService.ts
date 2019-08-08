// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { ProposalResultRepository } from '../../repositories/ProposalResultRepository';
import { ProposalResult } from '../../models/ProposalResult';
import { ProposalResultCreateRequest } from '../../requests/model/ProposalResultCreateRequest';
import { ProposalResultUpdateRequest } from '../../requests/model/ProposalResultUpdateRequest';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { MessageException } from '../../exceptions/MessageException';
import { ItemVote } from '../../enums/ItemVote';
import { CoreRpcService } from '../CoreRpcService';

export class ProposalResultService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Repository) @named(Targets.Repository.ProposalResultRepository) public proposalResultRepo: ProposalResultRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ProposalResult>> {
        return this.proposalResultRepo.findAll();
    }

    public async findAllByProposalHash(hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<ProposalResult>> {
        return await this.proposalResultRepo.findAllByProposalHash(hash, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ProposalResult> {
        const proposalResult = await this.proposalResultRepo.findOne(id, withRelated);
        if (proposalResult === null) {
            this.log.warn(`ProposalResult with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return proposalResult;
    }

    public async findLatestByProposalHash(hash: string, withRelated: boolean = true): Promise<ProposalResult> {
        const proposalResults = await this.proposalResultRepo.findAllByProposalHash(hash, withRelated);
        // this.log.debug('proposalResult:', JSON.stringify(proposalResult, null, 2));

        if (proposalResults === null) {
            this.log.warn(`ProposalResult with the hash=${hash} was not found!`);
            throw new NotFoundException(hash);
        }
        return proposalResults.first();
    }

    @validate()
    public async create( @request(ProposalResultCreateRequest) data: ProposalResultCreateRequest): Promise<ProposalResult> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create ProposalResult, body: ', JSON.stringify(body, null, 2));

        // If the request body was valid we will create the proposalResult
        const proposalResult = await this.proposalResultRepo.create(body);

        // finally find and return the created proposalResult
        const newProposalResult = await this.findOne(proposalResult.id);
        return newProposalResult;
    }

    @validate()
    public async update(id: number, @request(ProposalResultUpdateRequest) body: ProposalResultUpdateRequest): Promise<ProposalResult> {

        // find the existing one without related
        const proposalResult: any = await this.findOne(id, false);
        // proposalResult = proposalResult.toJSON();

        // set new values
        proposalResult.calculatedAt = body.calculatedAt;

        // update proposalResult record
        const updatedProposalResult = await this.proposalResultRepo.update(id, proposalResult.toJSON());

        // const newProposalResult = await this.findOne(id);
        // return newProposalResult;

        return updatedProposalResult;
    }

    public async destroy(id: number): Promise<void> {
        await this.proposalResultRepo.destroy(id);
    }

    /**
     * check whether ListingItem should be removed or not based on ProposalResult
     *
     * @param {"resources".ProposalResult} proposalResult
     * @param listingItem
     * @returns {Promise<boolean>}
     */
    public async shouldRemoveListingItem(proposalResult: resources.ProposalResult, listingItem: resources.ListingItem): Promise<boolean> {

        // make sure the Proposal is for removing an item
        if (proposalResult.Proposal.category !== ProposalCategory.ITEM_VOTE) {
            throw new MessageException('Invalid Proposal category.');
        }

        // we dont want to remove ListingItems that have related Bids
        // const listingItem: resources.ListingItem = await this.listingItemService.findOneByHash(proposalResult.Proposal.item)
        //    .then(value => value.toJSON());
        if (!_.isEmpty(listingItem.Bids)) {
            return false;
        }

        const removeOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult: resources.ProposalOptionResult) => {
            return proposalOptionResult.ProposalOption.description === ItemVote.REMOVE.toString();
        });

// TODO: currently, we dont take the keep votes into calculation
//        const keepOptionResult = _.find(proposalResult.ProposalOptionResults, (proposalOptionResult: resources.ProposalOptionResult) => {
//            return proposalOptionResult.ProposalOption.description === ItemVote.KEEP.toString();
//        });
//        if (keepOptionResult && removeOptionResult && (removeOptionResult.weight - keepOptionResult.weight) < 0) {
//            // more keep votes
//            return false;
//        }

        // Requirements to remove the ListingItem from the testnet market, these should also be configurable:
        // at minimum, 10% of total network weight for removal
        const blockchainInfo = await this.coreRpcService.getBlockchainInfo();
        const networkSupply = blockchainInfo.moneysupply * 100000000;

        const removalPercentage: number = parseFloat(process.env.LISTING_ITEM_REMOVE_PERCENTAGE) || 0.1;
        if (removeOptionResult && (removeOptionResult.weight / networkSupply) * 100 >= removalPercentage) {
            this.log.debug('Votes for ListingItem removal exceed ' + removalPercentage + '%');
            return true;
        }

//        if (keepOptionResult && removeOptionResult && ((removeOptionResult.weight - keepOptionResult.weight) / networkSupply) * 100 >= removalPercentage) {
//            this.log.debug('Votes for ListingItem removal exceed ' + removalPercentage + '%');
//            return true;
//        }

        // this.log.debug('ListingItem should NOT be destroyed');
        return false;
    }

}
