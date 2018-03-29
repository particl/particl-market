import { BidMessageType } from '../../api/enums/BidMessageType';

declare module 'resources' {

    interface Bid {
        id: number;
        bidder: string;
        action: BidMessageType;
        BidDatas: BidData[];
        createdAt: Date;
        updatedAt: Date;
    }

}
