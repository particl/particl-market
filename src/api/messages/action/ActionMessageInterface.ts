// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MPA } from 'omp-lib/dist/interfaces/omp';
import { ActionMessageTypes } from '../../enums/ActionMessageTypes';
import {KVS} from 'omp-lib/dist/interfaces/common';

/**
 * MPAExtension defines how the MPA will be extended
 * type is extended to include also other ActionTypes instead of just the MPAction
 */
interface MPAExtension {
    type: ActionMessageTypes;
}

export interface ActionMessageInterface extends Overwrite<MPA, MPAExtension> {
    type: ActionMessageTypes;
    generated: number;
    hash: string;
    objects?: KVS[];
}
