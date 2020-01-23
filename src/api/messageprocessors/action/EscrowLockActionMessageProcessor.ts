// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../../constants';
import { Logger as LoggerType } from '../../../core/Logger';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { MarketplaceMessageEvent } from '../../messages/MarketplaceMessageEvent';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { ListingItemService } from '../../services/model/ListingItemService';
import { ActionMessageProcessorInterface } from '../ActionMessageProcessorInterface';
import { BidFactory } from '../../factories/model/BidFactory';
import { BidService } from '../../services/model/BidService';
import { EscrowLockMessage } from '../../messages/action/EscrowLockMessage';
import { EscrowLockActionService } from '../../services/action/EscrowLockActionService';
import { ProposalService } from '../../services/model/ProposalService';
import { BaseBidActionMessageProcessor } from '../BaseBidActionMessageProcessor';
import { EscrowLockValidator } from '../../messagevalidators/EscrowLockValidator';
import { ActionDirection } from '../../enums/ActionDirection';

export class EscrowLockActionMessageProcessor extends BaseBidActionMessageProcessor implements ActionMessageProcessorInterface {

    public static Event = Symbol(MPAction.MPA_LOCK);

    constructor(
        @inject(Types.Service) @named(Targets.Service.action.EscrowLockActionService) public escrowLockActionService: EscrowLockActionService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.EscrowLockValidator) public validator: EscrowLockValidator,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        super(MPAction.MPA_LOCK,
            escrowLockActionService,
            smsgMessageService,
            bidService,
            proposalService,
            validator,
            listingItemService,
            bidFactory,
            Logger);
    }

    /**
     * handles the received EscrowLockMessage and return SmsgMessageStatus as a result
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: EscrowLockMessage = marketplaceMessage.action as EscrowLockMessage;

        return await this.escrowLockActionService.processMessage(marketplaceMessage, ActionDirection.INCOMING, smsgMessage)
            .then(value => {
                return SmsgMessageStatus.PROCESSED;
            })
            .catch(reason => {
                return SmsgMessageStatus.PROCESSING_FAILED;
            });
    }

}
