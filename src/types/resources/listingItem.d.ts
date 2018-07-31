declare module 'resources' {

    interface ListingItem {
        id: number;
        hash: string;
        seller: string;
        expiryTime: number;
        postedAt: Date;
        expiredAt: Date;
        createdAt: Date;
        updatedAt: Date;
        ItemInformation: ItemInformation;
        PaymentInformation: PaymentInformation;
        MessagingInformation: MessagingInformation[];
        ListingItemObjects: ListingItemObject[];
        Market: Market;
        Bids: Bid[];
        ActionMessages: ActionMessage[];
        ListingItemTemplate: ListingItemTemplate;
    }

}
