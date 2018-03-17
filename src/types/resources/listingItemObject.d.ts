declare module 'resources' {

    interface ListingItemObject {
        id: number;
        type: string;
        description: string;
        order: number;
        forceInput: boolean;
        objectId: string;
        createdAt: Date;
        updatedAt: Date;
        ListingItemObjectData: ListingItemObjectData[];

    }

}
