declare module 'resources' {

    interface ItemInformation {
        id: number;
        title: string;
        shortDescription: string;
        longDescription: string;
        createdAt: Date;
        updatedAt: Date;
        ShippingDestinations: ShippingDestination[];
        ItemCategory: ItemCategory;
    }

}
