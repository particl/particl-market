// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { OrderItemService } from '../../services/model/OrderItemService';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { CommandParamValidationRules, IdValidationRule, ParamValidationRule } from '../CommandParamValidation';


export class OrderItemHistoryCommand extends BaseCommand implements RpcCommandInterface<resources.SmsgMessage[]> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) public orderItemService: OrderItemService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService
    ) {
        super(Commands.ORDERITEM_HISTORY);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('orderItemId', true, this.orderItemService)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: orderItem, resources.OrderItem
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.SmsgMessage[]> {

        const orderItem: resources.OrderItem = data.params[0];
        const smsgMessages: resources.SmsgMessage[] = [];

        // get MPA_LISTING_ADD
        const listingItemSmsgMessage: resources.SmsgMessage = await this.smsgMessageService.findOneByMsgIdAndDirection(orderItem.Bid.ListingItem.msgid)
            .then(value => value.toJSON());
        smsgMessages.push(listingItemSmsgMessage);

        // get MPA_BID
        const bidSmsgMessage: resources.SmsgMessage = await this.smsgMessageService.findOneByMsgIdAndDirection(orderItem.Bid.msgid)
            .then(value => value.toJSON());
        smsgMessages.push(bidSmsgMessage);

        // get the rest of the bid messages
        for (const childBid of orderItem.Bid.ChildBids) {
            const childBidSmsgMessage = await this.smsgMessageService.findOneByMsgIdAndDirection(childBid.msgid).then(value => value.toJSON());
            smsgMessages.push(childBidSmsgMessage);
        }

        // sort by sent
        smsgMessages.sort((msg1, msg2) => {
            if (msg1.sent > msg2.sent) {
                return 1;
            } else if (msg1.sent < msg2.sent) {
                return -1;
            }
            return 0;
        });

        return smsgMessages;
    }

    /**
     *  [0]: orderItemId, number
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const orderItem: resources.OrderItem = data.params[0];

        if (_.isEmpty(orderItem.Bid)) {
            throw new ModelNotFoundException('Bid');
        }

        if (_.isEmpty(orderItem.Bid.ListingItem)) {
            throw new ModelNotFoundException('ListingItem');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <orderItemId>';
    }

    public help(): string {
        return this.usage() + ' - ' + this.description() + ' \n'
            + '<orderItemId>         - The ID of the OrderItem we want history of. \n';
    }

    public description(): string {
        return 'Fetch the history of the OrderItem.';
    }

    public example(): string {
        return 'orderitem ' + this.getName() + ' ';
    }

}
