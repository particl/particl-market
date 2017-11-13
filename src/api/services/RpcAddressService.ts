import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { AddressService } from './AddressService';
import { RpcRequest } from '../requests/RpcRequest';
import { Address } from '../models/Address';

export class RpcAddressService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.AddressService) private addressService: AddressService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async findAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Address>> {
        return this.addressService.findAll();
    }

    /**
     * data.params[]:
     *  [0]: id to fetch
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async findOne( @request(RpcRequest) data: any): Promise<Address> {
        return this.addressService.findOne(data.params[0]);
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
    public async create( @request(RpcRequest) data: any): Promise<Address> {
        return this.addressService.create({
            title : data.params[0],
            addressLine1 : data.params[1],
            addressLine2 : data.params[2],
            city : data.params[3],
            country : data.params[4],
            profileId : data.params[5]
        });
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
    public async update( @request(RpcRequest) data: any): Promise<Address> {
        return this.addressService.update(data.params[0], {
            title : data.params[1],
            addressLine1 : data.params[2],
            addressLine2 : data.params[3],
            city : data.params[4],
            country : data.params[5],
            profileId : data.params[6]
        });
    }

    @validate()
    public async destroy( @request(RpcRequest) data: any): Promise<void> {
        return this.addressService.destroy(data.params[0]);
    }
}
