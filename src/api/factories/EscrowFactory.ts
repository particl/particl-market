// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { EscrowLockMessage } from '../messages/actions/EscrowLockMessage';
import { EscrowRequest } from '../requests/EscrowRequest';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

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
     * @returns {EscrowLockMessage}
     */
    public async getMessage(request: EscrowRequest, rawtx: string): Promise<EscrowLockMessage> {

        // TODO: validity check
        // this.checkEscrowActionValidity(request.action, escrow);

        switch (request.action) {
            case MPAction.MPA_LOCK:
                return await this.getLockMessage(request, rawtx);

            case MPAction.MPA_RELEASE:
                return await this.getReleaseMessage(request, rawtx);

            case MPAction.MPA_REFUND:
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
    public getModel(data: EscrowLockMessage): resources.Escrow {

        // TODO:
        return {} as resources.Escrow;
    }

    /**
     * creates the EscrowLockMessage for EscrowLockRequest
     *
     * @param lockRequest
     * @param escrow
     * @returns {EscrowLockMessage}
     */
    private async getLockMessage(request: EscrowRequest, rawtx: string): Promise<EscrowLockMessage> {


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
        } as EscrowLockMessage;
    }

    /**
     * creates the EscrowMessage for EscrowReleaseRequest
     *
     * @param releaseRequest
     * @param escrow
     */
    private async getReleaseMessage(request: EscrowRequest, rawtx: string): Promise<EscrowLockMessage> {

        return {
            action: request.action,
            item: request.orderItem.itemHash,
            memo: request.memo,
            escrow: {
                type: 'release',
                rawtx
            }
        } as EscrowLockMessage;
    }

    /**
     * creates the EscrowMessage for EscrowRefundRequest
     *
     * @param refundRequest
     * @param escrow
     */
    private async getRefundMessage(request: EscrowRequest, rawtx: string): Promise<EscrowLockMessage> {

        return {
            action: request.action,
            item: request.orderItem.itemHash,
            accepted: request.accepted,
            memo: request.memo,
            escrow: {
                type: 'refund',
                rawtx
            }
        } as EscrowLockMessage;
    }
}
