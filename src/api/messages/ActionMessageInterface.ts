// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { GovernanceAction } from '../enums/GovernanceAction';
import { MPA } from 'omp-lib/dist/interfaces/omp';

type ActionTypes = MPAction | GovernanceAction;

/**
 * MPAExtension defines how the MPA will be extended
 * type is extetnded to include also other ActionTypes instead of just the MPAction
 */
interface MPAExtension {
    type: ActionTypes;
}

export interface ActionMessageInterface extends Overwrite<MPA, MPAExtension> {}
