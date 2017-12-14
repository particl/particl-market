import { inject, named } from 'inversify';
import * as crypto from 'crypto-js';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessagingInformation } from '../models/MessagingInformation';

import { MessagingProtocolType } from '../enums/MessagingProtocolType';

export class MessagingInformationFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public get(data: any): Promise<MessagingInformation> {
        const MessagingInfoData = _.map(data, (value) => {
            return _.assign({}, {
                protocol: MessagingProtocolType[value['protocol']],
                publicKey: value['public_key']
            });
        });
        return MessagingInfoData as any;
    }

}
