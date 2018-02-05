declare module 'resources' {

    interface ListingItem {
        id: number;
        hash: string;
        createdAt: Date;
        updatedAt: Date;
        ItemInformation: ItemInformation;
        PaymentInformation: PaymentInformation;
        MessagingInformation: MessagingInformation[];
        ListingItemObjects: ListingItemObject[];
    }

}
