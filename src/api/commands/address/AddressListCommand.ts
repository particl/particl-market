import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { AddressService } from '../../services/AddressService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Address } from '../../models/Address';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { AddressCreateRequest } from '../../requests/AddressCreateRequest';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MessageException } from '../../exceptions/MessageException';

export class AddressListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Address>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.AddressService) public addressService: AddressService
    ) {
        super(Commands.ADDRESS_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * TODO: Update command to match help().
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Bookshelf.Collection<Address>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<Address>> {
        throw new MessageException('Not implemented.');
    }

    public help(): string {
        return this.getName() + ' [<profileId>]\n'
            + '    <profileId>            - Numeric - The ID of the profile we want to associate\n'
            + '                              this address with.';
    }

    public description(): string {
        return 'List all addresses belonging to a profile.';
    }
}
