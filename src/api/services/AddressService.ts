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
import { RpcRequest } from '../requests/RpcRequest';


export class AddressService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.AddressRepository) public addressRepo: AddressRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Address>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<Address>> {
        return this.addressRepo.findAll();
    }

    /**
     * data.params[]:
     *  [0]: id to fetch
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<Address> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Address> {
        const address = await this.addressRepo.findOne(id, withRelated);
        if (address === null) {
            this.log.warn(`Address with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return address;
    }

    /**
     * data.params[]:
     *  [0]: title
     *  [1]: addressLine1
     *  [2]: addressLine2
     *  [3]: city
     *  [4]: country
     *  [5]: profileId
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<Address> {
        return this.create({
            title : data.params[0],
            addressLine1 : data.params[1],
            addressLine2 : data.params[2],
            city : data.params[3],
            country : data.params[4],
            profileId : data.params[5]
        });
    }

    @validate()
    public async create( @request(AddressCreateRequest) body: any): Promise<Address> {
        // If the request body was valid we will create the address
        const address = await this.addressRepo.create(body);
        // finally find and return the created addressId
        const newAddress = await this.findOne(address.Id);
        return newAddress;
    }

    /**
     * data.params[]:
     *  [0]: address id
     *  [1]: title
     *  [2]: addressLine1
     *  [3]: addressLine2
     *  [4]: city
     *  [5]: country
     *  [6]: profileId
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<Address> {
        return this.update(data.params[0], {
            title : data.params[1],
            addressLine1 : data.params[2],
            addressLine2 : data.params[3],
            city : data.params[4],
            country : data.params[5],
            profileId : data.params[6]
        });
    }

    @validate()
    public async update(id: number, @request(AddressUpdateRequest) body: any): Promise<Address> {

        // find the existing one without related
        const address = await this.findOne(id, false);
        // set new values
        address.Title = body.title;
        address.AddressLine1 = body.addressLine1;
        address.AddressLine2 = body.addressLine2;
        address.City = body.city;
        address.Country = body.country;
        address.Profile = body.profileId;

        // update address record
        const updatedAddress = await this.addressRepo.update(id, address.toJSON());
        return updatedAddress;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.addressRepo.destroy(id);
    }

}
