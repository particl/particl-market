import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { AddressService } from '../../services/AddressService';


export class AddressDestroyCommand implements RpcCommandInterface<void> {
    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.AddressService) public addressService: AddressService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'removeaddress';
    }

    /**
     * data.params[]:
     *  [0]: profile id or name
     *  [1]: address id
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        return await this.addressService.destroy(data.params[0]);
    }

    public help(): string {
        return 'removeaddress <addressId>\n'
            + '    <addressId>            - The ID of the address we want to remove.';
    }
}
