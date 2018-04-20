declare module 'resources' {

    interface OrderItem {
        id: number;
        status: string;
        itemHash: string;
        Bid: Bid;
        OrderItemObjects: OrderItemObject[];
        Order: Order;
        createdAt: Date;
        updatedAt: Date;
    }

}
