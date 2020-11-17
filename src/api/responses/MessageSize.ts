// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { CoreMessageVersion } from '../enums/CoreMessageVersion';

export class MessageSize {
    public identifier?: number;
    public messageVersion: CoreMessageVersion;
    public size: number;
    public maxSize: number;
    public spaceLeft: number;
    public fits: boolean;

    public childMessageSizes?: MessageSize[];
}
