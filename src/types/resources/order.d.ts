import {Address} from '../../api/models/Address';

declare module 'resources' {

    interface Order {
        id: number;
        hash: string;
        buyer: string;
        seller: string;
        createdAt: Date;
        updatedAt: Date;
        OrderItems: OrderItem[];
        ShippingAddress: Address;
    }

}
