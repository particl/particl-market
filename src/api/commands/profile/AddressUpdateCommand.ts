import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { AddressService } from '../../services/AddressService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Address } from '../../models/Address';
import { RpcCommand } from '../RpcCommand';

export class AddressUpdateCommand implements RpcCommand<Address> {
    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.AddressService) private addressService: AddressService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'updateaddress';
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
    public async execute( @request(RpcRequest) data: any): Promise<Address> {
        return this.addressService.update(data.params[0], {
            title : data.params[1],
            addressLine1 : data.params[2],
            addressLine2 : data.params[3],
            city : data.params[4],
            country : data.params[5],
            profile_id : data.params[6]
        });
    }

    public help(): string {
        return 'UpdateAddressCommand: TODO: Fill in help string.';
    }
}
