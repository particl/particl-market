declare module 'resources' {

    interface ListingItemTemplate {
        id: number;
        hash: string;
        createdAt: Date;
        updatedAt: Date;
        ItemInformation: ItemInformation;
        PaymentInformation: PaymentInformation;
        MessagingInformation: MessagingInformation[];
        ListingItemObjects: ListingItemObject[];
        Profile: Profile;
    }

}
