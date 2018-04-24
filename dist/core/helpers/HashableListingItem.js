"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HashableListingItem {
    // TODO: refactor
    constructor(hashThis, timestampedHash = false) {
        const input = JSON.parse(JSON.stringify(hashThis));
        if (input) {
            if (!input.itemInformation && !input.paymentInformation && !input.messagingInformation && !input.listingItemObjects) {
                input.ItemInformation = input.ItemInformation
                    ? input.ItemInformation : {};
                input.PaymentInformation = input.PaymentInformation
                    ? input.PaymentInformation : {};
                input.PaymentInformation.ItemPrice = input.PaymentInformation.ItemPrice
                    ? input.PaymentInformation.ItemPrice : {};
                input.PaymentInformation.ItemPrice.CryptocurrencyAddress = input.PaymentInformation.ItemPrice.CryptocurrencyAddress
                    ? input.PaymentInformation.ItemPrice.CryptocurrencyAddress : {};
                input.MessagingInformation = input.MessagingInformation
                    ? input.MessagingInformation : {};
                input.ListingItemObjects = input.ListingItemObjects
                    ? input.ListingItemObjects : {};
                input.itemInformation = input.ItemInformation;
                input.paymentInformation = input.PaymentInformation;
                input.paymentInformation.itemPrice = input.PaymentInformation.ItemPrice;
                input.paymentInformation.itemPrice.cryptocurrencyAddress = input.PaymentInformation.ItemPrice.CryptocurrencyAddress;
                input.messagingInformation = input.MessagingInformation;
                input.listingItemObjects = input.ListingItemObjects;
            }
            else {
                input.itemInformation = input.itemInformation
                    ? input.itemInformation : {};
                input.paymentInformation = input.paymentInformation
                    ? input.paymentInformation : {};
                input.paymentInformation.itemPrice = input.paymentInformation.itemPrice
                    ? input.paymentInformation.itemPrice : {};
                input.paymentInformation.itemPrice.cryptocurrencyAddress = input.paymentInformation.itemPrice.cryptocurrencyAddress
                    ? input.paymentInformation.itemPrice.cryptocurrencyAddress : {};
                input.messagingInformation = input.messagingInformation
                    ? input.messagingInformation : {};
                input.listingItemObjects = input.listingItemObjects
                    ? input.listingItemObjects : {};
            }
            this.title = input.itemInformation.title;
            this.shortDescription = input.itemInformation.shortDescription;
            this.longDescription = input.itemInformation.longDescription;
            this.basePrice = input.paymentInformation.itemPrice.basePrice;
            this.paymentAddress = input.paymentInformation.itemPrice.cryptocurrencyAddress.address;
            this.messagingPublicKey = input.messagingInformation.publicKey;
            // TODO: add listingitemobjects to hash
            // hack: allow empty objects for now
            if ((!this.title && !this.shortDescription && !this.longDescription && !this.basePrice && !this.paymentAddress && !this.messagingPublicKey)
                || timestampedHash) {
                this.nullItemTimestamp = new Date();
            }
        }
    }
}
exports.HashableListingItem = HashableListingItem;
//# sourceMappingURL=HashableListingItem.js.map