import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { Escrow } from '../models/Escrow';
import { EscrowLockMessage } from '../messages/escrow/EscrowLockMessage';
import { EscrowRefundMessage } from '../messages/escrow/EscrowRefundMessage';
import { EscrowReleaseMessage } from '../messages/escrow/EscrowReleaseMessage';

export class EscrowFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }


    /**
     * data:
     * escrow: object
     * address: object
     * listing: string
     * nonce: string
     * memo: string
     *
     * @param data
     * @returns {Promise<Escrow>}
     */
    public getLockMessage(data: EscrowLockMessage): Promise<Escrow> {
        return {
            version: '0.0.1.0',
            mpaction: [
                {
                    action: 'MPA_LOCK',
                    listing: data.listing,
                    nonce: data.nonce,
                    info: {
                        address: data.address['addressLine1'] + data.address['addressLine2'],
                        memo: data.memo
                    },
                    escrow: {
                        rawtx: '....'
                    }
                }
            ]
        } as any;
    }


    /**
     * data:
     * escrow: object
     * listing: string
     * memo: string
     *
     * @param data
     * @returns {Promise<Escrow>}
     */
    public getReleaseMessage(data: EscrowReleaseMessage): Promise<Escrow> {
        return {
            version: '0.0.1.0',
            mpaction: {
                action: 'MPA_RELEASE',
                item: data.listing,
                memo: data.memo,
                escrow: {
                    type: 'release',
                    rawtx: 'The buyer sends the half signed rawtx which releases the escrow and paymeny. The vendor then recreates the whole transaction (check ouputs, inputs, scriptsigs and the fee), verifying that buyer\'s rawtx is indeed legitimate. The vendor then signs the rawtx and broadcasts it.'
                }
            }
        } as any;
    }

    /**
     * data:
     * escrow: object
     * listing: string
     * memo: string
     * accepted: boolean
     *
     * @param data
     * @returns {Promise<Escrow>}
     */
    public getRefundMessage(data: EscrowRefundMessage): Promise<Escrow> {
        return {
            version: '0.0.1.0',
            mpaction: {
                action: 'MPA_REFUND',
                item: data.listing,
                accepted: data.accepted,
                memo: data.memo,
                escrow: {
                    type: 'refund',
                    rawtx: 'The vendor decodes the rawtx from MP_REQUEST_REFUND and recreates the whole transaction (check ouputs, inputs, scriptsigs and the fee), verifying that buyer\'s rawtx is indeed legitimate. The vendor then signs the rawtx and sends it to the buyer. The vendor can decide to broadcast it himself.'
                }
            }
        } as any;
    }
}
