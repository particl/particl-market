// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { EnvConfig } from './EnvConfig';

export class DevelopmentEnvConfig extends EnvConfig {

    constructor(dataDirLocation?: string) {
        super(
            dataDirLocation || './data',
            '.env'
        );
    }
}
