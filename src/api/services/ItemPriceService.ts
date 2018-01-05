import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ItemPriceRepository } from '../repositories/ItemPriceRepository';
import { ItemPrice } from '../models/ItemPrice';
import { ItemPriceCreateRequest } from '../requests/ItemPriceCreateRequest';
import { ItemPriceUpdateRequest } from '../requests/ItemPriceUpdateRequest';
import { ShippingPriceService } from './ShippingPriceService';
import { CryptocurrencyAddressService } from './CryptocurrencyAddressService';
import { CryptocurrencyAddressCreateRequest } from '../requests/CryptocurrencyAddressCreateRequest';
import { CryptocurrencyAddressUpdateRequest } from '../requests/CryptocurrencyAddressUpdateRequest';
import { ShippingPriceCreateRequest } from '../requests/ShippingPriceCreateRequest';
import { ShippingPriceUpdateRequest } from '../requests/ShippingPriceUpdateRequest';

export class ItemPriceService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CryptocurrencyAddressService) private cryptocurrencyAddressService: CryptocurrencyAddressService,
        @inject(Types.Service) @named(Targets.Service.ShippingPriceService) private shippingpriceService: ShippingPriceService,
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

        const shippingPrice = body.shippingPrice;
        const cryCurAddress = body.cryptocurrencyAddress;

        delete body.shippingPrice;
        delete body.cryptocurrencyAddress;

        // create related models, cryptocurrencyAddress
        if (!_.isEmpty(cryCurAddress)) {
            if (cryCurAddress.id) {
                // use existing
                // this.log.debug('cryptocurrencyAddress exists');
                body.cryptocurrency_address_id = cryCurAddress.id;
            } else {
                // new address
                // this.log.debug('cryptocurrencyAddress does not exist, creating new');
                const relatedCryAddress = await this.cryptocurrencyAddressService.create(cryCurAddress as CryptocurrencyAddressCreateRequest);
                body.cryptocurrency_address_id = relatedCryAddress.Id;
            }
        }

        // this.log.debug('creating: ', body);
        // create the itemPrice
        const itemPrice = await this.itemPriceRepo.create(body);
        // then create shippingPrice
        if (!_.isEmpty(shippingPrice)) {
            shippingPrice.item_price_id = itemPrice.Id;
            await this.shippingpriceService.create(shippingPrice as ShippingPriceCreateRequest);
        }
        // finally find and return the created itemPrice
        return await this.findOne(itemPrice.Id);
    }

    @validate()
    public async update(id: number, @request(ItemPriceUpdateRequest) data: ItemPriceUpdateRequest): Promise<ItemPrice> {

        const body = JSON.parse(JSON.stringify(data));

        // find the existing one without related
        const itemPrice = await this.findOne(id, false);

        // set new values
        itemPrice.Currency = body.currency;
        itemPrice.BasePrice = body.basePrice;

        // update itemPrice record
        const updatedItemPrice = await this.itemPriceRepo.update(id, itemPrice.toJSON());

        // ---
        // find related ShippingPrice
        let relatedShippingPrice = updatedItemPrice.related('ShippingPrice').toJSON() || {};
        if (!_.isEmpty(relatedShippingPrice)) {
            const shippingPriceId = relatedShippingPrice.id;
            relatedShippingPrice = body.shippingPrice;
            relatedShippingPrice.item_price_id = id;
            await this.shippingpriceService.update(shippingPriceId, relatedShippingPrice as ShippingPriceUpdateRequest);
        } else {
            relatedShippingPrice = body.shippingPrice;
            relatedShippingPrice.item_price_id = id;
            await this.shippingpriceService.create(relatedShippingPrice as ShippingPriceCreateRequest);
        }

        // ---
        // find related CryptocurrencyAddress
        let relatedCryptocurrencyAddress = updatedItemPrice.related('CryptocurrencyAddress').toJSON() || {};
        // let relatedShippingPrice = updatedItemPrice.related('ShippingPrice').toJSON() || {};
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
        // finally find and return the updated item price
        const newItemPrice = await this.findOne(id);
        return newItemPrice;
    }

    public async destroy(id: number): Promise<void> {

        const itemPrice = await this.findOne(id);
        const relatedCryptocurrencyAddress = itemPrice.related('CryptocurrencyAddress').toJSON();

        // this.log.debug('relatedCryptocurrencyAddress: ', JSON.stringify(relatedCryptocurrencyAddress, null, 2));

        await this.itemPriceRepo.destroy(id);
        if (!_.isEmpty(relatedCryptocurrencyAddress.Profile)) {
            await this.cryptocurrencyAddressService.destroy(relatedCryptocurrencyAddress.Id);
        }
    }
}
