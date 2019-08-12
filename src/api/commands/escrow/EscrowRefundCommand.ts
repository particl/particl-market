// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { OrderItemService } from '../../services/model/OrderItemService';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { BidService } from '../../services/model/BidService';
import { EscrowRefundActionService } from '../../services/action/EscrowRefundActionService';
import { EscrowRefundRequest } from '../../requests/action/EscrowRefundRequest';

export class EscrowRefundCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.action.EscrowRefundActionService) private escrowRefundActionService: EscrowRefundActionService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) private orderItemService: OrderItemService
    ) {
        super(Commands.ESCROW_REFUND);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: orderItemId
     * [1]: memo
     * @param data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const orderItem: resources.OrderItem = data.params[0];
        // this.log.debug('orderItem:', JSON.stringify(orderItem, null, 2));

        const bid: resources.Bid = await this.bidService.findOne(orderItem.Bid.id).then(value => value.toJSON());
        let bidAccept: resources.Bid | undefined = _.find(bid.ChildBids, (child) => {
            return child.type === MPAction.MPA_ACCEPT;
        });
        if (!bidAccept) {
            throw new MessageException('No accepted Bid found.');
        }
        bidAccept = await this.bidService.findOne(bidAccept.id).then(value => value.toJSON());

        let escrowLock: resources.Bid | undefined = _.find(bid.ChildBids, (child) => {
            return child.type === MPAction.MPA_LOCK;
        });
        if (!escrowLock) {
            throw new MessageException('No locked Bid found.');
        }
        escrowLock = await this.bidService.findOne(escrowLock.id).then(value => value.toJSON());

        const fromAddress = orderItem.Order.buyer;  // we are the seller
        const toAddress = orderItem.Order.seller;

        const daysRetention: number = parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10);
        const estimateFee = false;

        const postRequest = {
            sendParams: new SmsgSendParams(fromAddress, toAddress, false, daysRetention, estimateFee),
            bid,
            bidAccept,
            escrowLock,
            memo: data.params[1]
        } as EscrowRefundRequest;

        return this.escrowRefundActionService.post(postRequest);
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
        }

        // make sure required data exists and fetch it
        const orderItem: resources.OrderItem = await this.orderItemService.findOne(data.params[0]).then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('OrderItem');
            });
        data.params[0] = orderItem;

        // TODO: check these
        const validOrderItemStatuses = [
            OrderItemStatus.ESCROW_LOCKED,
            OrderItemStatus.ESCROW_COMPLETED,
            OrderItemStatus.SHIPPING
        ];

        // check if in the right state.
        if (validOrderItemStatuses.indexOf(orderItem.status) === -1) {
            this.log.error('OrderItem has invalid status');
            throw new MessageException('OrderItem has invalid status');
        }

        // TODO: check that we are the seller
        // TODO: check there's no MPA_CANCEL, MPA_REJECT?

        return data;
    }

    public usage(): string {
        return this.getName() + ' [<orderItemId> [<memo>]]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <orderItemId>            - String - The id of the OrderItem for which we want to refund the Escrow.\n'
            + '    <memo>                   - String - The memo of the Escrow ';
    }

    public description(): string {
        return 'Refund an escrow.';
    }

}
