import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { ShoppingCartsUpdateRequest } from '../../requests/ShoppingCartsUpdateRequest';
import { ShoppingCarts } from '../../models/ShoppingCarts';
import { ShoppingCartsService } from '../../services/ShoppingCartsService';

export class ShoppingCartUpdateCommand extends BaseCommand implements RpcCommandInterface<ShoppingCarts> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShoppingCartsService) private shoppingCartsService: ShoppingCartsService,
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
     * @returns {Promise<ShoppingCarts>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ShoppingCarts> {
        return this.shoppingCartsService.update(data.params[0], {
            name: data.params[1]
        } as ShoppingCartsUpdateRequest);
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
