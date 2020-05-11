// Copyright (c) 2017-2020, The Particl Market developers
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
import { ShoppingCartService } from '../../services/model/ShoppingCartService';
import { ShoppingCart } from '../../models/ShoppingCart';

export class ShoppingCartGetCommand extends BaseCommand implements RpcCommandInterface<ShoppingCart> {

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
     *  [0]: cartId
     *
     * @param data
     * @returns {Promise<ShoppingCart>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ShoppingCart> {
        return await this.shoppingCartService.findOne(data.params[0]);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
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
