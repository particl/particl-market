import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { ShoppingCartItemsService } from '../../services/ShoppingCartItemsService';

export class ShoppingCartClearCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShoppingCartItemsService) private shoppingCartItemsService: ShoppingCartItemsService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHOPPINGCART_CLEAR);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: cartId
     *
     * @param data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {
        return this.shoppingCartItemsService.clearCart(data.params[0]);
    }

    public help(): string {
        return this.getName() + ' <cartId> \n'
            + '    <cartId>                 - The Id of the shopping cart we want to clear. ';
    }

    public description(): string {
        return 'Clear shopping cart items, associated with given shopping cart id.';
    }
}
