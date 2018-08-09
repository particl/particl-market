// Copyright (c) 2017-2018, The Particl Market developers
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

export class ListingItemTemplatePostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemActionService) public listingItemActionService: ListingItemActionService
    ) {
        super(Commands.TEMPLATE_POST);
        this.log = new Logger(__filename);
    }

    /**
     * posts a ListingItem to the network based on ListingItemTemplate
     *
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: daysRetention, default is 4 and set in SmsgService.smsgsend, may be optional.
     *  [2]: marketId, may be optional
     *
     * @param data
     * @returns {Promise<ListingItemTemplate>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        // TODO: wheres the validation?!?
        // TODO: if the template doesn't have all the required data, throw an exception
        // TODO: check escrow

        if (!data.params[0]) {
            throw new MessageException('Missing listingItemTemplateId');
        }

        const listingItemTemplateId: number = data.params[0];
        const daysRetention: number = data.params[1] || parseInt(process.env.PAID_MESSAGE_RETENTION_DAYS, 10);
        const marketId = data.params[1] || undefined;

        const postRequest = {
            listingItemTemplateId,
            daysRetention,
            marketId
        } as ListingItemTemplatePostRequest;

        const response = await this.listingItemActionService.post(postRequest);

        this.log.debug('ListingItemTemplatePostCommand.post, response: ', response);
        return response;
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
        return 'Post listing item by listingTemplateId and marketId.';
    }

    public example(): string {
        return 'template ' + this.getName() + ' 1 1';
    }
}
