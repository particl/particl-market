// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import {Logger as LoggerType} from '../../../core/Logger';
import {inject, named} from 'inversify';
import {request, validate} from '../../../core/api/Validate';
import {Core, Targets, Types} from '../../../constants';
import {ItemCategoryService} from '../../services/model/ItemCategoryService';
import {RpcRequest} from '../../requests/RpcRequest';
import {ItemCategoryCreateRequest} from '../../requests/model/ItemCategoryCreateRequest';
import {ItemCategory} from '../../models/ItemCategory';
import {RpcCommandInterface} from '../RpcCommandInterface';
import {Commands} from '../CommandEnumType';
import {BaseCommand} from '../BaseCommand';
import {MissingParamException} from '../../exceptions/MissingParamException';
import {InvalidParamException} from '../../exceptions/InvalidParamException';
import {MarketService} from '../../services/model/MarketService';
import {ConfigurableHasher} from 'omp-lib/dist/hasher/hash';
import {HashableItemCategoryCreateRequestConfig} from '../../factories/hashableconfig/createrequest/HashableItemCategoryCreateRequestConfig';
import {MarketType} from '../../enums/MarketType';
import {MessageException} from '../../exceptions/MessageException';

export class ItemCategoryAddCommand extends BaseCommand implements RpcCommandInterface<ItemCategory> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService
    ) {
        super(Commands.CATEGORY_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * creates a new user defined category
     *
     * data.params[]:
     *  [0]: market: resources.Market
     *  [1]: categoryName
     *  [2]: description
     *  [3]: parentItemCategory: resources.ItemCategory
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemCategory> {

        const market: resources.Market = data.params[0];
        const parentItemCategory: resources.ItemCategory = data.params[3];

        const createRequest = {
            name: data.params[1],
            description: data.params[2],
            market: market.receiveAddress,
            parent_item_category_id: parentItemCategory.id
        } as ItemCategoryCreateRequest;
        createRequest.key = ConfigurableHasher.hash(createRequest, new HashableItemCategoryCreateRequestConfig());

        this.log.debug('createRequest: ', JSON.stringify(createRequest, null, 2));

        return await this.itemCategoryService.create(createRequest);
    }

    /**
     * data.params[]:
     *  [0]: marketId
     *  [1]: categoryName
     *  [2]: description
     *  [3]: parentItemCategoryId
     *
     * parentItemCategoryId is not optional since creating root categories should not be allowed this way.
     * root category should be created when market is created.
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('marketId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('categoryName');
        } else if (data.params.length < 3) {
            throw new MissingParamException('description');
        } else if (data.params.length < 4) {
            throw new MissingParamException('parentItemCategoryId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('categoryName', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('description', 'string');
        } else if (typeof data.params[3] !== 'number') {
            throw new InvalidParamException('parentItemCategoryId', 'number');
        }

        const market: resources.Market = await this.marketService.findOne(data.params[0]).then(value => value.toJSON());
        const parentCategory: resources.ItemCategory = await this.itemCategoryService.findOne(data.params[3]).then(value => value.toJSON());

        data.params[0] = market;

        if (market.type !== MarketType.STOREFRONT_ADMIN) {
            throw new MessageException('You can only add ItemCategories on Storefronts if you have the publish rights.');
        }

        if (market.receiveAddress !== parentCategory.market) {
            throw new MessageException('Parent ItemCategory belongs to different Market.');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <marketId> <categoryName> <description> <parentItemCategoryId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <marketId>                    - number - Market ID. '
            + '    <categoryName>                - String - The name of the category to create. \n'
            + '    <description>                 - String - A description of the category to create. \n'
            + '    <parentItemCategoryId>        - Numeric - The ID of the parent category of the category we\'re creating. \n';
    }

    public description(): string {
        return 'Command for adding an ItemCategory. You can only add ItemCategories on Storefronts if you have the publish rights.';
    }

    public example(): string {
        return 'category ' + this.getName() + ' 100 newCategory \'description of the new category\' 1 ';
    }
}
