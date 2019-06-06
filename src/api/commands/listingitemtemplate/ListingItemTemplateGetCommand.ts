// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ItemImageDataService } from '../../services/model/ItemImageDataService';

export class ListingItemTemplateGetCommand extends BaseCommand implements RpcCommandInterface<resources.ListingItemTemplate> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemImageDataService) private itemImageDataService: ItemImageDataService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: id
     *  [1]: returnImageData (optional)
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.ListingItemTemplate> {

        let listingItemTemplate: resources.ListingItemTemplate;

        if (data.params[0] && typeof data.params[0] === 'number') {
            listingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0])
                .then(value => value.toJSON());
        } else {
            listingItemTemplate = await this.listingItemTemplateService.findOneByHash(data.params[0])
                .then(value => value.toJSON());
        }

        if (data.params[1]) {
            for (const image of listingItemTemplate.ItemInformation.ItemImages) {
                for (const imageData of image.ItemImageDatas) {
                    imageData.data = await this.itemImageDataService.loadImageFile(image.hash, imageData.imageVersion);
                }
            }
        }

        return listingItemTemplate;
    }

    /**
     * data.params[]:
     *  [0]: id
     *  [1]: returnImageData (optional)
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('id');
        }

        if (data.params[0] && typeof data.params[0] !== 'number' ) {
            throw new InvalidParamException('id', 'number');
        }

        if (data.params[1] && typeof data.params[1] !== 'boolean') {
            throw new InvalidParamException('returnImageData', 'boolean');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - Numeric - The ID of the listing item template that we \n'
            + '                                     want to retrieve. ';
    }

    public description(): string {
        return 'Get ListingItemTemplate using its id.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1';
    }
}
