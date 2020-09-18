// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MessageBody } from '../../../core/api/MessageBody';
import { ActionMessageInterface } from './ActionMessageInterface';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { DSN } from 'omp-lib/dist/interfaces/dsn';

export class BaseImageAddMessage extends MessageBody implements ActionMessageInterface {
    public type: MPActionExtended;
    public hash: string;
    public data: DSN[];
    public target: string;
    public objects?: KVS[];
    public generated: number;
    public featured: boolean;
}
