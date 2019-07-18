// Copyright (c) 2017-2019, The Particl Market developers
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
import { SettingValue } from '../../enums/SettingValue';
import { MessageException } from '../../exceptions/MessageException';

export class MarketService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.MarketRepository) public marketRepo: MarketRepository,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getDefaultForProfile(profileId: number, withRelated: boolean = true): Promise<Market> {

        const profileSettings: resources.Setting[] = await this.settingService.findAllByProfileId(profileId).then(value => value.toJSON());
        const marketAddressSetting = _.find(profileSettings, value => {
            return value.key === SettingValue.DEFAULT_MARKETPLACE_ADDRESS;
        });

        if (_.isEmpty(marketAddressSetting)) {
            throw new MessageException(SettingValue.DEFAULT_MARKETPLACE_ADDRESS + ' not set.');
        }

        const market = await this.marketRepo.findOneByProfileIdAndReceiveAddress(profileId, marketAddressSetting!.value, withRelated);

        if (market === null) {
            this.log.error(`Default Market was not found!`);
            throw new NotFoundException(marketAddressSetting!.value);
        }
        return market;
    }

    public async findAll(): Promise<Bookshelf.Collection<Market>> {
        return await this.marketRepo.findAll();
    }

    public async findAllByProfileId(profileId: number, withRelated: boolean = true): Promise<Bookshelf.Collection<Market>> {
        return await this.marketRepo.findAllByProfileId(profileId, withRelated);
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
        const market: resources.Market = await this.marketRepo.create(body).then(value => value.toJSON());
        return await this.findOne(market.id, true);
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

        const updatedMarket = await this.marketRepo.update(id, market.toJSON()).then(value => value.toJSON());
        return await this.findOne(updatedMarket.id, true);
    }

    public async destroy(id: number): Promise<void> {
        await this.marketRepo.destroy(id);
    }

}
