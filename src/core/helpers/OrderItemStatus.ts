export class OrderItemStatus {
    public listingItemHash: string;
    public bidType: string;
    public orderStatus: string;
    public buyer: string;
    public seller: string;

    constructor(listingItemHash: string = '', bidType: string = '', orderStatus: string = '', buyer: string = '', seller: string = '') {
        this.listingItemHash = listingItemHash;
        this.bidType = bidType;
        this.orderStatus = orderStatus;
        this.buyer = buyer;
        this.seller = seller;
    }
}
