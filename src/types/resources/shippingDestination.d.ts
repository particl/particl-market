declare module 'resources' {

    interface ShippingDestination {
        id: number;
        country: string;
        shippingAvailability: string;
        createdAt: Date;
        updatedAt: Date;
    }

}
