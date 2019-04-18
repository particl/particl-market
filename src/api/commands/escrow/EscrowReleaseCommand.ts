// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { EscrowActionServiceDEPRECATED } from '../../services/action/EscrowActionServiceDEPRECATED';
import { EscrowRequestDEPRECATED } from '../../requests/action/EscrowRequestDEPRECATED';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { OrderItemService } from '../../services/model/OrderItemService';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MPActionExtended } from '../../enums/MPActionExtended';

export class EscrowReleaseCommand extends BaseCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
//        @inject(Types.Service) @named(Targets.Service.action.EscrowActionService) private escrowActionService: EscrowActionServiceDEPRECATED,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) private orderItemService: OrderItemService
    ) {
        super(Commands.ESCROW_RELEASE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: orderItemId
     * [1]: memo
     *
     * @param data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {

        const orderItemModel = await this.orderItemService.findOne(data.params[0]);
        const orderItem = orderItemModel.toJSON();

        // todo: release messaging need to be reimplemented, omp-lib doesnt provide msg for this
        return {} as EscrowRequestDEPRECATED;
        // return this.escrowActionService.release({
        //    type: MPActionExtended.MPA_RELEASE,
        //    orderItem,
        //    memo: data.params[1]
        // } as EscrowRequestDEPRECATED);
    }

    /**
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 2) {
            throw new MessageException('Missing params.');
        }

        const orderItemModel = await this.orderItemService.findOne(data.params[0]);
        const orderItem = orderItemModel.toJSON();

        const validOrderStatuses = [
            OrderItemStatus.ESCROW_LOCKED,
            OrderItemStatus.SHIPPING
        ];

        // check if in the right state.
        if (validOrderStatuses.indexOf(orderItem.status) === -1) {
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

        return data;
    }

    public usage(): string {
        return this.getName() + ' [<itemhash> [<memo>]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <orderItemId>            - String - The id of the OrderItem for which we want to release the Escrow.\n'
            + '    <memo>                   - String - The memo of the Escrow ';
    }

    public description(): string {
        return 'Release an escrow.';
    }

}
