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
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { OrderItemService } from '../../services/model/OrderItemService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { MessageException } from '../../exceptions/MessageException';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { OrderItemShipRequest } from '../../requests/action/OrderItemShipRequest';
import { BidService } from '../../services/model/BidService';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { OrderItemShipActionService } from '../../services/action/OrderItemShipActionService';

export class OrderItemShipCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) private orderItemService: OrderItemService,
        @inject(Types.Service) @named(Targets.Service.action.OrderItemShipActionService) private orderItemShipActionService: OrderItemShipActionService
    ) {
        super(Commands.ORDERITEM_SHIP);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: orderItem: resources.OrderItem
     * [1]: memo
     *
     * @param data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const orderItem: resources.OrderItem = data.params[0];
        const memo: string = data.params[1];
        // this.log.debug('orderItem:', JSON.stringify(orderItem, null, 2));

        // todo: to validate()?
        const bid: resources.Bid = await this.bidService.findOne(orderItem.Bid.id).then(value => value.toJSON());
        const bidAccept: resources.Bid | undefined = _.find(bid.ChildBids, (child) => {
            return child.type === MPActionExtended.MPA_COMPLETE;
        });
        if (!bidAccept) {
            throw new MessageException('No accepted Bid found.');
        }

        const fromAddress = orderItem.Order.seller;
        const toAddress = orderItem.Order.buyer;

        // TODO: currently hardcoded!!! parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10)
        const daysRetention = 2;
        const estimateFee = false;

        const postRequest = {
            sendParams: new SmsgSendParams(fromAddress, toAddress, false, daysRetention, estimateFee),
            bid,
            memo
        } as OrderItemShipRequest;

        return this.orderItemShipActionService.post(postRequest);

    }

    /**
     * data.params[]:
     * [0]: orderItemId
     * [1]: memo
     * @param data
     * @returns {Promise<any>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('orderItemId');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('orderItemId', 'number');
        } else if (data.params[1] && typeof data.params[1] !== 'string') {
            throw new InvalidParamException('memo', 'string');
        }

        // make sure required data exists and fetch it
        const orderItem: resources.OrderItem = await this.orderItemService.findOne(data.params[0]).then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('OrderItem');
            });
        data.params[0] = orderItem;

        const validOrderItemStatuses = [
            OrderItemStatus.ESCROW_COMPLETED
        ];

        // check if in the right state.
        if (validOrderItemStatuses.indexOf(orderItem.status) === -1) {
            this.log.error('OrderItem has invalid status');
            throw new MessageException('OrderItem has invalid status: ' + orderItem.status + ', should be: ' + OrderItemStatus.ESCROW_COMPLETED);
        }

        // TODO: check that we are the seller
        // TODO: check there's no MPA_CANCEL, MPA_REJECT?

        return data;
    }

    public usage(): string {
        return this.getName() + ' [<itemhash|*> [<buyer|*> [<seller|*>]]]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <orderItemId>            - String - The id of the OrderItem which we want mark as sent.\n'
            + '    <memo>                   - String - The message to the buyer';
    }

    public description(): string {
        return 'Mark OrderItem as shipped.';
    }

    public example(): string {
        return 'orderitem ' + this.getName() + ' ';
    }

}
