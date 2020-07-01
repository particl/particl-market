// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import * as Faker from 'faker';
import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { ShoppingCartCreateRequest } from '../../requests/model/ShoppingCartCreateRequest';
import { ShoppingCart } from '../../models/ShoppingCart';
import { ShoppingCartService } from '../../services/model/ShoppingCartService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ProfileService } from '../../services/model/ProfileService';

export class ShoppingCartAddCommand extends BaseCommand implements RpcCommandInterface<ShoppingCart> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ShoppingCartService) private shoppingCartService: ShoppingCartService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHOPPINGCART_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: name
     *
     * @param data
     * @returns {Promise<ShoppingCart>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ShoppingCart> {
        const profile: resources.Profile = data.params[0];
        const createRequest = {
            profile_id : profile.id,
            name : data.params[1]
        } as ShoppingCartCreateRequest;

        this.log.debug('createRequest:', JSON.stringify(createRequest, null, 2));
        return this.shoppingCartService.create(createRequest);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: name, optional
     *
     * @param data
     * @returns {Promise<ShoppingCart>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('profileId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        } else if (!_.isNil(data.params[1]) && typeof data.params[1] !== 'string') {
            throw new InvalidParamException('name', 'string');
        }

        if (_.isNil(data.params[1])) {
            data.params[1] = Faker.random.uuid();
        }

        // make sure Profile with the id exists
        data.params[0] = await this.profileService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Profile');
            });

        return data;
    }

    public usage(): string {
        return this.getName() + ' <profileId> [name]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - number, Profile id for which the ShoppingCart will be created. '
            + '    <name>                   - string, optional, The name of the ShoppingCart. \n';
    }

    public description(): string {
        return 'Add a new ShoppingCart for Profile.';
    }

    public example(): string {
        return 'cart ' + this.getName() + ' 1 newCart ';
    }
}
