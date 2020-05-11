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
import { ShoppingCartCreateRequest } from '../../requests/model/ShoppingCartCreateRequest';
import { ShoppingCart } from '../../models/ShoppingCart';
import { ShoppingCartService } from '../../services/model/ShoppingCartService';

export class ShoppingCartAddCommand extends BaseCommand implements RpcCommandInterface<ShoppingCart> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ShoppingCartService) private shoppingCartService: ShoppingCartService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHOPPINGCART_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: name
     *  [1]: profileId
     *
     * @param data
     * @returns {Promise<ShoppingCart>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ShoppingCart> {
        return this.shoppingCartService.create({
            name : data.params[0],
            profile_id : data.params[1]
        } as ShoppingCartCreateRequest);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        return data;
    }

    public usage(): string {
        return this.getName() + ' <name> <profileId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <name>                   - The name of the ShoppingCart. \n'
            + '    <profileId>              - Profile id for which ShoppingCart will be created. ';
    }

    public description(): string {
        return 'Add a new ShoppingCart for Profile.';
    }

    public example(): string {
        return 'cart ' + this.getName() + ' newCart 1 ';
    }
}
