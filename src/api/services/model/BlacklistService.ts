// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as Bookshelf from 'bookshelf';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { BlacklistRepository } from '../../repositories/BlacklistRepository';
import { Blacklist } from '../../models/Blacklist';
import { BlacklistCreateRequest } from '../../requests/model/BlacklistCreateRequest';
import { BlacklistUpdateRequest } from '../../requests/model/BlacklistUpdateRequest';
import { BlacklistType } from '../../enums/BlacklistType';
import { VoteRequest } from '../../requests/action/VoteRequest';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { ItemVote } from '../../enums/ItemVote';
import { BlacklistSearchParams } from '../../requests/search/BlacklistSearchParams';


export class BlacklistService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.BlacklistRepository) public blacklistRepo: BlacklistRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async search(options: BlacklistSearchParams, withRelated: boolean = true): Promise<Bookshelf.Collection<Blacklist>> {
        return await this.blacklistRepo.search(options, withRelated);
    }

    public async findAll(): Promise<Bookshelf.Collection<Blacklist>> {
        return this.blacklistRepo.findAll();
    }

    public async findAllByType(type: BlacklistType): Promise<Bookshelf.Collection<Blacklist>> {
        return this.blacklistRepo.findAllByType(type);
    }

    public async findAllByTypeAndProfileId(type: BlacklistType, profileId: number): Promise<Bookshelf.Collection<Blacklist>> {
        return this.blacklistRepo.findAllByTypeAndProfileId(type, profileId);
    }

    public async findAllByTargetAndProfileId(target: string, profileId?: number): Promise<Bookshelf.Collection<Blacklist>> {
        return this.blacklistRepo.findAllByTargetAndProfileId(target, profileId);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Blacklist> {
        const blacklist = await this.blacklistRepo.findOne(id, withRelated);
        if (blacklist === null) {
            this.log.warn(`Blacklist with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return blacklist;
    }

    @validate()
    public async create(@request(BlacklistCreateRequest) data: BlacklistCreateRequest): Promise<Blacklist> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create Blacklist, body: ', JSON.stringify(body, null, 2));

        // If the request body was valid we will create the blacklist
        const blacklist = await this.blacklistRepo.create(body);

        // finally find and return the created blacklist
        const newBlacklist = await this.findOne(blacklist.id);
        return newBlacklist;
    }

    @validate()
    public async update(id: number, @request(BlacklistUpdateRequest) body: BlacklistUpdateRequest): Promise<Blacklist> {

        const blacklist = await this.findOne(id, false);

        // set new values
        blacklist.Type = body.type;
        blacklist.Target = body.target;

        const updatedBlacklist = await this.blacklistRepo.update(id, blacklist.toJSON());
        return updatedBlacklist;
    }

    public async destroy(id: number): Promise<void> {
        await this.blacklistRepo.destroy(id);
    }

    /**
     * Blacklists for Vote are created only when user flags something he doesnt want to see
     *
     * @param voteRequest
     */
    public async updateBlacklistsByVote(voteRequest: VoteRequest): Promise<resources.Blacklist[]> {

        const blacklisted: resources.Blacklist[] = [];

        if (voteRequest.proposalOption.description === ItemVote.REMOVE.toString()) {
            // voting to remove -> create blacklists
            if (!_.isEmpty(voteRequest.proposal.FlaggedItems)) {

                for (const flaggedItem of voteRequest.proposal.FlaggedItems) {
                    let blacklist: resources.Blacklist;

                    switch (voteRequest.proposal.category) {
                        case ProposalCategory.ITEM_VOTE:

                            blacklist = await this.create({
                                type: BlacklistType.LISTINGITEM,        // todo: add the type as command param
                                target: voteRequest.proposal.target,
                                market: voteRequest.proposal.market,
                                profile_id: voteRequest.sender.Profile.id,      // profile specific since user requested this
                                listing_item_id: flaggedItem.ListingItem!.id
                            } as BlacklistCreateRequest).then(value => value.toJSON());
                            blacklisted.push(blacklist);
                            break;

                        case ProposalCategory.MARKET_VOTE:
                            blacklist = await this.create({
                                type: BlacklistType.MARKET,
                                target: voteRequest.proposal.target,
                                market: voteRequest.proposal.market,
                                profile_id: voteRequest.sender.Profile.id,      // profile specific since user requested this
                                market_id: flaggedItem.Market!.id
                            } as BlacklistCreateRequest).then(value => value.toJSON());
                            blacklisted.push(blacklist);
                            break;

                        default:
                            break;
                    }
                }
            }

        } else {
            const target = voteRequest.proposal.target;
            const profileId = voteRequest.sender.Profile.id;
            const blacklists: resources.Blacklist[] = await this.findAllByTargetAndProfileId(target, profileId).then(value => value.toJSON());
            for (const blacklist of blacklists) {
                await this.destroy(blacklist.id);
            }
        }

        return blacklisted;
    }


}
