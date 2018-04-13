import {Address} from '../../api/models/Address';

declare module 'resources' {

    interface Order {
        id: number;
        hash: string;
        buyer: string;
        seller: string;
        OrderItems: OrderItem[];
        ShippingAddress: Address;
        createdAt: Date;
        updatedAt: Date;
    }

}
