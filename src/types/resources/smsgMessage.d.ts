import { SmsgMessageStatus } from '../../api/enums/SmsgMessageStatus';

declare module 'resources' {

    interface SmsgMessage {
        // these fields are in the incoming message
        msgid: string;
        version: string;
        received: Date;
        sent: Date;
        expiration: Date;
        daysretention: number;
        from: string;
        to: string;
        text: string; // this should propably be cleared after message has been succesfully processed

        // model also has these
        id: number;
        type: string;
        status: SmsgMessageStatus;

        createdAt: Date;
        updatedAt: Date;
    }

}
