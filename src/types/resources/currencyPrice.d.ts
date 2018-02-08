declare module 'resources' {

    interface CurrencyPrice {
        id: number;
        from: string;
        to: string;
        price: number;
        createdAt: Date;
        updatedAt: Date;
    }

}
