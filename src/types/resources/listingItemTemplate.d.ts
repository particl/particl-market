declare module 'resources' {

    interface ListingItemTemplate {
        id: number;
        hash: string;
        createdAt: Date;
        updatedAt: Date;
        ItemInformation: any;
        PaymentInformation: any;
        MessagingInformation: any;
        ListingItemObjects: any;
    }

}
