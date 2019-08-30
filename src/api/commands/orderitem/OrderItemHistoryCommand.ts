// Copyright (c) 2017-2019, The Particl Market developers
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
import { OrderItemStatusResponse } from '../../../core/helpers/OrderItemStatusResponse';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { OrderItemService } from '../../services/model/OrderItemService';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';

export class OrderItemHistoryCommand extends BaseCommand implements RpcCommandInterface<resources.SmsgMessage[]> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) public orderItemService: OrderItemService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService
    ) {
        super(Commands.ORDERITEM_STATUS);
        this.log = new Logger(__filename);
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

        this.log.debug('orderItem:', JSON.stringify(orderItem));

        let bidSmsgMessage: resources.SmsgMessage = await this.smsgMessageService.findOneByMsgId(orderItem.Bid.msgid).then(value => value.toJSON());
        smsgMessages.push(bidSmsgMessage);

        orderItem.Bid.ChildBids = _.orderBy(orderItem.Bid.ChildBids, ['createdAt'], ['asc']);
        for (const childBid of orderItem.Bid.ChildBids) {
            bidSmsgMessage = await this.smsgMessageService.findOneByMsgId(childBid.msgid).then(value => value.toJSON());
        }

        return smsgMessages;
    }

    /**
     *  [0]: id, number
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('id');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('id', 'number');
        }

        data.params[0] = await this.orderItemService.findOne(data.params[0], true)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('OrderItem');
            });

        return data;
    }

    public usage(): string {
        return this.getName() + ' <id>';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '<id>         - The id of the OrderItem we want history of. \n';
    }

    public description(): string {
        return 'Fetch the history of the OrderItem.';
    }

    public example(): string {
        return 'orderitem ' + this.getName() + ' ';
    }

}
