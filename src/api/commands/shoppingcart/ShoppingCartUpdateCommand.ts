// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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
     *  [0]: cartId
     *  [1]: newCartName
     *
     * @param data
     * @returns {Promise<ShoppingCart>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ShoppingCart> {
        return this.shoppingCartService.update(data.params[0], {
            name: data.params[1]
        } as ShoppingCartUpdateRequest);
    }

    public usage(): string {
        return this.getName() + ' <cartId> <newCartName> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <cartId>                 - Id of the shopping cart we want to update. \n'
            + '    <newCartName>            - new name of shopping cart. ';
    }

    public description(): string {
        return 'Update shopping cart name via cartId';
    }

    public example(): string {
        return 'cart ' + this.getName() + ' 1 updatedCart ';
    }
}
