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
import { MarketRepository } from '../../repositories/MarketRepository';
import { Market } from '../../models/Market';
import { MarketCreateRequest } from '../../requests/model/MarketCreateRequest';
import { MarketUpdateRequest } from '../../requests/model/MarketUpdateRequest';
import { ProfileService } from './ProfileService';
import { SettingService } from './SettingService';
import { IdentityService } from './IdentityService';
import { MarketSearchParams } from '../../requests/search/MarketSearchParams';

export class MarketService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.MarketRepository) public marketRepo: MarketRepository,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) public identityService: IdentityService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Market>> {
        return await this.marketRepo.findAll();
    }

    public async findAllByProfileId(profileId: number, withRelated: boolean = true): Promise<Bookshelf.Collection<Market>> {
        return await this.marketRepo.findAllByProfileId(profileId, withRelated);
    }

    public async findAllByReceiveAddress(receiveAddress: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Market>> {
        return await this.marketRepo.findAllByReceiveAddress(receiveAddress, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Market> {
        const market = await this.marketRepo.findOne(id, withRelated);
        if (market === null) {
            this.log.warn(`Market with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return market;
    }

    public async findOneByHash(hash: string, withRelated: boolean = true): Promise<Market> {
        const market = await this.marketRepo.findOneByHash(hash, withRelated);
        if (market === null) {
            this.log.warn(`Market with the hash=${hash} was not found!`);
            throw new NotFoundException(hash);
        }
        return market;
    }

    public async findOneByMsgId(msgid: string, withRelated: boolean = true): Promise<Market> {
        const market = await this.marketRepo.findOneByMsgId(msgid, withRelated);
        if (market === null) {
            this.log.warn(`Market with the msgid=${msgid} was not found!`);
            throw new NotFoundException(msgid);
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

    @validate()
    public async search(@request(MarketSearchParams) options: MarketSearchParams,
                        withRelated: boolean = true): Promise<Bookshelf.Collection<Market>> {
        return await this.marketRepo.search(options, withRelated);
    }

    @validate()
    public async create( @request(MarketCreateRequest) data: MarketCreateRequest): Promise<Market> {
        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create Market, body: ', JSON.stringify(body, null, 2));
        const market: resources.Market = await this.marketRepo.create(body).then(value => value.toJSON());
        return await this.findOne(market.id, true);
    }

    @validate()
    public async update(id: number, @request(MarketUpdateRequest) body: MarketUpdateRequest): Promise<Market> {

        const market = await this.findOne(id, false);

        market.Msgid = !_.isNil(body.msgid) ? body.msgid : market.Msgid;
        market.Hash = !_.isNil(body.msgid) ? body.hash : market.Hash;
        market.Name = !_.isNil(body.name) ? body.name : market.Name;
        market.Description = !_.isNil(body.description) ? body.description : market.Description;
        market.Type = !_.isNil(body.type) ? body.type : market.Type;
        // market.ReceiveKey = body.receiveKey;
        // market.ReceiveAddress = body.receiveAddress;
        // market.PublishKey = body.publishKey;
        // market.PublishAddress = body.publishAddress;
        market.Removed = !_.isNil(body.removed) ? body.removed : market.Removed;
        market.ExpiryTime = !_.isNil(body.expiryTime) ? body.expiryTime : market.ExpiryTime;
        market.GeneratedAt = !_.isNil(body.generatedAt) ? body.generatedAt : market.GeneratedAt;
        market.ReceivedAt = !_.isNil(body.receivedAt) ? body.receivedAt : market.ReceivedAt;
        market.PostedAt = !_.isNil(body.postedAt) ? body.postedAt : market.PostedAt;
        market.ExpiredAt = !_.isNil(body.expiredAt) ? body.expiredAt : market.ExpiredAt;

        if (body.identity_id) {
            market.set('identityId', body.identity_id);
        }
        if (body.image_id) {
            market.set('imageId', body.image_id);
        }

        await this.marketRepo.update(id, market.toJSON()).then(value => value.toJSON());
        return await this.findOne(id, true);
    }

    public async destroy(id: number): Promise<void> {
        await this.marketRepo.destroy(id);
    }

}
