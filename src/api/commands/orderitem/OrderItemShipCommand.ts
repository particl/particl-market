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
import { IdentityService } from '../../services/model/IdentityService';
import { CommandParamValidationRules, IdValidationRule, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';
import {BidRequest} from '../../requests/action/BidRequest';

export class OrderItemShipCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) private orderItemService: OrderItemService,
        @inject(Types.Service) @named(Targets.Service.action.OrderItemShipActionService) private orderItemShipActionService: OrderItemShipActionService
    ) {
        super(Commands.ORDERITEM_SHIP);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('orderItemId', true, this.orderItemService),
                new StringValidationRule('memo', false, 'This ListingItem should be removed.')
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *   [0]: orderItem: resources.OrderItem
     *   [1]: memo
     *   [2]: identity, resources.Identity
     *
     * @param data
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        const orderItem: resources.OrderItem = data.params[0];
        const memo: string = data.params[1];
        const identity: resources.Identity = data.params[2];

        const bid: resources.Bid = await this.bidService.findOne(orderItem.Bid.id).then(value => value.toJSON());
        const bidAccept: resources.Bid | undefined = _.find(bid.ChildBids, (child) => {
            return child.type === MPActionExtended.MPA_COMPLETE;
        });
        if (!bidAccept) {
            throw new MessageException('No accepted Bid found.');
        }

        const postRequest = {
            sendParams: {
                wallet: identity.wallet,
                fromAddress: identity.address,
                toAddress: orderItem.Order.buyer,
                paid: false,
                daysRetention: parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10),
                estimateFee: false,
                anonFee: true
            } as SmsgSendParams,
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
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const orderItem: resources.OrderItem = data.params[0];
        const memo: string = data.params[1];

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

        const identity: resources.Identity = await this.identityService.findOneByAddress(orderItem.Order.seller)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Identity');
            });

        data.params[0] = orderItem;
        data.params[2] = identity;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <orderItemId> [memo]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <orderItemId>            - String - The id of the OrderItem which we want mark as shipped.\n'
            + '    <memo>                   - String - The message to the buyer';
    }

    public description(): string {
        return 'Mark OrderItem as shipped.';
    }

    public example(): string {
        return 'orderitem ' + this.getName() + ' ';
    }

}
