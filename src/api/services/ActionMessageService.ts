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
import { ActionMessageFactory } from '../factories/ActionMessageFactory';
import { ListingItemAddMessage } from '../messages/ListingItemAddMessage';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
import * as resources from 'resources';

export class ActionMessageService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MessageInfoService) private messageInfoService: MessageInfoService,
        @inject(Types.Service) @named(Targets.Service.MessageEscrowService) private messageEscrowService: MessageEscrowService,
        @inject(Types.Service) @named(Targets.Service.MessageDataService) private messageDataService: MessageDataService,
        @inject(Types.Service) @named(Targets.Service.MessageObjectService) private messageObjectService: MessageObjectService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
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
        // this.log.debug('create ActionMessage, body: ', JSON.stringify(body, null, 2));

        const messageInfoCreateRequest = body.info;
        const messageEscrowCreateRequest = body.escrow;
        const messageDataCreateRequest = body.data;
        const actionMessageObjects = body.objects;

        delete body.info;
        delete body.escrow;
        delete body.data;
        delete body.objects;

        // If the request body was valid we will create the actionMessage
        let actionMessageModel = await this.actionMessageRepo.create(body);
        let actionMessage = actionMessageModel.toJSON();

        // this.log.debug('created actionMessage: ', JSON.stringify(actionMessage, null, 2));

        if (!_.isEmpty(messageInfoCreateRequest)) {
            messageInfoCreateRequest.action_message_id = actionMessage.id;
            const messageInfoModel = await this.messageInfoService.create(messageInfoCreateRequest);
            const messageInfo = messageInfoModel.toJSON();
            // this.log.debug('created messageInfo: ', JSON.stringify(messageInfo, null, 2));
        }

        if (!_.isEmpty(messageEscrowCreateRequest)) {
            messageEscrowCreateRequest.action_message_id = actionMessage.id;
            const messageEscrowModel = await this.messageEscrowService.create(messageEscrowCreateRequest);
            const messageEscrow = messageEscrowModel.toJSON();
            // this.log.debug('created messageEscrow: ', JSON.stringify(messageEscrow, null, 2));
        }

        // this.log.debug('messageDataCreateRequest: ', JSON.stringify(messageDataCreateRequest, null, 2));
        messageDataCreateRequest.action_message_id = actionMessage.id;
        const messageDataModel = await this.messageDataService.create(messageDataCreateRequest);
        const messageData = messageDataModel.toJSON();
        // this.log.debug('created messageData: ', JSON.stringify(messageData, null, 2));

        // create messageobjects

        // this.log.debug('actionMessageObjects:', JSON.stringify(body, null, 2));
        for (const object of actionMessageObjects) {
            object.action_message_id = actionMessage.id;
            const messageObjectModel = await this.messageObjectService.create(object);
            const messageObject = messageObjectModel.toJSON();
            // this.log.debug('created messageObject: ', JSON.stringify(messageObject, null, 2));

        }

        actionMessageModel = await this.findOne(actionMessage.id);
        actionMessage = actionMessageModel.toJSON();
        // this.log.debug('created actionMessage: ', JSON.stringify(actionMessage, null, 2));
        return actionMessageModel;
    }

    /**
     * save the received ActionMessage to the database
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<ActionMessage>}
     */
    public async createFromMarketplaceEvent(event: MarketplaceEvent, listingItem: resources.ListingItem): Promise<ActionMessage> {

        const message = event.marketplaceMessage;

        if (/* message.market &&*/ message.mpaction) {   // ACTIONEVENT
            // get market
            // const marketModel = await this.marketService.findByAddress(message.market);
            // const market = marketModel.toJSON();

            // find the ListingItem
            // const listingItemModel = await this.listingItemService.findOneByHash(message.mpaction.item);
            // const listingItem = listingItemModel.toJSON();

            // create ActionMessage
            const actionMessageCreateRequest = await this.actionMessageFactory.getModel(message.mpaction, listingItem.id, event.smsgMessage);
            this.log.debug('process(), actionMessageCreateRequest:', JSON.stringify(actionMessageCreateRequest, null, 2));

            const actionMessage = await this.create(actionMessageCreateRequest);
            return actionMessage;

        } else if (/* message.market &&*/ message.item) { // LISTINGITEM
            // get market
            // const marketModel = await this.marketService.findByAddress(message.market);
            // const market = marketModel.toJSON();

            // find the ListingItem
            // const listingItemModel = await this.listingItemService.findOneByHash(message.item.hash);
            // const listingItem = listingItemModel.toJSON();

            // TODO: hack
            const listingItemAddMessage = {
                action: ListingItemMessageType.MP_ITEM_ADD,
                item: listingItem.hash,
                objects: [{
                    id: 'seller',
                    value: event.smsgMessage.from
                }]
            } as ListingItemAddMessage;

            // create ActionMessage
            const actionMessageCreateRequest = await this.actionMessageFactory.getModel(listingItemAddMessage, listingItem.id, event.smsgMessage);
            // this.log.debug('process(), actionMessageCreateRequest:', JSON.stringify(actionMessageCreateRequest, null, 2));

            const actionMessage = await this.create(actionMessageCreateRequest);
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
