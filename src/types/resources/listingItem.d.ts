declare module 'resources' {

    interface ListingItem {
        id: number;
        hash: string;
        seller: string;
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
