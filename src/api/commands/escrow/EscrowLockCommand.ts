// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Core, Targets, Types } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Escrow } from '../../models/Escrow';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { OrderItemService } from '../../services/model/OrderItemService';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { EscrowLockActionService } from '../../services/action/EscrowLockActionService';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { BidService } from '../../services/model/BidService';
import { EscrowLockRequest } from '../../requests/action/EscrowLockRequest';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { BidDataValue } from '../../enums/BidDataValue';

export class EscrowLockCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    private PARAMS_KEYS: string[] = [
        BidDataValue.DELIVERY_CONTACT_PHONE.toString(),
        BidDataValue.DELIVERY_CONTACT_EMAIL.toString()
    ];

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.action.EscrowLockActionService) private escrowLockActionService: EscrowLockActionService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) private orderItemService: OrderItemService

    ) {
        super(Commands.ESCROW_LOCK);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: orderItem, resources.OrderItem
     * [1]: options, KVS[], should contain the phone number for delivery, if given
     *
     * @param data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute(@request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

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

        const daysRetention: number = parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10);
        const estimateFee = false;

        const postRequest = {
            sendParams: new SmsgSendParams(fromAddress, toAddress, false, daysRetention, estimateFee),
            bid,
            bidAccept,
            objects: data.params[1]
        } as EscrowLockRequest;

        return this.escrowLockActionService.post(postRequest);
    }

    /**
     * data.params[]:
     * [0]: orderItemId
     * [...]: bidDatKey, string, optional
     * [...]: bidDataValue, string, optional
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


        if (orderItem.status !== OrderItemStatus.AWAITING_ESCROW) {
            throw new MessageException('Order is in invalid state');
        }

        if (_.isEmpty(orderItem.Bid.ListingItem)) {
            throw new ModelNotFoundException('ListingItem');
        }

        if (_.isEmpty(orderItem.Bid.ListingItem.PaymentInformation)) {
            throw new ModelNotFoundException('PaymentInformation');
        }

        if (_.isEmpty(orderItem.Bid.ListingItem.PaymentInformation.Escrow)) {
            throw new ModelNotFoundException('Escrow');
        }

        if (_.isEmpty(orderItem.Bid.ListingItem.PaymentInformation.Escrow.Ratio)) {
            throw new ModelNotFoundException('Ratio');
        }

        // get the extra delivery contact information, if it exists
        const options: KVS[] = this.additionalParamsToKVS(data);
        if (!_.isEmpty(options)) {
            data.params[1] = options;
        }

        // TODO: check that we are the buyer

        return data;
    }

    public usage(): string {
        return this.getName() + ' [<orderItemId>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <orderItemId>            - String - The id of the OrderItem for which we want to lock the Escrow.\n';
    }

    public description(): string {
        return 'Lock an Escrow.';
    }

    public example(): string {
        return '';
    }

    private additionalParamsToKVS(data: RpcRequest): KVS[] {
        const additionalParams: KVS[] = [];

        for (const paramsKey of this.PARAMS_KEYS) {
            for (let j = 0; j < data.params.length - 1; ++j) {
                if (paramsKey === data.params[j]) {
                    additionalParams.push({
                        key:  paramsKey,
                        value: !_.includes(this.PARAMS_KEYS, data.params[j + 1]) ? data.params[j + 1] : ''});
                    break;
                }
            }
        }
        return additionalParams;
    }
}
