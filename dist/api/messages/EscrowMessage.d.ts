import { EscrowMessageType } from '../enums/EscrowMessageType';
import { ActionMessageInterface } from './ActionMessageInterface';
import { MessageBody } from '../../core/api/MessageBody';
export declare class EscrowMessage extends MessageBody implements ActionMessageInterface {
    action: EscrowMessageType;
    item: string;
    escrow: any;
    nonce?: string;
    memo?: string;
    info?: any;
    accepted?: boolean;
}
