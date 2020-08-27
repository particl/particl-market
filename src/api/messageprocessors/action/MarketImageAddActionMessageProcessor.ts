// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../../constants';
import { Logger as LoggerType } from '../../../core/Logger';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { MarketplaceMessageEvent } from '../../messages/MarketplaceMessageEvent';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { ProposalService } from '../../services/model/ProposalService';
import { ActionMessageProcessorInterface } from '../ActionMessageProcessorInterface';
import { BaseActionMessageProcessor } from '../BaseActionMessageProcessor';
import { BidService } from '../../services/model/BidService';
import { ActionDirection } from '../../enums/ActionDirection';
import { ListingItemService } from '../../services/model/ListingItemService';
import { MarketService } from '../../services/model/MarketService';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { MarketImageAddValidator } from '../../messagevalidators/MarketImageAddValidator';
import { MarketImageAddActionService } from '../../services/action/MarketImageAddActionService';

export class MarketImageAddActionMessageProcessor extends BaseActionMessageProcessor implements ActionMessageProcessorInterface {

    public static Event = Symbol(MPActionExtended.MPA_MARKET_IMAGE_ADD);

    constructor(
        // tslint:disable:max-line-length
        @inject(Types.Service) @named(Targets.Service.action.MarketImageAddActionService) public actionService: MarketImageAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.MarketImageAddValidator) public validator: MarketImageAddValidator,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
        // tslint:enable:max-line-length
    ) {
        super(MPActionExtended.MPA_MARKET_IMAGE_ADD,
            actionService,
            smsgMessageService,
            bidService,
            proposalService,
            validator,
            Logger
        );
    }

    /**
     * handles the received ListingItemAddMessage and return SmsgMessageStatus as a result
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {

        this.log.debug('MarketImageAddActionMessageProcessor.onEvent()');
        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: ListingItemAddMessage = marketplaceMessage.action as ListingItemAddMessage;

        // processMessage will create the ListingItem
        return await this.actionService.processMessage(marketplaceMessage, ActionDirection.INCOMING, smsgMessage)
            .then(value => {
                this.log.debug('PROCESSED: ' + smsgMessage.msgid);
                return SmsgMessageStatus.PROCESSED;

            })
            .catch(reason => {
                this.log.error('PROCESSING FAILED: ', smsgMessage.msgid);
                return SmsgMessageStatus.PROCESSING_FAILED;
            });
    }
}
