import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { ShoppingCartItems } from '../../models/ShoppingCartItems';
import { ShoppingCartItemsService } from '../../services/ShoppingCartItemsService';
import { MessageException } from '../../exceptions/MessageException';

export class ShoppingCartItemListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ShoppingCartItems>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShoppingCartItemsService) private shoppingCartItemsService: ShoppingCartItemsService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHOPPINGCARTITEM_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: cartId
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<ShoppingCartItems>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ShoppingCartItems>> {
        return this.shoppingCartItemsService.findListItemsByCartId(data.params[0]);
    }

    public usage(): string {
        return this.getName() + ' <cartId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <cartId>                 - The Id of the shopping cart whose listingItem we want. ';
    }

    public description(): string {
        return 'List all item of shopping cart as per given cartId.';
    }
}
