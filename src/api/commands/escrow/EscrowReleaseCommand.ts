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
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { OrderItemService } from '../../services/model/OrderItemService';
import { EscrowReleaseRequest } from '../../requests/action/EscrowReleaseRequest';
import { EscrowReleaseActionService } from '../../services/action/EscrowReleaseActionService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import {MPAction} from 'omp-lib/dist/interfaces/omp-enums';
import {SmsgSendParams} from '../../requests/action/SmsgSendParams';
import {EscrowLockRequest} from '../../requests/action/EscrowLockRequest';
import {BidService} from '../../services/model/BidService';

export class EscrowReleaseCommand extends BaseCommand implements RpcCommandInterface<Escrow> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.action.EscrowReleaseActionService) private escrowReleaseActionService: EscrowReleaseActionService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) private orderItemService: OrderItemService
    ) {
        super(Commands.ESCROW_RELEASE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: orderItem, resources.OrderItem
     * [1]: memo
     *
     * @param data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {

        const orderItem: resources.OrderItem = data.params[0];
        // this.log.debug('orderItem:', JSON.stringify(orderItem, null, 2));

        const bid: resources.Bid = await this.bidService.findOne(orderItem.Bid.id).then(value => value.toJSON());
        const childBid: resources.Bid | undefined = _.find(bid.ChildBids, (child) => {
            return child.type === MPAction.MPA_ACCEPT;
        });
        if (!childBid) {
            throw new MessageException('No accepted Bid found.');
        }
        const bidAccept = await this.bidService.findOne(childBid.id).then(value => value.toJSON());

        const fromAddress = orderItem.Order.buyer;  // we are the buyer
        const toAddress = orderItem.Order.seller;

        // TODO: currently hardcoded!!! parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10)
        const daysRetention = 2;
        const estimateFee = false;

        const postRequest = {
            sendParams: new SmsgSendParams(fromAddress, toAddress, false, daysRetention, estimateFee),
            bid,
            bidAccept,
            memo: data.params[1]
        } as EscrowReleaseRequest;

        return this.escrowReleaseActionService.post(postRequest);
    }

    /**
     * data.params[]:
     * [0]: orderItemId
     * [1]: memo
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
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

        const validOrderItemStatuses = [
            OrderItemStatus.ESCROW_LOCKED,
            OrderItemStatus.SHIPPING
        ];

        // check if in the right state.
        if (validOrderItemStatuses.indexOf(orderItem.status) === -1) {
            this.log.error('Order is in invalid state');
            throw new MessageException('Order is in invalid state');
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
