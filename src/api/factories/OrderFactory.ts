import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { BidMessage } from '../messages/BidMessage';
import { BidMessageType } from '../enums/BidMessageType';
import { MessageException } from '../exceptions/MessageException';
import { BidCreateRequest } from '../requests/BidCreateRequest';
import * as resources from 'resources';
import { AddressCreateRequest } from '../requests/AddressCreateRequest';
import { OrderCreateRequest } from '../requests/OrderCreateRequest';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderItemCreateRequest } from '../requests/OrderItemCreateRequest';
import { AddressType } from '../enums/AddressType';
import { OrderStatus } from '../enums/OrderStatus';
import { OrderItemObjectCreateRequest } from '../requests/OrderItemObjectCreateRequest';
import { ObjectHash } from '../../core/helpers/ObjectHash';
import { HashableObjectType } from '../enums/HashableObjectType';

export class OrderFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a OrderCreateRequest
     *
     * @param {"resources".Bid} bid
     * @returns {Promise<OrderCreateRequest>}
     */
    public async getModelFromBid(bid: resources.Bid): Promise<OrderCreateRequest> {

        // only bids with action MPA_ACCEPT can be converted to Order
        if (bid.action === BidMessageType.MPA_ACCEPT) {

            const address: AddressCreateRequest = this.getShippingAddress(bid);
            const orderItems: OrderItemCreateRequest[] = this.getOrderItems(bid);
            const buyer: string = bid.bidder;
            const seller: string = bid.ListingItem.seller;

            const orderCreateRequest = {
                address,
                orderItems,
                buyer,
                seller
            } as OrderCreateRequest;

            // can we move this hashing to service level
            orderCreateRequest.hash = ObjectHash.getHash(orderCreateRequest, HashableObjectType.ORDER_CREATEREQUEST);
            return orderCreateRequest;

        } else {
            throw new MessageException('Cannot create Order from this BidMessageType.');
        }
    }

    private getShippingAddress(bid: resources.Bid): AddressCreateRequest {
        return {
            profile_id: bid.ShippingAddress.Profile.id,
            firstName: bid.ShippingAddress.firstName,
            lastName: bid.ShippingAddress.lastName,
            addressLine1: bid.ShippingAddress.addressLine1,
            addressLine2: bid.ShippingAddress.addressLine2,
            city: bid.ShippingAddress.city,
            state: bid.ShippingAddress.state,
            zipCode: bid.ShippingAddress.zipCode,
            country: bid.ShippingAddress.country,
            type: AddressType.SHIPPING_ORDER
        } as AddressCreateRequest;
    }

    private getOrderItems(bid: resources.Bid): OrderItemCreateRequest[] {

        const orderItemCreateRequests: OrderItemCreateRequest[] = [];
        const orderItemObjects = this.getOrderItemObjects(bid.BidDatas);

        const orderItemCreateRequest = {
            bid_id: bid.id,
            itemHash: bid.ListingItem.hash,
            status: OrderStatus.AWAITING_ESCROW,
            orderItemObjects
        } as OrderItemCreateRequest;

        // in alpha 1 order contains 1 orderItem
        orderItemCreateRequests.push(orderItemCreateRequest);
        return orderItemCreateRequests;
    }

    private getOrderItemObjects(bidDatas: resources.BidData[]): OrderItemObjectCreateRequest[] {
        const orderItemObjectCreateRequests: OrderItemObjectCreateRequest[] = [];
        for (const bidData of bidDatas) {
            const orderItemObjectCreateRequest = {
                dataId: bidData.dataId,
                dataValue: bidData.dataValue
            } as OrderItemObjectCreateRequest;
            orderItemObjectCreateRequests.push(orderItemObjectCreateRequest);
        }
        return orderItemObjectCreateRequests;
    }

}
