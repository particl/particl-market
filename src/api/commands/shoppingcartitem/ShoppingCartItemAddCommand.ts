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
import { ShoppingCartItemCreateRequest } from '../../requests/model/ShoppingCartItemCreateRequest';
import { ShoppingCartItem } from '../../models/ShoppingCartItem';
import { ShoppingCartItemService } from '../../services/model/ShoppingCartItemService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ShoppingCartService } from '../../services/model/ShoppingCartService';
import { MessageException } from '../../exceptions/MessageException';

export class ShoppingCartItemAddCommand extends BaseCommand implements RpcCommandInterface<ShoppingCartItem> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ShoppingCartService) private shoppingCartService: ShoppingCartService,
        @inject(Types.Service) @named(Targets.Service.model.ShoppingCartItemService) private shoppingCartItemService: ShoppingCartItemService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHOPPINGCARTITEM_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: cart, resources.ShoppingCart
     *  [1]: listingItem, resources.ListingItem
     *
     * @param data
     * @returns {Promise<ShoppingCartItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ShoppingCartItem> {
        const shoppingCart: resources.ShoppingCart = data.params[0];
        const listingItem: resources.ListingItem = data.params[1];

        return this.shoppingCartItemService.create({
            shopping_cart_id: shoppingCart.id,
            listing_item_id: listingItem.id
        } as ShoppingCartItemCreateRequest);
    }

    /**
     * data.params[]:
     *  [0]: cartId, number
     *  [1]: listingItemId, number
     *
     * @param data
     * @returns {Promise<ShoppingCartItem>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('cartId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('listingItemId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('cartId', 'number');
        } else if (typeof data.params[1] !== 'number') {
            throw new InvalidParamException('listingItemId', 'number');
        }

        const cartId: number = data.params[0];
        const listingItemId: number = data.params[1];

        // make sure ShoppingCart exists
        data.params[0] = await this.shoppingCartService.findOne(cartId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('ShoppingCart');
            });

        // make sure ListingItem exists
        data.params[1] = await this.listingItemService.findOne(listingItemId)
            .catch(reason => {
                throw new ModelNotFoundException('ListingItem');
            });

        const shoppingCartItem: resources.ShoppingCartItem = await this.shoppingCartItemService.findOneByCartIdAndListingItemId(cartId, listingItemId)
            .then(value => value.toJSON())
            .catch(reason => undefined);

        if (!_.isNil(shoppingCartItem)) {
            this.log.warn(`ListingItem already added to ShoppingCart`);
            throw new MessageException(`ListingItem already added to ShoppingCart`);
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <cartId> <listingItemId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <cartId>                 - The id of the ShoppingCart. \n'
            + '    <listingItemId>          - The id of the ListingItem we want to add to the ShoppingCart.';
    }

    public description(): string {
        return 'Add a new ListingItem into ShoppingCart.';
    }

    public example(): string {
        return 'cartitem ' + this.getName() + ' 1 1';
    }
}
