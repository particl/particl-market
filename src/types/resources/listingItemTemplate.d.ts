declare module 'resources' {

    interface ListingItemTemplate {
        id: number;
        hash: string;
        createdAt: Date;
        updatedAt: Date;
        itemInformation: any;
        paymentInformation: any;
        messagingInformation: any;
        listingItemObjects: any;
    }

}
