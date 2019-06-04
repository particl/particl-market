// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { SmsgSendParams } from './SmsgSendParams';
import { KVS } from 'omp-lib/dist/interfaces/common';

/**
 *
 */
export interface ActionRequestInterface {
    sendParams: SmsgSendParams;
    objects?: KVS[];
}
