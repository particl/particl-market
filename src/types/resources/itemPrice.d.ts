declare module 'resources' {

    interface ItemPrice {
        id: number;
        currency: string;
        basePrice: number;
        createdAt: Date;
        updatedAt: Date;
        ShippingPrice: ShippingPrice;
        CryptocurrencyAddress: CryptocurrencyAddress;
    }

}
