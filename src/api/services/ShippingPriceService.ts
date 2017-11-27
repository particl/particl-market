import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ShippingPriceRepository } from '../repositories/ShippingPriceRepository';
import { ShippingPrice } from '../models/ShippingPrice';
import { ShippingPriceCreateRequest } from '../requests/ShippingPriceCreateRequest';
import { ShippingPriceUpdateRequest } from '../requests/ShippingPriceUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class ShippingPriceService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ShippingPriceRepository) public shippingPriceRepo: ShippingPriceRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ShippingPrice>> {
        return this.shippingPriceRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ShippingPrice> {
        const shippingPrice = await this.shippingPriceRepo.findOne(id, withRelated);
        if (shippingPrice === null) {
            this.log.warn(`ShippingPrice with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return shippingPrice;
    }

    @validate()
    public async create( @request(ShippingPriceCreateRequest) body: any): Promise<ShippingPrice> {

        // If the request body was valid we will create the shippingPrice
        const shippingPrice = await this.shippingPriceRepo.create(body);

        // finally find and return the created shippingPrice
        const newShippingPrice = await this.findOne(shippingPrice.id);
        return newShippingPrice;
    }

    @validate()
    public async update(id: number, @request(ShippingPriceUpdateRequest) body: any): Promise<ShippingPrice> {

        // find the existing one without related
        const shippingPrice = await this.findOne(id, false);

        // set new values
        shippingPrice.Domestic = body.domestic;
        shippingPrice.International = body.international;

        // update shippingPrice record
        const updatedShippingPrice = await this.shippingPriceRepo.update(id, shippingPrice.toJSON());

        return updatedShippingPrice;
    }

    public async destroy(id: number): Promise<void> {
        await this.shippingPriceRepo.destroy(id);
    }

    // TODO: remove
    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ShippingPrice>> {
        return this.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ShippingPrice> {
        return this.findOne(data.params[0]);
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ShippingPrice> {
        return this.create({
            data: data.params[0] // TODO: convert your params to ShippingPriceCreateRequest
        });
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ShippingPrice> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to ShippingPriceUpdateRequest
        });
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

}
