// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { CommentMessageType } from '../enums/CommentMessageType';

export interface CommentMessageInterface {
    type: CommentMessageType;
    item?: string;
    objects?: any;
}
