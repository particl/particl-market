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
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { EscrowActionService } from '../../services/action/EscrowActionService';
import { OrderItemService } from '../../services/OrderItemService';
import { EscrowRequest } from '../../requests/EscrowRequest';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

export class EscrowLockCommand extends BaseCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.action.EscrowActionService) private escrowActionService: EscrowActionService,
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

        if (orderItem.status !== OrderItemStatus.AWAITING_ESCROW) {
            this.log.error('Order is in invalid state');
            throw new MessageException('Order is in invalid state');
        }

        const bid = orderItem.Bid;
        if (!bid || bid.type !== MPAction.MPA_ACCEPT) {
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
            type: MPAction.MPA_LOCK,
            orderItem,
            nonce: data.params[1],
            memo: data.params[2]
        } as EscrowRequest);

    }

    /**
     * data.params[]:
     * [0]:
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        // TODO: IMPLEMENT
        return data;
    }

    public usage(): string {
        return this.getName() + ' [<itemhash> [<nonce> [<memo>]]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <orderItemId>            - String - The id of the OrderItem for which we want to lock the Escrow.\n'
            + '    <nonce>                  - String - The nonce of the Escrow.\n'
            + '    <memo>                   - String - The memo of the Escrow.';
    }

    public description(): string {
        return 'Lock an Escrow.';
    }

}
