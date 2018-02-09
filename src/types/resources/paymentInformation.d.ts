declare module 'resources' {

    interface PaymentInformation {
        id: number;
        type: string;
        Escrow: Escrow;
        ItemPrice: ItemPrice;
        createdAt: Date;
        updatedAt: Date;
    }

}
