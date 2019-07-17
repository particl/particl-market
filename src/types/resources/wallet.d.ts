
declare module 'resources' {

    interface Wallet {
        id: number;
        name: string;

        createdAt: Date;
        updatedAt: Date;

        Profile: Profile;
        Markets: Market[];
    }

}
