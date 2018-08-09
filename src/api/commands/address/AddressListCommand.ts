// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { AddressService } from '../../services/AddressService';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Address } from '../../models/Address';
import { AddressType } from '../../enums/AddressType';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { AddressCreateRequest } from '../../requests/AddressCreateRequest';
import { ShippingCountries } from '../../../core/helpers/ShippingCountries';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

export class AddressListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Address>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.AddressService) public addressService: AddressService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService
    ) {
        super(Commands.ADDRESS_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: type, optional, default: AddressType.SHIPPING_OWN
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Bookshelf.Collection<Address>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<Address>> {
        const profileId = data.params[0];
        if (!profileId) {
            throw new Error('No profileId for a command');
        }

        const profile = await this.profileService.findOne(profileId, true);
        const type = data.params[1] ? data.params[1] : AddressType.SHIPPING_OWN;

        // Return SHIPPING_OWN addresses by default
        return profile.toJSON().ShippingAddresses.filter((address) => address.type === type);
    }

    public usage(): string {
        return this.getName() + ' [<profileId>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>              - Numeric - The ID of the profile we want to associate \n'
            + '                                this address with. ';
    }

    public description(): string {
        return 'List all addresses belonging to a profile.';
    }

    public example(): string {
        return 'address ' + this.getName() + ' 1';
    }
}
