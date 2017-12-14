import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ItemPriceRepository } from '../repositories/ItemPriceRepository';
import { ItemPrice } from '../models/ItemPrice';
import { ItemPriceCreateRequest } from '../requests/ItemPriceCreateRequest';
import { ItemPriceUpdateRequest } from '../requests/ItemPriceUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';
import { ShippingPriceService } from './ShippingPriceService';
import { CryptocurrencyAddressService } from './CryptocurrencyAddressService';

export class ItemPriceService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CryptocurrencyAddressService) private cryptocurrencyaddressService: CryptocurrencyAddressService,
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
    public async create( @request(ItemPriceCreateRequest) data: any): Promise<ItemPrice> {

        const body = JSON.parse(JSON.stringify(data));

        const shippingPrice = body.shippingPrice;
        const cryptocurrencyAddress = body.address;

        delete body.shippingPrice;
        delete body.address;

        // If the request body was valid we will create the itemPrice
        const itemPrice = await this.itemPriceRepo.create(body);
        // this.log.debug('itemprice created: ', JSON.stringify(itemPrice));

        // then create shippingPrice
        if (shippingPrice) {
            shippingPrice.item_price_id = itemPrice.Id;
            await this.shippingpriceService.create(shippingPrice);
        }
        // then create address
        if (cryptocurrencyAddress) {
            cryptocurrencyAddress.item_price_id = itemPrice.Id;
            await this.cryptocurrencyaddressService.create(cryptocurrencyAddress);
        }
        // finally find and return the created itemPrice
        const newItemPrice = await this.findOne(itemPrice.id);
        return newItemPrice;
    }

    @validate()
    public async update(id: number, @request(ItemPriceUpdateRequest) data: any): Promise<ItemPrice> {

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
        let relatedShippingPrice = updatedItemPrice.related('ShippingPrice').toJSON();

        // delete it
        await this.shippingpriceService.destroy(relatedShippingPrice.id);

        // and create new related data
        relatedShippingPrice = body.shippingPrice;
        relatedShippingPrice.item_price_id = id;
        await this.shippingpriceService.create(relatedShippingPrice);

        // ---
        // find related CryptocurrencyAddress
        let relatedCryptocurrencyAddress = updatedItemPrice.related('Address').toJSON();

        // delete it
        await this.cryptocurrencyaddressService.destroy(relatedCryptocurrencyAddress.id);

        // and create new related data
        relatedCryptocurrencyAddress = body.address;
        relatedCryptocurrencyAddress.item_price_id = id;
        await this.cryptocurrencyaddressService.create(relatedCryptocurrencyAddress);

        // finally find and return the updated item price
        const newItemPrice = await this.findOne(id);
        return newItemPrice;
    }

    public async destroy(id: number): Promise<void> {
        await this.itemPriceRepo.destroy(id);
    }

    // TODO: remove this rpc stuff
    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemPrice>> {
        return this.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ItemPrice> {
        return this.findOne(data.params[0]);
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ItemPrice> {
        return this.create({
            currency: data.params[0],
            basePrice: data.params[1],
            shippingPrice: {
                domestic: data.params[2],
                international: data.params[3]
            },
            address: {
                type: data.params[4],
                address: data.params[5]
            }
        });
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ItemPrice> {
        return this.update(data.params[0], {
            currency: data.params[1],
            basePrice: data.params[2],
            shippingPrice: {
                domestic: data.params[3],
                international: data.params[4]
            },
            address: {
                type: data.params[5],
                address: data.params[6]
            }
        });
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

}
