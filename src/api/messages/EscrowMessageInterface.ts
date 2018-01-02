import { IsNotEmpty } from 'class-validator';
import { ActionMessageInterface } from './ActionMessageInterface';

export interface EscrowMessageInterface extends ActionMessageInterface {
    nonce?: string;
    accepted?: boolean;
    memo?: string;
    info?: any;      // todo
    escrow: any;    // todo
}
