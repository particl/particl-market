// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { ShoppingCartService } from '../../services/model/ShoppingCartService';
import { ShoppingCart } from '../../models/ShoppingCart';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { MissingParamException } from '../../exceptions/MissingParamException';

export class ShoppingCartGetCommand extends BaseCommand implements RpcCommandInterface<resources.ShoppingCart> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ShoppingCartService) private shoppingCartService: ShoppingCartService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHOPPINGCART_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: cart, resources.ShoppingCart
     *
     * @param data
     * @returns {Promise<resources.ShoppingCart>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.ShoppingCart> {
        return data.params[0];
    }

    /**
     * data.params[]:
     *  [0]: cartId
     *
     * @param data
     * @returns {Promise<ShoppingCart>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('cartId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('id', 'number');
        }

        data.params[0] = await this.shoppingCartService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('ShoppingCart');
            });

        return data;
    }

    public usage(): string {
        return this.getName() + ' <cartId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <cartId>                 - The id of the ShoppingCart. ';
    }

    public description(): string {
        return 'Get ShoppingCart by given id';
    }

    public example(): string {
        return 'cart ' + this.getName() + ' 1 ';
    }
}
