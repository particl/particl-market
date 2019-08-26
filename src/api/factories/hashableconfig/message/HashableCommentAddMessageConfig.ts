// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseHashableConfig, HashableFieldConfig, HashableFieldValueConfig } from 'omp-lib/dist/interfaces/configs';
import { HashableCommentAddField } from '../HashableField';

export class HashableCommentAddMessageConfig extends BaseHashableConfig {

    public fields = [{
        from: 'sender',
        to: HashableCommentAddField.COMMENT_SENDER
    }, {
        from: 'receiver',
        to: HashableCommentAddField.COMMENT_RECEIVER
    }, {
        from: 'target',
        to: HashableCommentAddField.COMMENT_TARGET
    }, {
        from: 'message',
        to: HashableCommentAddField.COMMENT_MESSAGE
    }, {
        from: 'commentType',
        to: HashableCommentAddField.COMMENT_TYPE
    }, {
        from: 'parentCommentHash',
        to: HashableCommentAddField.COMMENT_PARENT_COMMENT_HASH
    }] as HashableFieldConfig[];

    constructor(values?: HashableFieldValueConfig[]) {
        super(values);
    }
}
