declare module 'resources' {

    interface ActionMessage {
        id: number;
        action: string;
        nonce: string;
        accepted: boolean;
        MessageData: MessageData;
        MessageInfo: MessageInfo;
        MessageObjects: MessageObject[];
        MessageEscrow: MessageEscrow;
        createdAt: Date;
        updatedAt: Date;
    }

}
