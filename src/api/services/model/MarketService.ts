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
import { IdentityService } from './IdentityService';
import { MarketSearchParams } from '../../requests/search/MarketSearchParams';
import { MarketFactory } from '../../factories/model/MarketFactory';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableMarketCreateRequestConfig } from '../../factories/hashableconfig/createrequest/HashableMarketCreateRequestConfig';
import { CoreRpcService } from '../CoreRpcService';
import { MarketType } from '../../enums/MarketType';
import { SmsgService } from '../SmsgService';
import { ImageService } from './ImageService';


export class MarketService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.MarketRepository) public marketRepo: MarketRepository,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) public identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.ImageService) public imageService: ImageService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Factory) @named(Targets.Factory.model.MarketFactory) public marketFactory: MarketFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Market>> {
        return await this.marketRepo.findAll();
    }

    public async findAllByProfileId(profileId: number | undefined, withRelated: boolean = true): Promise<Bookshelf.Collection<Market>> {
        return await this.marketRepo.findAllByProfileId(profileId, withRelated);
    }

    public async findAllByReceiveAddress(receiveAddress: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Market>> {
        return await this.marketRepo.findAllByReceiveAddress(receiveAddress, withRelated);
    }

    public async findAllByRegion(region: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Market>> {
        return await this.marketRepo.findAllByRegion(region, withRelated);
    }

    public async findAllByHash(hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Market>> {
        return await this.marketRepo.findAllByHash(hash, withRelated);
    }

    public async findAllExpired(): Promise<Bookshelf.Collection<Market>> {
        return await this.marketRepo.findAllExpired();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Market> {
        const market = await this.marketRepo.findOne(id, withRelated);
        if (market === null) {
            this.log.warn(`Market with the id=${id} was not found!`);
            throw new NotFoundException(id);
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
        const body: MarketCreateRequest = JSON.parse(JSON.stringify(data));
        // this.log.debug('create Market, body: ', JSON.stringify(body, null, 2));

        const imageCreateRequest = body.image;
        delete body.image;

        const market: resources.Market = await this.marketRepo.create(body).then(value => value.toJSON());

        if (!_.isEmpty(imageCreateRequest)) {
            await this.imageService.create(imageCreateRequest).then(async value => {
                const image: resources.Image = value.toJSON();
                await this.updateImage(market.id, image.id);
            });
        }

        return await this.findOne(market.id, true);
    }

    @validate()
    public async update(id: number, @request(MarketUpdateRequest) body: MarketUpdateRequest): Promise<Market> {

        const market = await this.findOne(id, false);

        market.Msgid = !_.isNil(body.msgid) ? body.msgid : market.Msgid;
        market.Name = !_.isNil(body.name) ? body.name : market.Name;
        market.Description = !_.isNil(body.description) ? body.description : market.Description;
        market.Type = !_.isNil(body.type) ? body.type : market.Type;
        market.Region = !_.isNil(body.region) ? body.region : market.Type;
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
        market.Hash = this.getHash(market.toJSON());

        await this.marketRepo.update(id, market.toJSON()).then(value => value.toJSON());
        return await this.findOne(id, true);
    }

    public async updateImage(id: number, imageId: number): Promise<Market> {
        const market = await this.findOne(id, false);
        market.set('imageId', imageId);
        await this.marketRepo.update(id, market.toJSON()).then(value => value.toJSON());
        return await this.findOne(id, true);
    }

    public async destroy(id: number): Promise<void> {
        await this.marketRepo.destroy(id);
    }

    public async joinMarket(market: resources.Market): Promise<void> {
        await this.coreRpcService.loadWallet(market.Identity.wallet);
        await this.smsgService.smsgSetWallet(market.Identity.wallet);
        await this.importMarketKeys(market);

        this.log.debug('joinMarket(): JOINED!');
        return;
    }

    /**
     * Set the removed flag
     *
     * @returns {Promise<void>}
     */
    public async setRemovedFlag(id: number, removed: boolean): Promise<void> {
        const market: resources.Market = await this.findOne(id).then(value => value.toJSON());
        await this.marketRepo.update(market.id, { removed });
    }

    /**
     *
     *
     * type === MARKETPLACE -> receive + publish keys are the same
     * type === STOREFRONT -> receive key is private key, publish key is public key
     *                        when adding a storefront, both keys should be given
     * type === STOREFRONT_ADMIN -> receive + publish keys are different
     *
     * @param market
     */
    public async importMarketKeys(market: resources.Market): Promise<void> {

        // receiveKey
        await this.smsgService.smsgImportPrivKey(market.receiveKey, market.name);                   // add private key to the smsg database
        const publicReceiveKey = await this.smsgService.smsgGetPubKey(market.receiveAddress);       // get the base58 encoded compressed public key
        await this.smsgService.smsgAddAddress(market.receiveAddress, publicReceiveKey);             // add address and matching public key to smsg database
        await this.smsgService.smsgAddLocalAddress(market.receiveAddress);                          // enable receiving messages on address.

        this.log.debug('importMarketKeys(), receive private key: ', market.receiveKey);
        this.log.debug('importMarketKeys(), receive public key: ', publicReceiveKey);
        this.log.debug('importMarketKeys(), receive address: ', market.receiveAddress);

        // publishKey
        if (market.type === MarketType.STOREFRONT) {
            await this.smsgService.smsgAddAddress(market.publishAddress, market.publishKey);        // add address and matching public key to smsg database
            await this.smsgService.smsgAddLocalAddress(market.publishAddress);                      // enable receiving messages on address.

        } else {
            await this.smsgService.smsgImportPrivKey(market.publishKey, market.name);               // add private key to the smsg database
            const publicPublishKey = await this.smsgService.smsgGetPubKey(market.publishAddress);   // get the base58 encoded compressed public key
            await this.smsgService.smsgAddAddress(market.publishAddress, publicPublishKey);         // add address and matching public key to smsg database
            await this.smsgService.smsgAddLocalAddress(market.publishAddress);                      // enable receiving messages on address.
        }

        this.log.debug('Market keys imported.');
    }

    private getHash(market: resources.Market): string {
        return ConfigurableHasher.hash({
            name: market.name,
            description: market.description,
            receiveAddress: market.receiveAddress,
            publishAddress: market.publishAddress,
        } as MarketCreateRequest, new HashableMarketCreateRequestConfig());
    }
}
