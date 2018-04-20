import { BidMessageType } from '../../api/enums/BidMessageType';

declare module 'resources' {

    interface Bid {
        id: number;
        bidder: string;
        action: BidMessageType;
        createdAt: Date;
        updatedAt: Date;
        BidDatas: BidData[];
        ListingItem: ListingItem;
        ShippingAddress: Address;
        OrderItem: OrderItem;
    }

}
