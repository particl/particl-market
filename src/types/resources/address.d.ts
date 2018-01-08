declare module 'resources' {

    interface Address {
        id: number;
        addressLine1: string;
        addressLine2: string;
        city: string;
        country: string;
        zipCode: number;
        createdAt: Date;
        updatedAt: Date;
    }

}
