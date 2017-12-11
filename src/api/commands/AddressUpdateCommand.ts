import * as Bookshelf from 'bookshelf';
import { injectable, inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { AddressService } from '../services/AddressService';
import { RpcRequest } from '../requests/RpcRequest';
import { Address } from '../models/Address';
import {RpcCommand} from './RpcCommand';

// @injectable
export class AddressUpdateCommand implements RpcCommand<Address> {
    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.AddressService) private addressService: AddressService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'UpdateAddressCommand';
    }

    public async execute( @request(RpcRequest) data: any): Promise<Address> {
        return Bookshelf.Collection.apply(this.addressService.update(data.params[0], {
            title : data.params[1],
            addressLine1 : data.params[2],
            addressLine2 : data.params[3],
            city : data.params[4],
            country : data.params[5],
            profile_id : data.params[6]
        }));
    }

    public help(): string {
        return 'UpdateAddressCommand: TODO: Fill in help string.';
    }
}
