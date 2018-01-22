import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { AddressService } from '../../services/AddressService';
import {CommandEnumType, Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

export class AddressDestroyCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.AddressService) public addressService: AddressService
    ) {
        super(Commands.ADDRESS_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile id or name
     *  [1]: address id
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any, rpcCommandFactory: RpcCommandFactory): Promise<void> {
        return await this.addressService.destroy(data.params[0]);
    }

    public help(): string {
        return 'removeaddress <addressId>\n'
            + '    <addressId>            - The ID of the address we want to remove.';
    }

    public example(): any {
        return null;
    }
}
