// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MarketRepository } from '../../repositories/MarketRepository';
import { Market } from '../../models/Market';
import { MarketCreateRequest } from '../../requests/model/MarketCreateRequest';
import { MarketUpdateRequest } from '../../requests/model/MarketUpdateRequest';
import { ProfileService } from './ProfileService';

export class MarketService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.MarketRepository) public marketRepo: MarketRepository,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getDefault(withRelated: boolean = true): Promise<Market> {
        const profile: resources.Profile = await this.profileService.getDefault().then(value => value.toJSON());

        const market = await this.marketRepo.getDefault(profile.id, withRelated);
        if (market === null) {
            this.log.warn(`Default Market was not found!`);
            throw new NotFoundException(process.env.DEFAULT_MARKETPLACE_NAME);
        }
        return market;
    }

    public async findAll(): Promise<Bookshelf.Collection<Market>> {
        return this.marketRepo.findAll();
    }

    public async findAllByProfileId(profileId: number, withRelated: boolean = true): Promise<Bookshelf.Collection<Market>> {
        return this.marketRepo.findAllByProfileId(profileId, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Market> {
        const market = await this.marketRepo.findOne(id, withRelated);
        if (market === null) {
            this.log.warn(`Market with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return market;
    }

    public async findOneByProfileIdAndReceiveAddress(profileId: number, address: string, withRelated: boolean = true): Promise<Market> {
        const market = await this.marketRepo.findOneByProfileIdAndReceiveAddress(profileId, address, withRelated);
        if (market === null) {
            this.log.warn(`Market with the address=${address} was not found!`);
            throw new NotFoundException(address);
        }
        return market;
    }

    public async findOneByProfileIdAndName(profileId: number, name: string, withRelated: boolean = true): Promise<Market> {
        const market = await this.marketRepo.findOneByProfileIdAndName(profileId, name, withRelated);
        if (market === null) {
            this.log.warn(`Market with the name=${name} was not found!`);
            throw new NotFoundException(name);
        }
        return market;
    }

    @validate()
    public async create( @request(MarketCreateRequest) data: MarketCreateRequest): Promise<Market> {

        const body = JSON.parse(JSON.stringify(data));

        this.log.debug('create Market, body: ', JSON.stringify(body, null, 2));

        // If the request body was valid we will create the market
        const market = await this.marketRepo.create(body);

        // finally find and return the created market
        const newMarket = await this.findOne(market.Id);
        return newMarket;
    }

    @validate()
    public async update(id: number, @request(MarketUpdateRequest) body: MarketUpdateRequest): Promise<Market> {

        // find the existing one without related
        const market = await this.findOne(id, false);

        // set new values
        market.Name = body.name;
        market.Type = body.type;
        market.ReceiveKey = body.receiveKey;
        market.ReceiveAddress = body.receiveAddress;
        market.PublishKey = body.publishKey;
        market.PublishAddress = body.publishAddress;
        market.Wallet = body.wallet;

        const updatedMarket = await this.marketRepo.update(id, market.toJSON());
        return updatedMarket;
    }

    public async destroy(id: number): Promise<void> {
        await this.marketRepo.destroy(id);
    }

}
