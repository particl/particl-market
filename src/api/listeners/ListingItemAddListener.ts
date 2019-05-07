// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { EventEmitter } from '../../core/api/events';
import { ListingItemAddActionService } from '../services/action/ListingItemAddActionService';
import {SmsgMessageStatus} from '../enums/SmsgMessageStatus';
import {MarketplaceMessageEvent} from '../messages/MarketplaceMessageEvent';
import {SmsgMessageService} from '../services/model/SmsgMessageService';

export class ListingItemAddListener implements interfaces.Listener {

    public static Event = ListingItemAddActionService.ActionEvent;

    public log: LoggerType;

    // tslint:disable:max-line-length
    constructor(
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }
    // tslint:enable:max-line-length

    /**
     *
     * @param event
     * @returns {Promise<void>}
     */
    public async act(event: MarketplaceMessageEvent): Promise<any> {
        this.log.info('Received event MPA_LISTING_ADD: ', JSON.stringify(event, null, 2));

        if (ListingItemAddActionService.validate(event.marketplaceMessage)) {
            await this.listingItemAddActionService.onEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
                })
                .catch(async reason => {
                    // todo: handle different reasons?
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PROCESSING_FAILED);
                });
        } else {
            await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.VALIDATION_FAILED);
        }

    }

}
