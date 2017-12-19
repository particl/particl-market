import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { GenerateMessageInterface } from '../messages/GenerateMessageInterface';
import { Escrow } from '../models/Escrow';
import { EscrowRefundMessage } from '../messages/escrow/EscrowRefundMessage';
import * as _ from 'lodash';

export class EscrowRefundFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public get(data: EscrowRefundMessage): Promise<Escrow> {
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


