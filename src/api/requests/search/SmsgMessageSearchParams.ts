// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { BaseSearchParams } from './BaseSearchParams';
import { SmsgMessageSearchOrderField } from '../../enums/SearchOrderField';
import { ActionMessageTypes } from '../../enums/ActionMessageTypes';
import { ActionDirection } from '../../enums/ActionDirection';

// tslint:disable:variable-name
export class SmsgMessageSearchParams extends BaseSearchParams {

    public orderField = SmsgMessageSearchOrderField.SENT;

    public types: ActionMessageTypes[];
    public status: SmsgMessageStatus;
    public direction: ActionDirection;

    public age = 1000 * 60 * 2; // minimum message age in ms, 2 min

    public msgid: string;
}
// tslint:enable:variable-name
