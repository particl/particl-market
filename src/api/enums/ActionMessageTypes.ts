// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { GovernanceAction } from './GovernanceAction';
import { MPActionExtended } from './MPActionExtended';
import { CommentAction } from './CommentAction';

export type ActionMessageTypes = MPAction | MPActionExtended | GovernanceAction | CommentAction;

export function hasActionMessageType(typedValue: string): boolean {
    return  (Object as any).values(MPAction).includes(typedValue) ||
        (Object as any).values(MPActionExtended).includes(typedValue) ||
        (Object as any).values(GovernanceAction).includes(typedValue) ||
        (Object as any).values(CommentAction).includes(typedValue);
}
