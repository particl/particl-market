import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { AddressService } from '../../services/AddressService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Address } from '../../models/Address';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { AddressUpdateRequest } from '../../requests/AddressUpdateRequest';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import {CommandEnumType, Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

export class AddressUpdateCommand extends BaseCommand implements RpcCommandInterface<Address> {
    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.AddressService) private addressService: AddressService
    ) {
        super(Commands.ADDRESS_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: address id
     *  [1]: title
     *  [2]: addressLine1
     *  [3]: addressLine2
     *  [4]: zipCode
     *  [5]: city
     *  [6]: country/countryCode
     *  [7]: profileId
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Address>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any, rpcCommandFactory: RpcCommandFactory): Promise<Address> {
        // If countryCode is country, convert to countryCode.
        // If countryCode is country code, validate, and possibly throw error.
        let countryCode: string = data.params[5];
        countryCode = ShippingCountries.validate(this.log, countryCode);

        return this.addressService.update(data.params[0], {
            title : data.params[1],
            addressLine1 : data.params[2],
            addressLine2 : data.params[3],
            zipCode : data.params[4],
            city : data.params[5],
            country : countryCode,
            profile_id : data.params[7]
        } as AddressUpdateRequest);
    }

    public help(): string {
        return 'updateaddress <addressId> <title> <addressLine1> <addressLine2> <city> (<country> | <countryCode>) <profileId>\n'
            + '    <addressId>            - Numeric - The ID of the address we want to modify.\n'
            + '    <title>                - String - A short identifier for the address.\n'
            + '    <addressLine1>         - String - The first line of the address.\n'
            + '    <addressLine2>         - String - The second line of the address.\n'
            + '    <city>                 - String - The city of the address.\n'
            + '    <country>              - String - The country name of the address.\n'
            + '    <countryCode>          - String - Two letter country code of the address.\n'
            + '    <profileId>            - Numeric - The ID of the profile we want to associate\n'
            + '                              this address with.';
    }

    public example(): any {
        return null;
    }

}
