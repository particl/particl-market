declare module 'resources' {

    interface MessageData {
        id: number;
        msgid: string;
        version: string;
        received: Date;
        sent: Date;
        from: string;
        to: string;
        createdAt: Date;
        updatedAt: Date;
    }

}
