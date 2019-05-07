// Copyright (c) 2017-2019, The Particl Market developers
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
import { ListingItemAddRequest } from '../../requests/action/ListingItemAddRequest';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ListingItemAddActionService } from '../../services/action/ListingItemAddActionService';
import { MessageException } from '../../exceptions/MessageException';
import { MarketService } from '../../services/model/MarketService';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { MissingParamException } from '../../exceptions/MissingParamException';

export class ListingItemTemplatePostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_POST);
        this.log = new Logger(__filename);
    }

    /**
     * posts a ListingItem to the network based on ListingItemTemplate
     *
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: daysRetention
     *  [2]: market: resources.Market
     *  [3]: estimateFee
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const daysRetention: number = data.params[1] || parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10);
        const market: resources.Market = data.params[2];
        const estimateFee: boolean = data.params[3] ? data.params[3] : false;

        // send from the template profiles address
        const fromAddress = listingItemTemplate.Profile.address;

        // send to given market address
        const toAddress = market.address;

        this.log.debug('posting template:', JSON.stringify(listingItemTemplate, null, 2));

        const postRequest = {
            sendParams: new SmsgSendParams(fromAddress, toAddress, true, daysRetention, estimateFee),
            listingItem: listingItemTemplate
        } as ListingItemAddRequest;

        const response: SmsgSendResponse = await this.listingItemAddActionService.post(postRequest);
        return response;
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId // todo: change to hash?
     *  [1]: daysRetention
     *  [2]: marketId
     *  [3]: estimateFee (optional, default: false)
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('daysRetention');
        } else if (data.params.length < 3) {
            throw new MissingParamException('marketId');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (typeof data.params[1] !== 'number') {
            throw new InvalidParamException('daysRetention', 'number');
        } else if (typeof data.params[2] !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        }

        if (data.params[3] && typeof data.params[3] !== 'boolean') {
            throw new InvalidParamException('estimateFee', 'boolean');
        } else if (!data.params[3]) {
            data.params[3] = false;
        }

        // make sure required data exists and fetch it
        // const listingItemTemplateId = data.params[0];
        // const daysRetention = data.params[1];
        // const marketId = data.params[2];

        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0])
            .then(value => value.toJSON()); // throws if not found

        const market: resources.Market = await this.marketService.findOne(data.params[2])
            .then(value => value.toJSON()); // throws if not found

        // check size limit
        const templateMessageDataSize = await this.listingItemTemplateService.calculateMarketplaceMessageSize(listingItemTemplate);
        if (!templateMessageDataSize.fits) {
            throw new MessageException('ListingItemTemplate information exceeds message size limitations');
        }

        data.params[0] = listingItemTemplate;
        data.params[2] = market;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingTemplateId> [daysRetention] [marketId] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingTemplateId>           - number - The ID of the listing item template that we want to post. \n'
            + '    <daysRetention>               - number - Days the listing will be retained by network.\n'
            + '    <marketId>                    - number - Market id. '
            + '    <estimateFee>                 - [optional] boolean, Just estimate the Fee, dont post the Proposal. \n';
    }

    public description(): string {
        return 'Post the ListingItemTemplate to the Marketplace.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1 1 false';
    }
}
