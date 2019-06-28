// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemImageService } from '../../services/model/ItemImageService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';

export class ItemImageRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.ITEMIMAGE_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: itemImageId
     * todo: we should propably switch to use hashes?
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

        const itemImage: resources.ItemImage = await this.itemImageService.findOne(data.params[0]).then(value => value.toJSON());

        // check if item already been posted
        if (!_.isEmpty(itemImage.ItemInformation.ListingItemTemplate)) {
            // make sure ListingItemTemplate with the id exists
            const templateId = itemImage.ItemInformation.ListingItemTemplate.id;
            const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(templateId)
                .then(value => {
                    return value.toJSON();
                })
                .catch(reason => {
                    throw new ModelNotFoundException('ListingItemTemplate');
                });

            const isModifiable = await this.listingItemTemplateService.isModifiable(listingItemTemplate.id);
            if (!isModifiable) {
                throw new ModelNotModifiableException('ListingItemTemplate');
            }

        } else {
            throw new ModelNotModifiableException('ListingItemTemplate');
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
