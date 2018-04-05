import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { AddressRepository } from '../repositories/AddressRepository';
import { Address } from '../models/Address';
import { AddressCreateRequest } from '../requests/AddressCreateRequest';
import { AddressUpdateRequest } from '../requests/AddressUpdateRequest';

export class AddressService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.AddressRepository) public addressRepo: AddressRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Address>> {
        return this.addressRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Address> {
        const address = await this.addressRepo.findOne(id, withRelated);
        if (address === null) {
            this.log.warn(`Address with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return address;
    }

    @validate()
    public async create( @request(AddressCreateRequest) body: AddressCreateRequest): Promise<Address> {

        // todo: should propably validate country here

        // If the request body was valid we will create the address
        const address = await this.addressRepo.create(body);
        // finally find and return the created addressId
        const newAddress = await this.findOne(address.Id);
        return newAddress;
    }

    @validate()
    public async update(id: number, @request(AddressUpdateRequest) body: AddressUpdateRequest): Promise<Address> {
        // find the existing one without related
        const address = await this.findOne(id, false);
        // set new values
        address.Title = body.title;
        address.FirstName = body.firstName;
        address.LastName = body.lastName;
        address.AddressLine1 = body.addressLine1;
        address.AddressLine2 = body.addressLine2;
        address.ZipCode = body.zipCode;
        address.City = body.city;
        address.State = body.state;
        address.Country = body.country;
        // update address record
        const updatedAddress = await this.addressRepo.update(id, address.toJSON());
        return updatedAddress;
    }

    public async destroy(id: number): Promise<void> {
        return await this.addressRepo.destroy(id);
    }

}
