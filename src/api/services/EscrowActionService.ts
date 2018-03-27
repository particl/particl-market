import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import * as resources from 'resources';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';

import { EventEmitter } from 'events';
import { ActionMessageService } from './ActionMessageService';
import { EscrowService } from './EscrowService';
import { ListingItemService } from './ListingItemService';
import { ListingItemTemplateService } from './ListingItemTemplateService';
import { PaymentInformationService } from './PaymentInformationService';

export class EscrowActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ActionMessageService) public actionMessageService: ActionMessageService,
        @inject(Types.Service) @named(Targets.Service.EscrowService) public escrowService: EscrowService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        // @inject(Types.Service) @named(Targets.Service.PaymentInformationService) public paymentInformationService: PaymentInformationService,

        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    public async processLockEscrowReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    public async processReleaseEscrowReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    public async processRequestRefundEscrowReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    public async processRefundEscrowReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    private configureEventListeners(): void {
        this.eventEmitter.on(Events.LockEscrowReceivedEvent, async (event) => {
            await this.processLockEscrowReceivedEvent(event);
        });
        this.eventEmitter.on(Events.ReleaseEscrowReceivedEvent, async (event) => {
            await this.processReleaseEscrowReceivedEvent(event);
        });
        this.eventEmitter.on(Events.RequestRefundEscrowReceivedEvent, async (event) => {
            await this.processRequestRefundEscrowReceivedEvent(event);
        });
        this.eventEmitter.on(Events.RefundEscrowReceivedEvent, async (event) => {
            await this.processRefundEscrowReceivedEvent(event);
        });
    }
}
