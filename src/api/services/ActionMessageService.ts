import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import * as _ from 'lodash';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageException } from '../exceptions/MessageException';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import { ActionMessageRepository } from '../repositories/ActionMessageRepository';
import { ActionMessage } from '../models/ActionMessage';
import { ActionMessageCreateRequest } from '../requests/ActionMessageCreateRequest';
import { ActionMessageUpdateRequest } from '../requests/ActionMessageUpdateRequest';
import { MessageInfoService } from './MessageInfoService';
import { MessageEscrowService } from './MessageEscrowService';
import { MessageDataService } from './MessageDataService';
import { MessageObjectService } from './MessageObjectService';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { MarketService } from './MarketService';
import { ListingItemService } from './ListingItemService';
import { ActionMessageFactory } from '../factories/ActionMessageFactory';



export class ActionMessageService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MessageInfoService) private messageInfoService: MessageInfoService,
        @inject(Types.Service) @named(Targets.Service.MessageEscrowService) private messageEscrowService: MessageEscrowService,
        @inject(Types.Service) @named(Targets.Service.MessageDataService) private messageDataService: MessageDataService,
        @inject(Types.Service) @named(Targets.Service.MessageObjectService) private messageObjectService: MessageObjectService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Factory) @named(Targets.Factory.ActionMessageFactory) private actionMessageFactory: ActionMessageFactory,
        @inject(Types.Repository) @named(Targets.Repository.ActionMessageRepository) public actionMessageRepo: ActionMessageRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ActionMessage>> {
        return this.actionMessageRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ActionMessage> {
        const actionMessage = await this.actionMessageRepo.findOne(id, withRelated);
        if (actionMessage === null) {
            this.log.warn(`ActionMessage with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return actionMessage;
    }

    @validate()
    public async create( @request(ActionMessageCreateRequest) data: any): Promise<ActionMessage> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create ListingItem, body: ', JSON.stringify(body, null, 2));

        const messageInfoCreateRequest = body.info;
        const messageEscrowCreateRequest = body.escrow;
        const messageDataCreateRequest = body.data;
        const actionMessageObjects = body.objects;

        delete body.info;
        delete body.escrow;
        delete body.data;
        delete body.objects;

        if (_.isEmpty(messageInfoCreateRequest) || _.isEmpty(messageEscrowCreateRequest) || _.isEmpty(messageDataCreateRequest)) {
            throw new MessageException('Could not create the ActionMessage, missing data!');
        }

        this.log.debug('actionmessage body:', JSON.stringify(body, null, 2));
        // If the request body was valid we will create the actionMessage
        const actionMessage = await this.actionMessageRepo.create(body);

        this.log.debug(JSON.stringify(actionMessage.toJSON(), null, 2));
        messageInfoCreateRequest.action_message_id = actionMessage.Id;
        const messageInfo = await this.messageInfoService.create(messageInfoCreateRequest);

        messageEscrowCreateRequest.action_message_id = actionMessage.Id;
        const messageEscrow = await this.messageEscrowService.create(messageEscrowCreateRequest);

        messageDataCreateRequest.action_message_id = actionMessage.Id;
        const messageData = await this.messageDataService.create(messageDataCreateRequest);

        // create messageobjects
        for (const object of actionMessageObjects) {
            object.action_message_id = actionMessage.Id;
            await this.messageObjectService.create(object);
        }

        // finally find and return the created actionMessage
        const newActionMessage = await this.findOne(actionMessage.id);
        return newActionMessage;
    }

    /**
     * save the received ActionMessage to the database
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<ActionMessage>}
     */
    public async createFromMarketplaceEvent(event: MarketplaceEvent): Promise<ActionMessage> {

        const message = event.marketplaceMessage;

        if (message.market && message.mpaction) {
            // get market
            const marketModel = await this.marketService.findByAddress(message.market);
            const market = marketModel.toJSON();

            // find the ListingItem
            const listingItemModel = await this.listingItemService.findOneByHash(message.mpaction.listing);
            const listingItem = listingItemModel.toJSON();

            // create ActionMessage
            const actionMessageCreateRequest = await this.actionMessageFactory.getModel(message.mpaction, listingItem.id, event.smsgMessage);
            this.log.debug('process(), actionMessageCreateRequest:', JSON.stringify(actionMessageCreateRequest, null, 2));

            const actionMessageModel = await this.create(actionMessageCreateRequest);
            const actionMessage = actionMessageModel.toJSON();

            return actionMessage;
        } else {
            throw new MessageException('Marketplace message missing market.');
        }
    }

    @validate()
    public async update(id: number, @request(ActionMessageUpdateRequest) body: any): Promise<ActionMessage> {

        throw new NotImplementedException();
/*
        // find the existing one without related
        const actionMessage = await this.findOne(id, false);

        // set new values
        actionMessage.Action = body.action;
        actionMessage.Nonce = body.nonce;
        actionMessage.Accepted = body.accepted;

        // update actionMessage record
        const updatedActionMessage = await this.actionMessageRepo.update(id, actionMessage.toJSON());

        // TODO: find related record and update it

        // TODO: finally find and return the updated actionMessage
        // const newActionMessage = await this.findOne(id);
        // return newActionMessage;

        return updatedActionMessage;
*/
    }

    public async destroy(id: number): Promise<void> {
        await this.actionMessageRepo.destroy(id);
    }

}
