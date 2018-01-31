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
import { ShippingZips } from '../../../core/helpers/ShippingZips';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { NotFoundException } from '../../exceptions/NotFoundException';

export class AddressCreateCommand extends BaseCommand implements RpcCommandInterface<Address> {
    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.AddressService) private addressService: AddressService
    ) {
        super(Commands.ADDRESS_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: title
     *  [2]: addressLine1
     *  [3]: addressLine2
     *  [4]: city
     *  [5]: state
     *  [6]: country/countryCode
     *  [7]: zipCode
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Address>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any, rpcCommandFactory: RpcCommandFactory): Promise<Address> {
        this.log.debug('Attempting to create address');

        // If countryCode is country, convert to countryCode.
        // If countryCode is country code, validate, and possibly throw error.
        let countryCode: string = data.params[6];
        countryCode = ShippingCountries.validate(this.log, countryCode);

        // Validate ZIP code
        const zipCodeStr = data.params[7];
        if (!ShippingZips.validate(countryCode, zipCodeStr)) {
            throw new NotFoundException('ZIP/postal-code, country code, combination not valid.');
        }

        return await this.addressService.create({
            profile_id : data.params[0],
            title : data.params[1],
            addressLine1 : data.params[2],
            addressLine2 : data.params[3],
            city : data.params[4],
            state : data.params[5],
            country : countryCode,
            zipCode : zipCodeStr
        } as AddressCreateRequest);
    }

    public help(): string {
        return this.getName() + ' <profileId> <title> <addressLine1> <addressLine2> <city> <state> (<countryName>|<countryCode>) [<zip>]'
            + '    <profileId>            - Numeric - The ID of the profile we want to associate\n'
            + '                              this address with.\n'
            + '    <title>                - String - A short identifier for the address.\n'
            + '    <addressLine1>         - String - The first line of the address.\n'
            + '    <addressLine2>         - String - The second line of the address.\n'
            + '    <city>                 - String - The city of the address.\n'
            + '    <state>                 - String - The state of the address.\n'
            + '    <country>              - String - The country name of the address.\n'
            + '    <countryCode>          - String - Two letter country code of the address.\n'
            + '    <zip>                  - String - The ZIP code of your address.';
    }

    public description(): string {
        return 'Create an address and associate it with a profile.';
    }
}
