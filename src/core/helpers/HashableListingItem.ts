/**
 * core.api.HashableListingItem
 *
 */
// TODO: refactor
export class HashableListingItem {

    public title: string;
    public shortDescription: string;
    public longDescription: string;

    public basePrice: string;
    public paymentAddress: string;
    public messagingPublicKey: string;

    constructor(input: any) {
        if (input) {
            if (!input.itemInformation) {
                input.itemInformation = input.ItemInformation;
                input.paymentInformation = input.PaymentInformation;
                input.paymentInformation.itemPrice = input.PaymentInformation.ItemPrice;
                input.paymentInformation.itemPrice.cryptocurrencyAddress = input.PaymentInformation.ItemPrice.CryptocurrencyAddress;
                input.messagingInformation = input.MessagingInformation;
                input.listingItemObjects = input.ListingItemObjects;
            }
            this.title              = input.itemInformation.title;
            this.shortDescription   = input.itemInformation.shortDescription;
            this.longDescription    = input.itemInformation.longDescription;
            this.basePrice          = input.paymentInformation.itemPrice.basePrice;
            this.paymentAddress     = input.paymentInformation.itemPrice.cryptocurrencyAddress.address;
            this.messagingPublicKey = input.messagingInformation.publicKey;
        }
    }

}
