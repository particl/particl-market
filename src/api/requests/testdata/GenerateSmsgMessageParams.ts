// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import {ActionMessageTypes} from '../../enums/ActionMessageTypes';
import {SmsgMessageStatus} from '../../enums/SmsgMessageStatus';
import {ActionDirection} from '../../enums/ActionDirection';
import {MPAction} from 'omp-lib/dist/interfaces/omp-enums';
import {MessageCreateParamsInterface} from '../message/MessageCreateParamsInterface';

// todo: extends GenerateCommonParamsInterface
export interface GenerateSmsgMessageParamsInterface {
    toParamsArray(): boolean[];
}

export class GenerateSmsgMessageParams implements GenerateSmsgMessageParamsInterface {

    public type: ActionMessageTypes;
    public status: SmsgMessageStatus;
    public direction: ActionDirection;
    public msgid: string;
    public read: boolean;
    public paid: boolean;
    public received: number;
    public sent: number;
    public expiration: number;
    public daysretention: number;
    public from: string;
    public to: string;

    public messageParams: MessageCreateParamsInterface;
    public text: string;

    /**
     * generateParams[]:
     *
     * @param generateParams
     */
    constructor(generateParams: any[] = []) {
        if (!_.isEmpty(generateParams) ) {
            this.type = generateParams[0] ? generateParams[0] : MPAction.MPA_LISTING_ADD;
            this.status = generateParams[1] ? generateParams[1] : SmsgMessageStatus.NEW;
            this.direction = generateParams[2] ? generateParams[2] : ActionDirection.INCOMING;
            this.read = generateParams[3] ? generateParams[3] : false;
            this.paid = generateParams[4] ? generateParams[4] : true;
            this.received = generateParams[5] ? generateParams[5] : Date.now();
            this.sent = generateParams[6] ? generateParams[6] : Date.now() - (24 * 60 * 60 * 1000);
            this.expiration = generateParams[7] ? generateParams[7] : Date.now() + (5 * 24 * 60 * 60 * 1000);
            this.daysretention = generateParams[8] ? generateParams[8] : 7;
            this.from = generateParams[9] ? generateParams[9] : undefined;
            this.to = generateParams[10] ? generateParams[10] : undefined;
            this.messageParams = generateParams[11] ? generateParams[11] : undefined;
            this.text = generateParams[12] ? generateParams[12] : undefined;
        }
    }

    public toParamsArray(): any[] {
        return [
            this.type,
            this.status,
            this.direction,
            this.read,
            this.paid,
            this.received,
            this.sent,
            this.expiration,
            this.daysretention,
            this.from,
            this.to,
            this.messageParams,
            this.text
        ];
    }
}
