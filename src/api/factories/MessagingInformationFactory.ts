// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessagingInformation } from '../models/MessagingInformation';

export class MessagingInformationFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public get(message: string[]): Promise<MessagingInformation> {
        const messInfoData = _.map(message, (value) => {
            return _.assign({}, {
                protocol: value['protocol'],
                publicKey: value['public_key']
            });
        });
        return messInfoData as any;
    }

}
