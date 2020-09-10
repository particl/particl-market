// Copyright (c) 2017-2020, The Particl Market developers
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
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand, CommandParamValidationRules, ParamValidationRule } from '../BaseCommand';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ImageDataService } from '../../services/model/ImageDataService';

export class ListingItemTemplateGetCommand extends BaseCommand implements RpcCommandInterface<resources.ListingItemTemplate> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) private imageDataService: ImageDataService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_GET);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            parameters: [{
                name: 'listingItemTemplateId',
                required: true,
                type: 'number'
            }, {
                name: 'returnImageData',
                required: false,
                type: 'boolean'
            }] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: returnImageData (optional)
     *
     * @param data
     * @returns {Promise<resources.ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.ListingItemTemplate> {

        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0]).then(value => value.toJSON());

        if (data.params[1] && !_.isEmpty(listingItemTemplate.ItemInformation.Images)) {
            for (const image of listingItemTemplate.ItemInformation.Images) {
                for (const imageData of image.ImageDatas) {
                    imageData.data = await this.imageDataService.loadImageFile(image.hash, imageData.imageVersion);
                }
            }
        }

        return listingItemTemplate;
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: returnImageData (optional)
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        if (!_.isNil(data.params[1]) && typeof data.params[1] !== 'boolean') {
            throw new InvalidParamException('returnImageData', 'boolean');
        }

        if (_.isNil(data.params[1])) {
            data.params[1] = false;
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> [returnImageData]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - number - The ID of the ListingItemTemplate that we want to retrieve. '
            + '    <returnImageData>             - boolean, optional - Whether to return image data or not. ';
    }

    public description(): string {
        return 'Get ListingItemTemplate using its id.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1';
    }
}
