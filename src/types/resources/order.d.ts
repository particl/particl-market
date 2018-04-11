import {Address} from '../../api/models/Address';

declare module 'resources' {

    interface Order {
        id: number;
        hash: string;
        OrderItems: OrderItem[];
        ShippingAddress: Address;
        createdAt: Date;
        updatedAt: Date;
    }

}
