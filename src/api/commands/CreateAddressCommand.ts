import * as Bookshelf from 'bookshelf';
import { Container, injectable, inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { AddressService } from '../services/AddressService';
import { RpcRequest } from '../requests/RpcRequest';
import { Address } from '../models/Address';
import {RpcCommand} from './RpcCommand';
import {Collection} from 'bookshelf';

// @injectable()
export class CreateAddressCommand implements RpcCommand<Address> {
    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.AddressService) private addressService: AddressService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'CreateAddressCommand';
    }

    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Address>> {
        this.log.error('Attempting to create address');
        return Bookshelf.Collection.apply(this.addressService.create({
            title : data.params[0],
            addressLine1 : data.params[1],
            addressLine2 : data.params[2],
            city : data.params[3],
            country : data.params[4],
            profile_id : data.params[5]
        })
        );
    }

    public help(): string {
        return 'CreateAddressCommand: TODO: Fill in help string.';
    }
}
// const container = new Container();
// container.bind<RpcCommand<Address>>(CreateAddressCommand).to(CreateAddressCommand);
