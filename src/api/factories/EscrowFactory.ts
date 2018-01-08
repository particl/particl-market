import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { EscrowMessage } from '../messages/EscrowMessage';
import { EscrowLockRequest } from '../requests/EscrowLockRequest';
import { EscrowRefundRequest } from '../requests/EscrowRefundRequest';
import { EscrowReleaseRequest } from '../requests/EscrowReleaseRequest';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import { MessageException } from '../exceptions/MessageException';
import * as resources from 'resources';


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
    public async getMessage(request: EscrowLockRequest | EscrowRefundRequest | EscrowReleaseRequest,
                            escrow?: resources.Escrow,
                            address?: resources.Address): Promise<EscrowMessage> {

        switch (request.action) {

            case EscrowMessageType.MPA_LOCK:
                return await this.getLockMessage(request as EscrowLockRequest, escrow, address);

            case EscrowMessageType.MPA_RELEASE:
                return await this.getReleaseMessage(request as EscrowReleaseRequest, escrow);

            case EscrowMessageType.MPA_REFUND:
                return await this.getRefundMessage(request as EscrowRefundRequest, escrow);

            case EscrowMessageType.MPA_REQUEST_REFUND:
                // TODO: IMPLEMENT
                // return this.getRequestRefundMessage(request as EscrowRequestRefundRequest, escrow);
                return new EscrowMessage();
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
     * @param address
     * @returns {EscrowMessage}
     */
    private async getLockMessage(lockRequest: EscrowLockRequest, escrow?: resources.Escrow, address?: resources.Address): Promise<EscrowMessage> {

        this.checkEscrowActionValidity(EscrowMessageType.MPA_LOCK, escrow);
        const rawTx = this.createRawTx(lockRequest, escrow);
        const addressOneLiner = this.getAddressOneLiner(address);

        return {
            action: lockRequest.action,
            listing: lockRequest.listing,
            nonce: lockRequest.nonce,
            info: {
                address: addressOneLiner,
                memo: lockRequest.memo
            },
            escrow: {
                rawtx: rawTx
            }
        } as EscrowMessage;
    }

    /**
     * creates the EscrowMessage for EscrowReleaseRequest
     *
     * @param releaseRequest
     * @param escrow
     */
    private async getReleaseMessage(releaseRequest: EscrowReleaseRequest, escrow?: resources.Escrow): Promise<EscrowMessage> {

        this.checkEscrowActionValidity(EscrowMessageType.MPA_RELEASE, escrow);
        const rawTx = this.createRawTx(releaseRequest, escrow);

        return {
            action: releaseRequest.action,
            listing: releaseRequest.listing,
            memo: releaseRequest.memo,
            escrow: {
                type: 'release',
                rawtx: rawTx
            }
        } as EscrowMessage;
    }

    /**
     * creates the EscrowMessage for EscrowRefundRequest
     *
     * @param refundRequest
     * @param escrow
     */
    private async getRefundMessage(refundRequest: EscrowRefundRequest, escrow?: resources.Escrow): Promise<EscrowMessage> {

        this.checkEscrowActionValidity(EscrowMessageType.MPA_REFUND, escrow);
        const rawTx = this.createRawTx(refundRequest, escrow);

        return {
            action: refundRequest.action,
            listing: refundRequest.listing,
            accepted: refundRequest.accepted,
            memo: refundRequest.memo,
            escrow: {
                type: 'refund',
                rawtx: rawTx
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

    /**
     * Creates rawtx based on params
     *
     * @param request
     * @param escrow
     * @returns {string}
     */
    private createRawTx(request: EscrowLockRequest | EscrowRefundRequest | EscrowReleaseRequest, escrow?: resources.Escrow): string {
        // MPA_RELEASE:
        // rawtx: 'The buyer sends the half signed rawtx which releases the escrow and paymeny.
        // The vendor then recreates the whole transaction (check ouputs, inputs, scriptsigs
        // and the fee), verifying that buyer\'s rawtx is indeed legitimate. The vendor then
        // signs the rawtx and broadcasts it.'

        // MPA_REFUND
        // rawtx: 'The vendor decodes the rawtx from MP_REQUEST_REFUND and recreates the whole
        // transaction (check ouputs, inputs, scriptsigs and the fee), verifying that buyer\'s
        // rawtx is indeed legitimate. The vendor then signs the rawtx and sends it to the buyer.
        // The vendor can decide to broadcast it himself.'

        // TODO: implement
        return 'todo: implement';
    }


    private getAddressOneLiner(address: resources.Address = {} as resources.Address): string {
        const addressArray: any = [];

        if (!_.isEmpty(address)) {
            if (address.addressLine1) {
                addressArray.push(address.addressLine1);
            }
            if (address.addressLine2) {
                addressArray.push(address.addressLine2);
            }
            if (address.city) {
                addressArray.push(address.city);
            }
            if (address.country) {
                addressArray.push(address.country);
            }
            if (address.zipCode) {
                addressArray.push(address.zipCode);
            }
        }

        return addressArray.join(', ');
    }
}
