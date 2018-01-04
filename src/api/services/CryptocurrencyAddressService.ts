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
    public async create( @request(CryptocurrencyAddressCreateRequest) body: CryptocurrencyAddressCreateRequest): Promise<CryptocurrencyAddress> {
        // If the request body was valid we will create the cryptocurrencyAddress
        const cryptocurrencyAddress = await this.cryptocurrencyAddressRepo.create(body).catch(e => {
            this.log.error('CryptocurrencyAddressService.create(): ', e);
            throw e;
        });
        // this.log.debug('CryptocurrencyAddressService created: ', JSON.stringify(cryptocurrencyAddress.toJSON(), null, 2));

        // finally find and return the created cryptocurrencyAddress
        return await this.findOne(cryptocurrencyAddress.Id);
    }

    @validate()
    public async update(id: number, @request(CryptocurrencyAddressUpdateRequest) body: CryptocurrencyAddressUpdateRequest): Promise<CryptocurrencyAddress> {

        // find the existing one without related
        const cryptocurrencyAddress = await this.findOne(id, false);

        // set new values
        cryptocurrencyAddress.Type = body.type;
        cryptocurrencyAddress.Address = body.address;

        // update cryptocurrencyAddress record
        return await this.cryptocurrencyAddressRepo.update(id, cryptocurrencyAddress.toJSON());
    }

    public async destroy(id: number): Promise<void> {
        await this.cryptocurrencyAddressRepo.destroy(id);
    }

}
