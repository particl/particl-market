// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { MessageCreateParamsInterface } from './MessageCreateParamsInterface';
import { CommentType } from '../../enums/CommentType';

export interface CommentAddMessageCreateParams extends MessageCreateParamsInterface {
    sender: resources.Profile;
    receiver: string;
    type: CommentType;
    target: string;
    message: string;
    parentComment: resources.Comment;
    signature: string;
}
