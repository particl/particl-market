import { BidMessageType } from '../../api/enums/BidMessageType';

declare module 'resources' {

    interface Bid {
        id: number;
        action: BidMessageType;
        createdAt: Date;
        updatedAt: Date;
    }

}
