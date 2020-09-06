// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
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
import { BaseCommand, CommandParamValidationRules, ParamValidationRule } from '../BaseCommand';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { MarketService } from '../../services/model/MarketService';

export class ImageListCommand extends BaseCommand implements RpcCommandInterface<resources.Image[]> {

    public paramValidationRules = {
        parameters: [{
            name: 'template|item|market',
            required: true,
            type: 'string'
        }, {
            name: 'id',
            required: true,
            type: 'number'
        }] as ParamValidationRule[]
    } as CommandParamValidationRules;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.IMAGE_LIST);
        this.log = new Logger(__filename);
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

        switch (typeSpecifier) {
            case 'template':
            case 'item':
                return type.ItemInformation.Images;
            case 'market':
                return [(type as resources.Market).Image];
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
        return this.getName() + ' <type> <id> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <type>           - string - template|item|market\n'
            + '    <id>             - number - The ID of the template|item|market which Images we want to list. \n';
    }

    public description(): string {
        return 'Return all Images for ListingItem, ListingItemTemplate or Market.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' template 1 ';
    }
}
