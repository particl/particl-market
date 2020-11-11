declare module 'resources' {

    interface Notification {
        id: number;
        type: string;
        objectId: number;
        objectHash: string;
        parentObjectId: number;
        parentObjectHash: string;
        target: string;
        from: string;
        to: string;
        market: string;
        category: string;
        read: boolean;
        createdAt: Date;
        updatedAt: Date;
    }

}
