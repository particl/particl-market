declare module 'resources' {

    interface Vote {
        id: number;
        voter: string;
        block: number;
        weight: number;
        createdAt: Date;
        updatedAt: Date;
    }

}
