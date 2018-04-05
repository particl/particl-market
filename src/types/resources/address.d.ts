declare module 'resources' {

    interface Address {
        id: number;
        firstName: string;
        lastName: string;
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
