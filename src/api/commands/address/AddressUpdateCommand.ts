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
import { ShippingZips } from '../../../core/helpers/ShippingZips';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { NotFoundException } from '../../exceptions/NotFoundException';

export class AddressUpdateCommand extends BaseCommand implements RpcCommandInterface<Address> {
    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.AddressService) private addressService: AddressService
    ) {
        super(Commands.ADDRESS_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     *  [0]: address id
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
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Address> {
        this.log.debug('AddressUpdateCommand.update(): 100');
        // If countryCode is country, convert to countryCode.
        // If countryCode is country code, validate, and possibly throw error.
        let countryCode: string = data.params[6];
        countryCode = ShippingCountries.validate(this.log, countryCode);
        this.log.debug('AddressUpdateCommand.update(): 200');

        // Validate ZIP code
        const zipCodeStr = data.params[7];
        if (!ShippingZips.validate(countryCode, zipCodeStr)) {
            this.log.debug('AddressUpdateCommand.update(): 250');
            throw new NotFoundException('ZIP/postal-code, country code, combination not valid.');
        }
        this.log.debug('AddressUpdateCommand.update(): 300');

        return this.addressService.update(data.params[0], {
            title : data.params[1],
            addressLine1 : data.params[2],
            addressLine2 : data.params[3],
            city : data.params[4],
            state : data.params[5],
            country : countryCode,
            zipCode : zipCodeStr
        } as AddressUpdateRequest);
    }

    public usage(): string {
        return this.getName() + ' <addressId> <title> <addressLine1> <addressLine2> <city> <state> (<countryName>|<countryCode>) [<zip>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <addressId>              - Numeric - The ID of the address we want to modify. \n'
            + '    <title>                  - String - A short identifier for the address. \n'
            + '    <addressLine1>           - String - The first line of the address. \n'
            + '    <addressLine2>           - String - The second line of the address. \n'
            + '    <city>                   - String - The city of the address. \n'
            + '    <state>                  - String - The state of the address. \n'
            + '    <country>                - String - The country name of the address. \n'
            + '    <countryCode>            - String - Two letter country code of the address. \n'
            + '    <zip>                    - String - The ZIP code of your address. ';
    }

    public description(): string {
        return 'Update the details of an address given by ID.';
    }
}
