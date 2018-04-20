import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { EscrowMessage } from '../messages/EscrowMessage';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import * as resources from 'resources';
import { EscrowRequest } from '../requests/EscrowRequest';
import { NotImplementedException } from '../exceptions/NotImplementedException';

export class EscrowFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }


    /**
     * Factory which will create an EscrowMessage
     *
     * @param request, EscrowLockRequest | EscrowRefundRequest | EscrowReleaseRequest
     * @param escrow
     * @param address
     *
     * @returns {EscrowMessage}
     */
    public async getMessage(request: EscrowRequest, rawtx: string): Promise<EscrowMessage> {

        // TODO: validity check
        // this.checkEscrowActionValidity(request.action, escrow);

        switch (request.action) {
            case EscrowMessageType.MPA_LOCK:
                return await this.getLockMessage(request, rawtx);

            case EscrowMessageType.MPA_RELEASE:
                return await this.getReleaseMessage(request, rawtx);

            case EscrowMessageType.MPA_REFUND:
                return await this.getRefundMessage(request, rawtx);

            default:
                throw new NotImplementedException();
        }
    }

    /**
     * Factory will return model based on the message
     *
     * @param data
     * @returns {Escrow}
     */
    public getModel(data: EscrowMessage): resources.Escrow {

        // TODO:
        return {} as resources.Escrow;
    }

    /**
     * creates the EscrowMessage for EscrowLockRequest
     *
     * @param lockRequest
     * @param escrow
     * @returns {EscrowMessage}
     */
    private async getLockMessage(request: EscrowRequest, rawtx: string): Promise<EscrowMessage> {


        return {
            action: request.action,
            item: request.orderItem.itemHash,
            nonce: request.nonce,
            info: {
                memo: request.memo
            },
            escrow: {
                type: 'lock',
                rawtx
            }
        } as EscrowMessage;
    }

    /**
     * creates the EscrowMessage for EscrowReleaseRequest
     *
     * @param releaseRequest
     * @param escrow
     */
    private async getReleaseMessage(request: EscrowRequest, rawtx: string): Promise<EscrowMessage> {

        return {
            action: request.action,
            item: request.orderItem.itemHash,
            memo: request.memo,
            escrow: {
                type: 'release',
                rawtx
            }
        } as EscrowMessage;
    }

    /**
     * creates the EscrowMessage for EscrowRefundRequest
     *
     * @param refundRequest
     * @param escrow
     */
    private async getRefundMessage(request: EscrowRequest, rawtx: string): Promise<EscrowMessage> {

        return {
            action: request.action,
            item: request.orderItem.itemHash,
            accepted: request.accepted,
            memo: request.memo,
            escrow: {
                type: 'refund',
                rawtx
            }
        } as EscrowMessage;
    }

    /**
     * Checks if the escrowAction is allowed for the given escrow
     *
     * @param escrowAction
     * @param escrow
     * @returns {boolean}
     */
    private checkEscrowActionValidity(escrowAction: EscrowMessageType, escrow?: resources.Escrow): boolean {
        let isValid = true;
        // TODO: implement
        if (!isValid) {
            isValid = false;
            // throw new MessageException('Action is not valid for the Escrow');
        }
        return isValid;
    }
}
