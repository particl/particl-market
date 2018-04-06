declare module 'resources' {

    interface Profile {
        id: number;
        name: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
        ShippingAddresses: Address[];
        CryptocurrencyAddresses: CryptocurrencyAddress[];
        FavoriteItems: FavoriteItem[];
        ShoppingCart: ShoppingCart[];
    }

}
