// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { AddressService } from '../../services/model/AddressService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Address } from '../../models/Address';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { AddressCreateRequest } from '../../requests/model/AddressCreateRequest';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { ShippingZips } from '../../../core/helpers/ShippingZips';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { ZipCodeNotFoundException } from '../../exceptions/ZipCodeNotFoundException';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { AddressType } from '../../enums/AddressType';

export class AddressAddCommand extends BaseCommand implements RpcCommandInterface<Address> {
    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.AddressService) private addressService: AddressService
    ) {
        super(Commands.ADDRESS_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: title
     *  [2]: firstName
     *  [3]: lastName
     *  [4]: addressLine1
     *  [5]: addressLine2
     *  [6]: city
     *  [7]: state
     *  [8]: country/countryCode
     *  [9]: zipCode
     *  [10]: type, optional, default: AddressType.SHIPPING_OWN
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Address>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Address> {
        const newAddress = {
            profile_id: data.params[0],
            title: data.params[1],
            firstName: data.params[2],
            lastName: data.params[3],
            addressLine1: data.params[4],
            addressLine2: data.params[5],
            city: data.params[6],
            state: data.params[7],
            country: data.params[8],
            zipCode: data.params[9],
            type: data.params[10]
        } as AddressCreateRequest;

        return await this.addressService.create(newAddress);
    }


    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('title');
        } else if (data.params.length < 3) {
            throw new MissingParamException('firstName');
        } else if (data.params.length < 4) {
            throw new MissingParamException('lastName');
        } else if (data.params.length < 5) {
            throw new MissingParamException('addressLine1');
        } else if (data.params.length < 6) {
            throw new MissingParamException('addressLine2');
        } else if (data.params.length < 7) {
            throw new MissingParamException('city');
        } else if (data.params.length < 8) {
            throw new MissingParamException('state');
        } else if (data.params.length < 9) {
            throw new MissingParamException('country');
        } else if (data.params.length < 10) {
            throw new MissingParamException('zipCode');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('title', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('firstName', 'string');
        } else if (typeof data.params[3] !== 'string') {
            throw new InvalidParamException('lastName', 'string');
        } else if (typeof data.params[4] !== 'string') {
            throw new InvalidParamException('addressLine1', 'string');
        } else if (typeof data.params[5] !== 'string') {
            throw new InvalidParamException('addressLine2', 'string');
        } else if (typeof data.params[6] !== 'string') {
            throw new InvalidParamException('city', 'string');
        } else if (typeof data.params[7] !== 'string') {
            throw new InvalidParamException('state', 'string');
        } else if (typeof data.params[8] !== 'string') {
            throw new InvalidParamException('country', 'string');
        } else if (typeof data.params[9] !== 'string') {
            throw new InvalidParamException('zipCode', 'string');
        }

        // If countryCode is country, convert to countryCode.
        // If countryCode is country code, validate, and possibly throw error.
        data.params[8] = ShippingCountries.convertAndValidate(data.params[8]);

        // TODO: why is zip given after country?
        // Validate ZIP code
        if (!ShippingZips.validate(data.params[8], data.params[9])) {
            throw new ZipCodeNotFoundException(data.params[9]);
        }

        if (!_.isNil(data.params[10])) {
            const type = data.params[10];
            const validTypes = [AddressType.SHIPPING_BID, AddressType.SHIPPING_OWN];
            if (type && !_.includes(validTypes, type)) {
                throw new InvalidParamException('type', 'AddressType');
            }
        } else {
            data.params[10] = AddressType.SHIPPING_OWN;
        }
        return data;
    }

    // tslint:disable:max-line-length
    public usage(): string {
        return this.getName() + ' <profileId> <title> <firstName> <lastName> <addressLine1> <addressLine2> <city> <state> (<countryName>|<countryCode>) <zip> ';
    }
    // tslint:enable:max-line-length

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>              - Numeric - The ID of the profile we want to associate \n'
            + '                                this address with. \n'
            + '    <title>                  - String - A short identifier for the address. \n'
            + '    <firstName>              - String - First Name of user. \n'
            + '    <lastName>               - String - Last Name of user. \n'
            + '    <addressLine1>           - String - The first line of the address. \n'
            + '    <addressLine2>           - String - The second line of the address. \n'
            + '    <city>                   - String - The city of the address. \n'
            + '    <state>                  - String - The state of the address. \n'
            + '    <country>                - String - The country name of the address. \n'
            + '    <countryCode>            - String - Two letter country code of the address. \n'
            + '    <zip>                    - String - The ZIP code of your address. ';
    }

    public description(): string {
        return 'Create a shipping address and associate it with a profile.';
    }

    public example(): string {
        return 'address ' + this.getName() + ' 1 myLocation \'Johnny\' \'Deep\' \'123 Fake St\' \'\' Springfield NT \'United States\' 90701';
    }
}
