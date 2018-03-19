import { inject, named } from 'inversify';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseCommand } from '../BaseCommand';
import { Commands } from '../CommandEnumType';
import { ShoppingCartItemCreateRequest } from '../../requests/ShoppingCartItemCreateRequest';
import { ShoppingCartItem } from '../../models/ShoppingCartItem';
import { ShoppingCartItemService } from '../../services/ShoppingCartItemService';
import { ListingItemService } from '../../services/ListingItemService';
import { MessageException } from '../../exceptions/MessageException';

export class ShoppingCartItemAddCommand extends BaseCommand implements RpcCommandInterface<ShoppingCartItem> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ShoppingCartItemService) private shoppingCartItemService: ShoppingCartItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHOPPINGCARTITEM_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: cartId
     *  [1]: itemId | hash
     *
     * @param data
     * @returns {Promise<ShoppingCartItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ShoppingCartItem> {
        if (data.params[0] && data.params[1]) {
            // check if listingItem hash then get Id and pass as parameter
            let listingItemId = data.params[1];
            if (typeof data.params[1] !== 'number') {
                const listingItem = await this.listingItemService.findOneByHash(listingItemId);
                listingItemId = listingItem.id;
            }
            return this.shoppingCartItemService.create({
                shopping_cart_id: data.params[0],
                listing_item_id: listingItemId
            } as ShoppingCartItemCreateRequest);
        } else {
            throw new MessageException('cartId and listingItemId can\'t be blank');
        }
    }

    public usage(): string {
        return this.getName() + ' <cartId> (<itemId>|<hash>) ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <cartId>                 - The Id of the shopping cart we want to use. \n'
            + '    <itemId>                 - Id of the ListingItem we want to add to the cart. \n'
            + '    <hash>                   - Hash of the ListingItem we want to add to the cart. ';
    }

    public description(): string {
        return 'Add a new item into shopping cart as per given listingItem and cart.';
    }

    public example(): string {
        return 'cartitem ' + this.getName() + ' 1 1 b90cee25-036b-4dca-8b17-0187ff325dbb ';
    }
}
