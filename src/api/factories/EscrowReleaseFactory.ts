import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { GenerateMessageInterface } from '../messages/GenerateMessageInterface';
import { Escrow } from '../models/Escrow';
import { EscrowReleaseMessage } from '../messages/escrow/EscrowReleaseMessage';
import * as _ from 'lodash';

export class EscrowReleaseFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public get(data: EscrowReleaseMessage): Promise<Escrow> {
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

}


