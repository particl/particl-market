declare module 'resources' {

    interface LockedOutput {
        id: number;
        txid: string;
        vout: number;
        amount: number;
        data: string;
        createdAt: Date;
        updatedAt: Date;
    }

}
