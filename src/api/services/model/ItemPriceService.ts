// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { ItemPriceRepository } from '../../repositories/ItemPriceRepository';
import { ItemPrice } from '../../models/ItemPrice';
import { ItemPriceCreateRequest } from '../../requests/model/ItemPriceCreateRequest';
import { ItemPriceUpdateRequest } from '../../requests/model/ItemPriceUpdateRequest';
import { ShippingPriceService } from './ShippingPriceService';
import { CryptocurrencyAddressService } from './CryptocurrencyAddressService';
import { CryptocurrencyAddressCreateRequest } from '../../requests/model/CryptocurrencyAddressCreateRequest';
import { CryptocurrencyAddressUpdateRequest } from '../../requests/model/CryptocurrencyAddressUpdateRequest';
import { ShippingPriceCreateRequest } from '../../requests/model/ShippingPriceCreateRequest';
import { ShippingPriceUpdateRequest } from '../../requests/model/ShippingPriceUpdateRequest';


export class ItemPriceService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.CryptocurrencyAddressService) private cryptocurrencyAddressService: CryptocurrencyAddressService,
        @inject(Types.Service) @named(Targets.Service.model.ShippingPriceService) private shippingPriceService: ShippingPriceService,
        @inject(Types.Repository) @named(Targets.Repository.ItemPriceRepository) public itemPriceRepo: ItemPriceRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemPrice>> {
        return this.itemPriceRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemPrice> {
        const itemPrice = await this.itemPriceRepo.findOne(id, withRelated);
        if (itemPrice === null) {
            this.log.warn(`ItemPrice with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemPrice;
    }

    @validate()
    public async create( @request(ItemPriceCreateRequest) data: ItemPriceCreateRequest): Promise<ItemPrice> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('body: ', JSON.stringify(body, null, 2));

        const shippingPrice = body.shippingPrice || {};
        const cryptocurrencyAddress = body.cryptocurrencyAddress || {};

        delete body.shippingPrice;
        delete body.cryptocurrencyAddress;

        if (!_.isEmpty(cryptocurrencyAddress)) {
            if (cryptocurrencyAddress.id) {
                body.cryptocurrency_address_id = cryptocurrencyAddress.id;
            } else {
                const relatedCryAddress = await this.cryptocurrencyAddressService.create(cryptocurrencyAddress as CryptocurrencyAddressCreateRequest);
                body.cryptocurrency_address_id = relatedCryAddress.Id;
            }
        }

        const itemPrice: resources.ItemPrice = await this.itemPriceRepo.create(body).then(value => value.toJSON());

        if (!_.isEmpty(shippingPrice)) {
            shippingPrice.item_price_id = itemPrice.id;
            await this.shippingPriceService.create(shippingPrice as ShippingPriceCreateRequest).then(value => value.toJSON());
        }
        return await this.findOne(itemPrice.id);
    }

    @validate()
    public async update(id: number, @request(ItemPriceUpdateRequest) data: ItemPriceUpdateRequest): Promise<ItemPrice> {
        const body = JSON.parse(JSON.stringify(data));
        const itemPrice = await this.findOne(id, false);

        itemPrice.Currency = body.currency;
        itemPrice.BasePrice = body.basePrice;

        const updatedItemPrice = await this.itemPriceRepo.update(id, itemPrice.toJSON());

        let relatedShippingPrice = updatedItemPrice.related('ShippingPrice').toJSON() || {};
        if (!_.isEmpty(relatedShippingPrice)) {
            const shippingPriceId = relatedShippingPrice.id;
            relatedShippingPrice = body.shippingPrice;
            relatedShippingPrice.item_price_id = id;
            await this.shippingPriceService.update(shippingPriceId, relatedShippingPrice as ShippingPriceUpdateRequest);
        } else {
            relatedShippingPrice = body.shippingPrice;
            relatedShippingPrice.item_price_id = id;
            await this.shippingPriceService.create(relatedShippingPrice as ShippingPriceCreateRequest);
        }

        let relatedCryptocurrencyAddress = updatedItemPrice.related('CryptocurrencyAddress').toJSON() || {};

        if (!_.isEmpty(relatedCryptocurrencyAddress)) {
            const cryptocurrencyAddressId = relatedCryptocurrencyAddress.id;
            relatedCryptocurrencyAddress = body.cryptocurrencyAddress;
            relatedCryptocurrencyAddress.item_price_id = id;
            await this.cryptocurrencyAddressService.update(cryptocurrencyAddressId, relatedCryptocurrencyAddress as CryptocurrencyAddressUpdateRequest);
        } else {
            relatedCryptocurrencyAddress = body.cryptocurrencyAddress;
            relatedCryptocurrencyAddress.item_price_id = id;
            await this.cryptocurrencyAddressService.create(relatedCryptocurrencyAddress as CryptocurrencyAddressCreateRequest);
        }
        return await this.findOne(id);
    }

    public async destroy(id: number): Promise<void> {

        const itemPrice = await this.findOne(id);
        const relatedCryptocurrencyAddress = itemPrice.related('CryptocurrencyAddress').toJSON();

        await this.itemPriceRepo.destroy(id);
        if (!_.isEmpty(relatedCryptocurrencyAddress.Profile)) {
            await this.cryptocurrencyAddressService.destroy(relatedCryptocurrencyAddress.Id);
        }
    }

    public async updatePaymentAddress(id: number, paymentAddressId: number): Promise<ItemPrice> {
        const itemPriceModel: ItemPrice = await this.findOne(id, false);
        itemPriceModel.set('cryptocurrencyAddressId', paymentAddressId);
        await this.itemPriceRepo.update(id, itemPriceModel.toJSON());
        return await this.findOne(id);
    }

}
