import { ShippingAvailability } from '../../api/enums/ShippingAvailability';

declare module 'resources' {

    interface ShippingDestination {
        id: number;
        country: string;
        shippingAvailability: ShippingAvailability;
        createdAt: Date;
        updatedAt: Date;
    }

}
