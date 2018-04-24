import { Logger as LoggerType } from '../../core/Logger';
import { EscrowMessage } from '../messages/EscrowMessage';
import * as resources from 'resources';
import { EscrowRequest } from '../requests/EscrowRequest';
export declare class EscrowFactory {
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(Logger: typeof LoggerType);
    /**
     * Factory which will create an EscrowMessage
     *
     * @param request, EscrowLockRequest | EscrowRefundRequest | EscrowReleaseRequest
     * @param escrow
     * @param address
     *
     * @returns {EscrowMessage}
     */
    getMessage(request: EscrowRequest, rawtx: string): Promise<EscrowMessage>;
    /**
     * Factory will return model based on the message
     *
     * @param data
     * @returns {Escrow}
     */
    getModel(data: EscrowMessage): resources.Escrow;
    /**
     * creates the EscrowMessage for EscrowLockRequest
     *
     * @param lockRequest
     * @param escrow
     * @returns {EscrowMessage}
     */
    private getLockMessage(request, rawtx);
    /**
     * creates the EscrowMessage for EscrowReleaseRequest
     *
     * @param releaseRequest
     * @param escrow
     */
    private getReleaseMessage(request, rawtx);
    /**
     * creates the EscrowMessage for EscrowRefundRequest
     *
     * @param refundRequest
     * @param escrow
     */
    private getRefundMessage(request, rawtx);
    /**
     * Checks if the escrowAction is allowed for the given escrow
     *
     * @param escrowAction
     * @param escrow
     * @returns {boolean}
     */
    private checkEscrowActionValidity(escrowAction, escrow?);
}
