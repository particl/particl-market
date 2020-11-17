// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { MarketService } from '../../services/model/MarketService';
import { BooleanValidationRule, CommandParamValidationRules, NumberValidationRule, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';
import { ImageDataService } from '../../services/model/ImageDataService';


export class ImageListCommand extends BaseCommand implements RpcCommandInterface<resources.Image[]> {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) public imageDataService: ImageDataService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.IMAGE_LIST);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new StringValidationRule('template|item|market', true),
                new NumberValidationRule('id', true),
                new BooleanValidationRule('returnImageData', false, false)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: typeSpecifier: string, template | item | market
     *  [1]: type: resources.ListingItemTemplate | listingItem: resources.ListingItem | market: resources.Market
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.Image[]> {
        const typeSpecifier = data.params[0];
        const type = data.params[1];
        const returnImageData: boolean = data.params[2];

        switch (typeSpecifier) {
            case 'template':
            case 'item':
                if (returnImageData && !_.isEmpty(type.ItemInformation.Images)) {
                    for (const img of type.ItemInformation.Images) {
                        for (const imageData of img.ImageDatas) {
                            imageData.data = await this.imageDataService.loadImageFile(img.hash, imageData.imageVersion);
                        }
                    }
                }
                return type.ItemInformation.Images;

            case 'market':
                const image = (type as resources.Market).Image;
                if (returnImageData && !_.isEmpty(image)) {
                    for (const imageData of image.ImageDatas) {
                        imageData.data = await this.imageDataService.loadImageFile(image.hash, imageData.imageVersion);
                    }
                }
                return [image];

            default:
                throw new InvalidParamException('typeSpecifier', 'template|item|market');
        }
    }

    /**
     * data.params[]:
     *  [0]: typeSpecifier: string, template | item | market
     *  [1]: id: number
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const typeSpecifier = data.params[0];
        const id = data.params[1];

        switch (typeSpecifier) {
            case 'template':
                data.params[1] = await this.listingItemTemplateService.findOne(id)
                    .then(value => value.toJSON())
                    .catch(reason => {
                        throw new ModelNotFoundException('ListingItemTemplate');
                    });
                break;
            case 'item':
                data.params[1] = await this.listingItemService.findOne(id)
                    .then(value => value.toJSON())
                    .catch(reason => {
                        throw new ModelNotFoundException('ListingItem');
                    });
                break;
            case 'market':
                data.params[1] = await this.marketService.findOne(id)
                    .then(value => value.toJSON())
                    .catch(reason => {
                        throw new ModelNotFoundException('Market');
                    });
                break;
            default:
                throw new InvalidParamException('typeSpecifier', 'template|item|market');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <type> <id> [returnImageData]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <type>                   - string - template|item|market\n'
            + '    <id>                     - number - The ID of the template|item|market which Images we want to list. \n'
            + '    <returnImageData>        - number, optional - Whether to return image data or not. ';
    }

    public description(): string {
        return 'Return all Images for ListingItem, ListingItemTemplate or Market.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' template 1 ';
    }
}
