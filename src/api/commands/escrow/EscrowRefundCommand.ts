// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { EscrowActionService } from '../../services/EscrowActionService';
import { EscrowRequest } from '../../requests/EscrowRequest';
import { EscrowMessageType } from '../../enums/EscrowMessageType';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import * as _ from 'lodash';
import { OrderStatus } from '../../enums/OrderStatus';
import { BidMessageType} from '../../enums/BidMessageType';
import { OrderItemService } from '../../services/OrderItemService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { NotFoundException } from '../../exceptions/NotFoundException';

export class EscrowRefundCommand extends BaseCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.EscrowActionService) private escrowActionService: EscrowActionService,
        @inject(Types.Service) @named(Targets.Service.OrderItemService) private orderItemService: OrderItemService
    ) {
        super(Commands.ESCROW_REFUND);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: itemhash
     * [1]: accepted
     * [2]: memo
     * [3]: escrowId
     * @param data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {
        const orderItemId = data.params[0];
        const orderItemModel = await this.orderItemService.findOne(orderItemId);
        const orderItem = orderItemModel.toJSON();

        return this.escrowActionService.refund({
            orderItem,
            accepted: data.params[1],
            memo: data.params[2],
            action: EscrowMessageType.MPA_REFUND
        } as EscrowRequest);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        let orderItem;
        if (data.params.length >= 1) {
            const orderItemId = data.params[0];
            if (typeof orderItemId !== 'number' || orderItemId < 0) {
                throw new InvalidParamException('orderItemId must be number and >= 0.', 'number');
            }
            const orderItemModel = await this.orderItemService.findOne(orderItemId);
            if (!orderItemModel) {
                throw new NotFoundException(orderItemId);
            }
            orderItem = orderItemModel.toJSON();

            if (orderItem.status !== OrderStatus.AWAITING_ESCROW) {
                this.log.error('Order is in invalid state');
                throw new MessageException('Order is in invalid state');
            }

            const bid = orderItem.Bid;
            if (!bid || bid.action !== BidMessageType.MPA_ACCEPT) {
                this.log.error('No valid information to finalize escrow');
                throw new MessageException('No valid information to finalize escrow');
            }

            const listingItem = orderItem.Bid.ListingItem;
            if (_.isEmpty(listingItem)) {
                this.log.error('ListingItem not found!');
                throw new MessageException('ListingItem not found!');
            }

            const paymentInformation = orderItem.Bid.ListingItem.PaymentInformation;
            if (_.isEmpty(paymentInformation)) {
                this.log.error('PaymentInformation not found!');
                throw new MessageException('PaymentInformation not found!');
            }

            const escrow = orderItem.Bid.ListingItem.PaymentInformation.Escrow;
            if (_.isEmpty(escrow)) {
                this.log.error('Escrow not found!');
                throw new MessageException('Escrow not found!');
            }

            const escrowRatio = orderItem.Bid.ListingItem.PaymentInformation.Escrow.Ratio;
            if (_.isEmpty(escrowRatio)) {
                this.log.error('EscrowRatio not found!');
                throw new InvalidParamException('EscrowRatio not found!');
            }
        }
        if (data.params.length >= 2) {
            // TODO: Accepted status seems like something that needs validation as it sounds like an enum
            const accepted = data.params[1];
            if (typeof accepted !== 'boolean') {
                throw new InvalidParamException('accepted must be boolean.', 'boolean');
            }
        }
        if (data.params.length >= 3) {
            const memo = data.params[2];
            if (typeof memo !== 'string') {
                throw new InvalidParamException('memo must be string.', 'string');
            }
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' [<itemhash> [<accepted> [<memo>]]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <orderItemId>            - String - The id of the OrderItem for which we want to refund the Escrow.\n'
            + '    <accepted>               - Boolean - The accepted status of the escrow \n'
            + '    <memo>                   - String - The memo of the Escrow ';
    }

    public description(): string {
        return 'Refund an escrow.';
    }

}
