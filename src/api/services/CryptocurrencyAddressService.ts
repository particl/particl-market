import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
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

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<CryptocurrencyAddress>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<CryptocurrencyAddress>> {
        return this.cryptocurrencyAddressRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<CryptocurrencyAddress> {
        return this.findOne(data.params[0]);
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
    public async rpcCreate( @request(RpcRequest) data: any): Promise<CryptocurrencyAddress> {
        return this.create({
            data: data.params[0] // TODO: convert your params to CryptocurrencyAddressCreateRequest
        });
    }

    @validate()
    public async create( @request(CryptocurrencyAddressCreateRequest) body: any): Promise<CryptocurrencyAddress> {

        // TODO: extract and remove related models from request
        // const cryptocurrencyAddressRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the cryptocurrencyAddress
        const cryptocurrencyAddress = await this.cryptocurrencyAddressRepo.create(body);

        // TODO: create related models
        // cryptocurrencyAddressRelated._id = cryptocurrencyAddress.Id;
        // await this.cryptocurrencyAddressRelatedService.create(cryptocurrencyAddressRelated);

        // finally find and return the created cryptocurrencyAddress
        const newCryptocurrencyAddress = await this.findOne(cryptocurrencyAddress.id);
        return newCryptocurrencyAddress;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<CryptocurrencyAddress> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to CryptocurrencyAddressUpdateRequest
        });
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

        // TODO: yes, this is stupid
        // TODO: find related record and delete it
        // let cryptocurrencyAddressRelated = updatedCryptocurrencyAddress.related('CryptocurrencyAddressRelated').toJSON();
        // await this.cryptocurrencyAddressService.destroy(cryptocurrencyAddressRelated.id);

        // TODO: recreate related data
        // cryptocurrencyAddressRelated = body.cryptocurrencyAddressRelated;
        // cryptocurrencyAddressRelated._id = cryptocurrencyAddress.Id;
        // const createdCryptocurrencyAddress = await this.cryptocurrencyAddressService.create(cryptocurrencyAddressRelated);

        // TODO: finally find and return the updated cryptocurrencyAddress
        // const newCryptocurrencyAddress = await this.findOne(id);
        // return newCryptocurrencyAddress;

        return updatedCryptocurrencyAddress;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.cryptocurrencyAddressRepo.destroy(id);
    }

}
