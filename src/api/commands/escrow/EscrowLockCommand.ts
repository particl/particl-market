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
import { OrderItemService } from '../../services/OrderItemService';
import { EscrowRequest } from '../../requests/EscrowRequest';
import { EscrowMessageType } from '../../enums/EscrowMessageType';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import * as _ from 'lodash';
import * as resources from 'resources';
import { BidMessageType } from '../../enums/BidMessageType';
import { OrderStatus } from '../../enums/OrderStatus';

export class EscrowLockCommand extends BaseCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.EscrowActionService) private escrowActionService: EscrowActionService,
        @inject(Types.Service) @named(Targets.Service.OrderItemService) private orderItemService: OrderItemService
    ) {
        super(Commands.ESCROW_LOCK);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: orderItemId
     * [1]: nonce
     * [2]: memo
     *
     * @param data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {

        const orderItemModel = await this.orderItemService.findOne(data.params[0]);
        const orderItem = orderItemModel.toJSON();

        // this.log.debug('orderItem:', JSON.stringify(orderItem, null, 2));

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
            throw new MessageException('EscrowRatio not found!');
        }

        return this.escrowActionService.lock({
            orderItem,
            nonce: data.params[1],
            memo: data.params[2],
            action: EscrowMessageType.MPA_LOCK
        } as EscrowRequest);

    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length >= 1) {
            const orderItemId = data.params[0];
            if (typeof orderItemId !== 'number') {
                throw new MessageException('orderItemId must be number.');
            }
            const orderItemModel = await this.orderItemService.findOne(orderItemId);
            if (!orderItemModel) {
                throw new MessageException(`orderItemModel with orderItemId = <${orderItemId}> not found.`);
            }
        }
        if (data.params.length >= 2) {
            const nonce = data.params[1];
            if (typeof nonce !== 'string') {
                throw new MessageException('nonce must be string.');
            }
        }
        if (data.params.length >= 3) {
            const memo = data.params[2];
            if (typeof memo !== 'string') {
                throw new MessageException('memo must be string.');
            }
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' [<itemhash> [<nonce> [<memo>]]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <orderItemId>            - Number - The id of the OrderItem for which we want to lock the Escrow.\n'
            + '    <nonce>                  - String - The nonce of the Escrow.\n'
            + '    <memo>                   - String - The memo of the Escrow.';
    }

    public description(): string {
        return 'Lock an Escrow.';
    }

}
