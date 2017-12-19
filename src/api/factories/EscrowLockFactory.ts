import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { GenerateMessageInterface } from '../messages/GenerateMessageInterface';
import { Escrow } from '../models/Escrow';
import { EscrowLockMessage } from '../messages/escrow/EscrowLockMessage';
import * as _ from 'lodash';

export class EscrowLockFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public get(data: EscrowLockMessage): Promise<Escrow> {
        return {
            version: '0.0.1.0',
            mpaction: [
                {
                    action: 'MPA_LOCK',
                    listing: data.listing,
                    nonce: data.nonce,
                    info: {
                        address: data.address['AddressLine1'] + data.address['AddressLine2'],
                        memo: data.memo
                    },
                    escrow: {
                        rawtx: '....'
                    }
                }
            ]
        } as any;
    }

}
