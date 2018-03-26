declare module 'resources' {

    interface ActionMessage {
        id: number;
        action: string;
        nonce: string;
        accepted: boolean;
        createdAt: Date;
        updatedAt: Date;
    }

}
