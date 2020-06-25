// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { AddressService } from '../../services/model/AddressService';
import { ProfileService } from '../../services/model/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Address } from '../../models/Address';
import { AddressType } from '../../enums/AddressType';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class AddressListCommand extends BaseCommand implements RpcCommandInterface<resources.Address[]> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.AddressService) public addressService: AddressService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService
    ) {
        super(Commands.ADDRESS_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile: resources.Profile
     *  [1]: type: AddressType
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Bookshelf.Collection<Address>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<resources.Address[]> {
        const profile: resources.Profile = data.params[0];
        const type: AddressType = data.params[1];
        this.log.debug('type: ', JSON.stringify(type, null, 2));

        return _.filter(profile.ShippingAddresses, address => {
            this.log.debug('type: ' + type + ' === ' + address.type + ' : ' + (address.type === type));
            return address.type === type;
        });
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: type, optional, default: AddressType.SHIPPING_OWN
     *
     * @param data
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        }

        const profileId = data.params[0];                                                   // required
        const type = !_.isNil(data.params[1]) ? data.params[1] : AddressType.SHIPPING_OWN;  // optional

        if (typeof profileId !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        }

        const validAddressTypes = [AddressType.SHIPPING_OWN, AddressType.SHIPPING_BID];
        if (validAddressTypes.indexOf(type) === -1) {
            throw new InvalidParamException('addressType', 'AddressType');
        }

        // check that profile exists
        data.params[0] = await this.profileService.findOne(profileId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });
        data.params[1] = type;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> [type]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>              - number, the ID of the Profile which Addresses we want to list. '
            + '    <type>                   - AddressType, optional AddressType for filtering.';
    }

    public description(): string {
        return 'List all shipping addresses belonging to a profile, specified by profileId.';
    }

    public example(): string {
        return 'address ' + this.getName() + ' 1';
    }
}
