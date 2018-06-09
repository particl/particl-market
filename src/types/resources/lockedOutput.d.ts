declare module 'resources' {

    interface LockedOutput {
        id: number;
        txid: string;
        vout: number;
        amount: number;
        data: string;
        address: string;
        scriptPubKey: string;
        createdAt: Date;
        updatedAt: Date;

        bid_id: number;
    }

}
