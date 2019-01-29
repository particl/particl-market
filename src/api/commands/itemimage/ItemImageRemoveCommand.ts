// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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
     *  [0]: ItemImageId
     * todo: we should propably switch to use hashes
     *
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        if (data.params.length < 1) {
            throw new MessageException('Requires arg: ItemImageId');
        }
        const itemImageModel = await this.itemImageService.findOne(data.params[0]);
        const itemImage = itemImageModel.toJSON();

        // check if item already been posted
        if (!_.isEmpty(itemImage.ItemInformation.ListingItem) && itemImage.ItemInformation.ListingItem.id) {
            throw new MessageException(`Can't delete itemImage because the item has allready been posted!`);
        }
        return this.itemImageService.destroy(data.params[0]);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.length < 1) {
            throw new MissingParamException('itemImageId');
        }

        const itemImageId = data.params[1];
        if(!typeof itemImageId !== 'number'){
            throw new InvalidParamException('itemImageId', 'number');
        }
        try {
            const itemImageModel = await this.itemImageService.findOne(itemImageId);
        } catch (ex) {
            this.log.error('Error: ' + ex);
            throw new NotFoundException(itemImageId);
        }
    }

    public usage(): string {
        return this.getName() + ' <itemImageId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <itemImageId>                 - Numeric - The ID of the image we want to remove.';
    }

    public description(): string {
        return 'Remove an item\'s image, identified by its ID.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' 1 ';
    }
}
