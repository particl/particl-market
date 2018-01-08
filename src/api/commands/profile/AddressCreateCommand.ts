import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { AddressService } from '../../services/AddressService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Address } from '../../models/Address';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { AddressCreateRequest } from '../../requests/AddressCreateRequest';

export class AddressCreateCommand implements RpcCommandInterface<Address> {
    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.AddressService) private addressService: AddressService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'createaddress';
    }

    /**
     * data.params[]:
     *  [0]: title
     *  [1]: addressLine1
     *  [2]: addressLine2
     *  [3]: zipCode
     *  [4]: city
     *  [5]: country
     *  [6]: profileId
     *
     * @param data
     * @returns {Promise<Address>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Address> {
        this.log.debug('Attempting to create address');
        return await this.addressService.create({
            title : data.params[0],
            addressLine1 : data.params[1],
            addressLine2 : data.params[2],
            zipCode : data.params[3],
            city : data.params[4],
            country : data.params[5],
            profile_id : data.params[6]
        } as AddressCreateRequest);
    }

    public help(): string {
        return 'CreateAddressCommand: TODO: Fill in help string.';
    }
}
