import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { ShoppingCartItem } from '../../models/ShoppingCartItem';
import { ShoppingCartItemService } from '../../services/ShoppingCartItemService';
import { MessageException } from '../../exceptions/MessageException';

export class ShoppingCartItemListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ShoppingCartItem>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShoppingCartItemService) private shoppingCartItemService: ShoppingCartItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHOPPINGCARTITEM_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: cartId, number
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<ShoppingCartItem>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ShoppingCartItem>> {
        return this.shoppingCartItemService.findListItemsByCartId(data.params[0]);
    }

    public usage(): string {
        return this.getName() + ' <cartId> [withRelated]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <cartId>                 - The Id of the shopping cart whose listingItem we want. \n '

            + '    <withRelated>            - [optional] Boolean - Whether we want to include all sub objects. ';
    }

    public description(): string {
        return 'List all item of shopping cart as per given cartId.';
    }

    public example(): string {
        return 'cartitem ' + this.getName() + ' 1 ' + true;
    }
}
