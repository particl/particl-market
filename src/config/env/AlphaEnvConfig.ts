// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { EnvConfig } from './EnvConfig';

export class AlphaEnvConfig extends EnvConfig {

    constructor() {
        super();

        process.env.SWAGGER_ENABLED = false;
        // process.env.MIGRATE = false;
    }
}
