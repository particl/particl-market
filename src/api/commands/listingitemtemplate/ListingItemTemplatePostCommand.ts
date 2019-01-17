// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
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
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const listingItemTemplateId: number = data.params[0];
        const daysRetention: number = data.params[1] || parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10);
        const marketId = data.params[2] || undefined;

        const postRequest = {
            listingItemTemplateId,
            daysRetention,
            marketId
        } as ListingItemTemplatePostRequest;

        const response = await this.listingItemActionService.post(postRequest);

        this.log.debug('ListingItemTemplatePostCommand.post, response: ', response);
        return response;
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: daysRetention
     *  [2]: marketId
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
            await this.listingItemTemplateService.findOne(listingItemTemplateId);   // throws if not found
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
            + '    <listingTemplateId>           - Number - The ID of the listing item template that we want to post. \n'
            + '    <daysRetention>               - [optional] Number - Days the listing will be retained by network.\n'
            + '    <marketId>                    - [optional] Number - Market id. ';
    }

    public description(): string {
        return 'Post the ListingItemTemplate to the Marketplace.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1 1';
    }
}
