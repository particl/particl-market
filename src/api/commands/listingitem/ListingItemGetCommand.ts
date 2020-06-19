// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ItemImageDataService } from '../../services/model/ItemImageDataService';

export class ListingItemGetCommand extends BaseCommand implements RpcCommandInterface<resources.ListingItem> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) private itemImageDataService: ItemImageDataService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService
    ) {
        super(Commands.ITEM_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemId
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.ListingItem> {

        const listingItem: resources.ListingItem = await this.listingItemService.findOne(data.params[0]).then(value => value.toJSON());

        if (data.params[1] && !_.isEmpty(listingItem.ItemInformation.ItemImages)) {
            for (const image of listingItem.ItemInformation.ItemImages) {
                for (const imageData of image.ItemImageDatas) {
                    imageData.data = await this.itemImageDataService.loadImageFile(image.hash, imageData.imageVersion);
                }
            }
        }

        return listingItem;
    }

    /**
     * data.params[]:
     *  [0]: listingItemId
     *  [1]: returnImageData (optional)
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('listingItemId');
        }

        if (data.params[0] && typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemId', 'number');
        } else if (data.params[1] !== undefined && typeof data.params[1] !== 'boolean') {
            throw new InvalidParamException('returnImageData', 'boolean');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemId>          - number - The Id of the ListingItem we want to retrieve. \n'
            + '    <returnImageData>        - number, optional - Whether to return image data or not. ';
    }

    public description(): string {
        return 'Get a ListingItem using id.';
    }

    public example(): string {
        return 'item ' + this.getName() + ' 1';
    }
}
