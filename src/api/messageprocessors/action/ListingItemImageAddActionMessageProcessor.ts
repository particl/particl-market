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
import { ListingItemImageAddActionService } from '../../services/action/ListingItemImageAddActionService';
import { ListingItemImageAddValidator } from '../../messagevalidators/ListingItemImageAddValidator';

export class ListingItemImageAddActionMessageProcessor extends BaseActionMessageProcessor implements ActionMessageProcessorInterface {

    public static Event = Symbol(MPActionExtended.MPA_LISTING_IMAGE_ADD);

    constructor(
        // tslint:disable:max-line-length
        @inject(Types.Service) @named(Targets.Service.action.ListingItemImageAddActionService) public actionService: ListingItemImageAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.ListingItemImageAddValidator) public validator: ListingItemImageAddValidator,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
        // tslint:enable:max-line-length
    ) {
        super(MPActionExtended.MPA_LISTING_IMAGE_ADD,
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

        this.log.debug('ListingItemImageAddActionListener.onEvent()');
        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: ListingItemAddMessage = marketplaceMessage.action as ListingItemAddMessage;

        // TODO: add smsgMessage to MessageValidator and move this there
        // LISTINGITEM_ADD's should be allowed to sent only from the publish address to the market receive address
        const market: resources.Market = await this.marketService.findAllByReceiveAddress(smsgMessage.to).then(value => value.toJSON()[0]);
        if (market.publishAddress !== smsgMessage.from) {
            // message was sent from an address which isn't allowed
            this.log.error('MPA_LISTING_ADD failed validation: Invalid message sender.');
            return SmsgMessageStatus.VALIDATION_FAILED;
            // throw new MessageException('Invalid message sender.');
        }

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
