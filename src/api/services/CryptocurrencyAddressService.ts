import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ValidationException } from '../exceptions/ValidationException';
import { CryptocurrencyAddressRepository } from '../repositories/CryptocurrencyAddressRepository';
import { CryptocurrencyAddress } from '../models/CryptocurrencyAddress';
import { CryptocurrencyAddressCreateRequest } from '../requests/CryptocurrencyAddressCreateRequest';
import { CryptocurrencyAddressUpdateRequest } from '../requests/CryptocurrencyAddressUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class CryptocurrencyAddressService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.CryptocurrencyAddressRepository) public cryptocurrencyAddressRepo: CryptocurrencyAddressRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<CryptocurrencyAddress>> {
        return this.cryptocurrencyAddressRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<CryptocurrencyAddress> {
        const cryptocurrencyAddress = await this.cryptocurrencyAddressRepo.findOne(id, withRelated);
        if (cryptocurrencyAddress === null) {
            this.log.warn(`CryptocurrencyAddress with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return cryptocurrencyAddress;
    }

    @validate()
    public async create( @request(CryptocurrencyAddressCreateRequest) body: any): Promise<CryptocurrencyAddress> {

        this.log.error('CryptocurrencyAddressService.create, body: ', JSON.stringify(body, null, 2));

        if (body.item_price_id == null && body.profile_id == null) {
            throw new ValidationException('Request body is not valid', ['item_price_id or profile_id missing']);
        }

        // If the request body was valid we will create the cryptocurrencyAddress
        const cryptocurrencyAddress = await this.cryptocurrencyAddressRepo.create(body);

        // finally find and return the created cryptocurrencyAddress
        const newCryptocurrencyAddress = await this.findOne(cryptocurrencyAddress.Id);
        return newCryptocurrencyAddress;
    }

    @validate()
    public async update(id: number, @request(CryptocurrencyAddressUpdateRequest) body: any): Promise<CryptocurrencyAddress> {

        // find the existing one without related
        const cryptocurrencyAddress = await this.findOne(id, false);

        // set new values
        cryptocurrencyAddress.Type = body.type;
        cryptocurrencyAddress.Address = body.address;

        // update cryptocurrencyAddress record
        const updatedCryptocurrencyAddress = await this.cryptocurrencyAddressRepo.update(id, cryptocurrencyAddress.toJSON());
        return updatedCryptocurrencyAddress;
    }

    public async destroy(id: number): Promise<void> {
        await this.cryptocurrencyAddressRepo.destroy(id);
    }

    // TODO: REMOVE
    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<CryptocurrencyAddress>> {
        return this.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<CryptocurrencyAddress> {
        return this.findOne(data.params[0]);
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<CryptocurrencyAddress> {
        return this.create({
            data: data.params[0] // TODO: convert your params to CryptocurrencyAddressCreateRequest
        });
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<CryptocurrencyAddress> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to CryptocurrencyAddressUpdateRequest
        });
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

}
