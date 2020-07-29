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
import { IdentityService } from '../../services/model/IdentityService';


export class ShoppingCartAddCommand extends BaseCommand implements RpcCommandInterface<ShoppingCart> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ShoppingCartService) private shoppingCartService: ShoppingCartService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHOPPINGCART_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: identity: resources.Identity
     *  [1]: name
     *
     * @param data
     * @returns {Promise<ShoppingCart>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ShoppingCart> {
        const identity: resources.Identity = data.params[0];
        return this.shoppingCartService.create({
            identity_id : identity.id,
            name : data.params[1]
        } as ShoppingCartCreateRequest);
    }

    /**
     * data.params[]:
     *  [0]: identityId
     *  [1]: name, optional
     *
     * @param data
     * @returns {Promise<ShoppingCart>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('identityId');
        }

        const identityId = data.params[0];
        const name = data.params[0];              // optional

        if (typeof identityId !== 'number') {
            throw new InvalidParamException('identityId', 'number');
        } else if (!_.isNil(name) && typeof name !== 'string') {
            throw new InvalidParamException('name', 'string');
        }

        if (_.isNil(name)) {
            data.params[1] = Faker.random.uuid();
        }

        // make sure Profile with the id exists
        data.params[0] = await this.identityService.findOne(identityId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Identity');
            });

        return data;
    }

    public usage(): string {
        return this.getName() + ' <identityId> [name]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <identityId>             - number, Identity id for which the ShoppingCart will be created. '
            + '    <name>                   - string, optional, The name of the ShoppingCart. \n';
    }

    public description(): string {
        return 'Add a new ShoppingCart for Identity.';
    }

    public example(): string {
        return 'cart ' + this.getName() + ' 1 newCart ';
    }
}
