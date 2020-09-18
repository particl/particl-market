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
import { ShoppingCartUpdateRequest } from '../../requests/model/ShoppingCartUpdateRequest';
import { ShoppingCart } from '../../models/ShoppingCart';
import { ShoppingCartService } from '../../services/model/ShoppingCartService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class ShoppingCartUpdateCommand extends BaseCommand implements RpcCommandInterface<ShoppingCart> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ShoppingCartService) private shoppingCartService: ShoppingCartService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHOPPINGCART_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: cart, resources.ShoppingCart
     *  [1]: newCartName
     *
     * @param data
     * @returns {Promise<ShoppingCart>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ShoppingCart> {
        const shoppingCart: resources.ShoppingCart = data.params[0];

        return this.shoppingCartService.update(shoppingCart.id, {
            name: data.params[1]
        } as ShoppingCartUpdateRequest);
    }

    /**
     * data.params[]:
     *  [0]: cartId
     *  [1]: newCartName
     *
     * @param data
     * @returns {Promise<ShoppingCart>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('cartId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('name');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('cartId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('name', 'string');
        }

        // make sure ShoppingCart with the id exists
        data.params[0] = await this.shoppingCartService.findOne(data.params[0])
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('ShoppingCart');
            });

        return data;
    }

    public usage(): string {
        return this.getName() + ' <cartId> <newName> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <cartId>             - Id of the ShoppingCart we want to update. \n'
            + '    <newName>            - new name of the ShoppingCart. ';
    }

    public description(): string {
        return 'Update shopping cart name via cartId';
    }

    public example(): string {
        return 'cart ' + this.getName() + ' 1 updatedCart ';
    }
}
