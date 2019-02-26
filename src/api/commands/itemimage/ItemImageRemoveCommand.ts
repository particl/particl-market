// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageService } from '../../services/ItemImageService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class ItemImageRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService
    ) {
        super(Commands.ITEMIMAGE_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: itemImageId
     * todo: we should propably switch to use hashes
     *
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {

        return this.itemImageService.destroy(data.params[0]);
    }

    /**
     * data.params[]:
     *  [0]: itemImageId
     * @param data
     * @returns {Promise<ItemImage>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // check if we got all the params
        if (data.params.length < 1) {
            throw new MissingParamException('itemImageId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('itemImageId', 'number');
        }

        const itemImageModel = await this.itemImageService.findOne(data.params[0]);
        const itemImage = itemImageModel.toJSON();

        // check if item already been posted
        if (!_.isEmpty(itemImage.ItemInformation.ListingItem) && itemImage.ItemInformation.ListingItem.id) {
            throw new MessageException('Can\'t delete ItemImage because the ListingItemTemplate has already been posted!');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <itemImageId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <itemImageId>                 - Numeric - The Id of the image we want to remove.';
    }

    public description(): string {
        return 'Remove an item\'s image, identified by its Id.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' 1 ';
    }
}
