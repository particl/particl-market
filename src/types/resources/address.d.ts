declare module 'resources' {

    interface Address {
        id: number;
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
        createdAt: Date;
        updatedAt: Date;
    }

}
