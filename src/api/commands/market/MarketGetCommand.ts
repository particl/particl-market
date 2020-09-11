// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand, CommandParamValidationRules, ParamValidationRule } from '../BaseCommand';
import { Market } from '../../models/Market';
import { MarketService } from '../../services/model/MarketService';
import { ImageDataService } from '../../services/model/ImageDataService';


export class MarketGetCommand extends BaseCommand implements RpcCommandInterface<resources.Market> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ImageDataService) private imageDataService: ImageDataService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService
    ) {
        super(Commands.MARKET_GET);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [{
                name: 'marketId',
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
     *  [0]: market: resources.Market
     *  [1]: returnImageData: boolean
     *
     * @param data
     * @returns {Promise<Market>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.Market> {

        const market: resources.Market = data.params[0];
        const returnImageData: boolean = data.params[1];

        if (returnImageData && !_.isEmpty(market.Image)) {
            for (const imageData of market.Image.ImageDatas) {
                imageData.data = await this.imageDataService.loadImageFile(imageData.imageHash, imageData.imageVersion);
            }
        }

        return market;
    }

    /**
     * data.params[]:
     *  [0]: marketId
     *  [1]: returnImageData (optional), default false
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const marketId: number = data.params[0];
        let returnImageData: boolean = data.params[1];

        returnImageData = _.isNil(returnImageData) ? false : returnImageData;
        const market: resources.Market = await this.marketService.findOne(marketId).then(value => value.toJSON());

        data.params[0] = market;
        data.params[1] = returnImageData;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <marketId> [returnImageData]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <marketId>           - number - The ID of the Market that we want to retrieve. '
            + '    <returnImageData>             - [optional] boolean, optional - Whether to return image data or not. ';
    }

    public description(): string {
        return 'Get Market using its id.';
    }

    public example(): string {
        return 'market ' + this.getName() + ' 1';
    }
}
