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

export class AddressCreateCommand implements RpcCommandInterface<Address> {
    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.AddressService) private addressService: AddressService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'createaddress';
        this.helpStr = 'createaddress <title> <addressLine1> <addressLine2> <city> (<country> | <countryCode>) <profileId>\n'
            + '    <title>                - String - A short identifier for the address.\n'
            + '    <addressLine1>         - String - The first line of the address.\n'
            + '    <addressLine2>         - String - The second line of the address.\n'
            + '    <city>                 - String - The city of the address.\n'
            + '    <country>              - String - The country name of the address.\n'
            + '    <countryCode>          - String - Two letter country code of the address.\n'
            + '    <profileId>            - Numeric - The ID of the profile we want to associate\n'
            + '                              this address with.';
    }

    /**
     * data.params[]:
     *  [0]: title
     *  [1]: addressLine1
     *  [2]: addressLine2
     *  [3]: zipCode
     *  [4]: city
     *  [5]: country/countryCode
     *  [6]: profileId
     *
     * @param data
     * @returns {Promise<Address>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Address> {
        this.log.debug('Attempting to create address');

        // If countryCode is country, convert to countryCode.
        // If countryCode is country code, validate, and possibly throw error.
        let countryCode: string = data.params[5];
        countryCode = ShippingCountries.validate(this.log, countryCode);

        return await this.addressService.create({
            title : data.params[0],
            addressLine1 : data.params[1],
            addressLine2 : data.params[2],
            zipCode : data.params[3],
            city : data.params[4],
            country : countryCode,
            profile_id : data.params[6]
        } as AddressCreateRequest);
    }

    public help(): string {
        return this.helpStr;
    }
}
