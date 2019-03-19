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
import { ListingItemTemplatePostRequest } from '../../requests/ListingItemTemplatePostRequest';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ListingItemActionService } from '../../services/ListingItemActionService';
import { MessageException } from '../../exceptions/MessageException';
import { MarketService } from '../../services/MarketService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import {InvalidParamException} from '../../exceptions/InvalidParamException';

export class ListingItemTemplatePostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemActionService) public listingItemActionService: ListingItemActionService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.TEMPLATE_POST);
        this.log = new Logger(__filename);
    }

    /**
     * posts a ListingItem to the network based on ListingItemTemplate
     *
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: daysRetention
     *  [2]: marketId
     *  [3]: estimateFee
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const listingItemTemplateId: number = data.params[0];
        const daysRetention: number = data.params[1] || parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10);
        const marketId = data.params[2] || undefined;
        const estimateFee: boolean = typeof data.params[3] === 'boolean' ? data.params[3] : false;

        const postRequest = {
            listingItemTemplateId,
            daysRetention,
            marketId
        } as ListingItemTemplatePostRequest;

        const response = await this.listingItemActionService.post(postRequest, estimateFee);

        this.log.debug('ListingItemTemplatePostCommand.post, response: ', response);
        return response;
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: daysRetention
     *  [2]: marketId
     *  [3]: estimateFee
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MessageException('Missing listingItemTemplateId.');
        }

        if (data.params.length < 2) {
            throw new MessageException('Missing daysRetention.');
        }

        if (data.params.length < 3) {
            throw new MessageException('Missing marketId.');
        }

        const listingItemTemplateId = data.params[0];
        const daysRetention = data.params[1];
        const marketId = data.params[2];

        if (listingItemTemplateId && typeof listingItemTemplateId !== 'number') {
            throw new MessageException('listingItemTemplateId should be a number.');
        } else {
            // make sure template with the id exists
            const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(listingItemTemplateId)
                .then(value => value.toJSON());   // throws if not found

            const itemPrice: resources.ItemPrice = listingItemTemplate.PaymentInformation.ItemPrice;

            // validate price
            if (!itemPrice.basePrice) {
                throw new MessageException('Invalid ItemPrice');
            }
            if (itemPrice.basePrice < 0) {
                throw new InvalidParamException('basePrice');
            }
            if (itemPrice.ShippingPrice) {
                if (!itemPrice.ShippingPrice.domestic || !itemPrice.ShippingPrice.international) {
                    throw new InvalidParamException('shippingPrice');
                } else {
                    if (itemPrice.ShippingPrice.domestic < 0 || itemPrice.ShippingPrice.international < 0 ) {
                        throw new InvalidParamException('shippingPrice');
                    }
                }
            }

            // check size limit
            const templateMessageDataSize = await this.listingItemTemplateService.calculateMarketplaceMessageSize(listingItemTemplate);
            if (!templateMessageDataSize.fits) {
                throw new MessageException('Template details exceed message size limitations');
            }
        }

        if (daysRetention && typeof daysRetention !== 'number') {
            throw new MessageException('daysRetention should be a number.');
        }

        if (marketId && typeof marketId !== 'number') {
            throw new MessageException('marketId should be a number.');
        } else {
            // make sure market with the id exists
            await this.marketService.findOne(marketId);   // throws if not found
        }

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
