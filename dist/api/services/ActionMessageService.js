"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const _ = require("lodash");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const MessageException_1 = require("../exceptions/MessageException");
const NotImplementedException_1 = require("../exceptions/NotImplementedException");
const ActionMessageRepository_1 = require("../repositories/ActionMessageRepository");
const ActionMessageCreateRequest_1 = require("../requests/ActionMessageCreateRequest");
const ActionMessageUpdateRequest_1 = require("../requests/ActionMessageUpdateRequest");
const MessageInfoService_1 = require("./MessageInfoService");
const MessageEscrowService_1 = require("./MessageEscrowService");
const MessageDataService_1 = require("./MessageDataService");
const MessageObjectService_1 = require("./MessageObjectService");
const MarketService_1 = require("./MarketService");
const ActionMessageFactory_1 = require("../factories/ActionMessageFactory");
const ListingItemMessageType_1 = require("../enums/ListingItemMessageType");
let ActionMessageService = class ActionMessageService {
    constructor(messageInfoService, messageEscrowService, messageDataService, messageObjectService, marketService, actionMessageFactory, actionMessageRepo, Logger) {
        this.messageInfoService = messageInfoService;
        this.messageEscrowService = messageEscrowService;
        this.messageDataService = messageDataService;
        this.messageObjectService = messageObjectService;
        this.marketService = marketService;
        this.actionMessageFactory = actionMessageFactory;
        this.actionMessageRepo = actionMessageRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.actionMessageRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const actionMessage = yield this.actionMessageRepo.findOne(id, withRelated);
            if (actionMessage === null) {
                this.log.warn(`ActionMessage with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return actionMessage;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('create ActionMessage, body: ', JSON.stringify(body, null, 2));
            const messageInfoCreateRequest = body.info || {};
            const messageEscrowCreateRequest = body.escrow || {};
            const messageDataCreateRequest = body.data || {};
            const actionMessageObjects = body.objects || [];
            delete body.info;
            delete body.escrow;
            delete body.data;
            delete body.objects;
            // If the request body was valid we will create the actionMessage
            let actionMessageModel = yield this.actionMessageRepo.create(body);
            let actionMessage = actionMessageModel.toJSON();
            // this.log.debug('created actionMessage: ', JSON.stringify(actionMessage, null, 2));
            if (!_.isEmpty(messageInfoCreateRequest)) {
                messageInfoCreateRequest.action_message_id = actionMessage.id;
                const messageInfoModel = yield this.messageInfoService.create(messageInfoCreateRequest);
                const messageInfo = messageInfoModel.toJSON();
                // this.log.debug('created messageInfo: ', JSON.stringify(messageInfo, null, 2));
            }
            if (!_.isEmpty(messageEscrowCreateRequest)) {
                messageEscrowCreateRequest.action_message_id = actionMessage.id;
                const messageEscrowModel = yield this.messageEscrowService.create(messageEscrowCreateRequest);
                const messageEscrow = messageEscrowModel.toJSON();
                // this.log.debug('created messageEscrow: ', JSON.stringify(messageEscrow, null, 2));
            }
            // this.log.debug('messageDataCreateRequest: ', JSON.stringify(messageDataCreateRequest, null, 2));
            messageDataCreateRequest.action_message_id = actionMessage.id;
            const messageDataModel = yield this.messageDataService.create(messageDataCreateRequest);
            const messageData = messageDataModel.toJSON();
            // this.log.debug('created messageData: ', JSON.stringify(messageData, null, 2));
            // create messageobjects
            // this.log.debug('actionMessageObjects:', JSON.stringify(body, null, 2));
            for (const object of actionMessageObjects) {
                object.action_message_id = actionMessage.id;
                const messageObjectModel = yield this.messageObjectService.create(object);
                const messageObject = messageObjectModel.toJSON();
                // this.log.debug('created messageObject: ', JSON.stringify(messageObject, null, 2));
            }
            actionMessageModel = yield this.findOne(actionMessage.id);
            actionMessage = actionMessageModel.toJSON();
            // this.log.debug('created actionMessage: ', JSON.stringify(actionMessage, null, 2));
            return actionMessageModel;
        });
    }
    /**
     * save the received ActionMessage to the database
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<ActionMessage>}
     */
    createFromMarketplaceEvent(event, listingItem) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const message = event.marketplaceMessage;
            if (message.mpaction) {
                // get market
                // const marketModel = await this.marketService.findByAddress(message.market);
                // const market = marketModel.toJSON();
                // find the ListingItem
                // const listingItemModel = await this.listingItemService.findOneByHash(message.mpaction.item);
                // const listingItem = listingItemModel.toJSON();
                // create ActionMessage
                const actionMessageCreateRequest = yield this.actionMessageFactory.getModel(message.mpaction, listingItem.id, event.smsgMessage);
                // this.log.debug('process(), actionMessageCreateRequest:', JSON.stringify(actionMessageCreateRequest, null, 2));
                const actionMessage = yield this.create(actionMessageCreateRequest);
                return actionMessage;
            }
            else if (message.item) {
                // get market
                // const marketModel = await this.marketService.findByAddress(message.market);
                // const market = marketModel.toJSON();
                // find the ListingItem
                // const listingItemModel = await this.listingItemService.findOneByHash(message.item.hash);
                // const listingItem = listingItemModel.toJSON();
                // TODO: hack
                const listingItemAddMessage = {
                    action: ListingItemMessageType_1.ListingItemMessageType.MP_ITEM_ADD,
                    item: listingItem.hash,
                    objects: [{
                            id: 'seller',
                            value: event.smsgMessage.from
                        }]
                };
                // create ActionMessage
                const actionMessageCreateRequest = yield this.actionMessageFactory.getModel(listingItemAddMessage, listingItem.id, event.smsgMessage);
                // this.log.debug('process(), actionMessageCreateRequest:', JSON.stringify(actionMessageCreateRequest, null, 2));
                const actionMessage = yield this.create(actionMessageCreateRequest);
                return actionMessage;
            }
            else {
                throw new MessageException_1.MessageException('Marketplace message missing market.');
            }
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            throw new NotImplementedException_1.NotImplementedException();
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
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.actionMessageRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ActionMessageCreateRequest_1.ActionMessageCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ActionMessageCreateRequest_1.ActionMessageCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ActionMessageService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ActionMessageUpdateRequest_1.ActionMessageUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ActionMessageUpdateRequest_1.ActionMessageUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ActionMessageService.prototype, "update", null);
ActionMessageService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.MessageInfoService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.MessageEscrowService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.MessageDataService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.MessageObjectService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Factory.ActionMessageFactory)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(6, inversify_1.named(constants_1.Targets.Repository.ActionMessageRepository)),
    tslib_1.__param(7, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(7, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [MessageInfoService_1.MessageInfoService,
        MessageEscrowService_1.MessageEscrowService,
        MessageDataService_1.MessageDataService,
        MessageObjectService_1.MessageObjectService,
        MarketService_1.MarketService,
        ActionMessageFactory_1.ActionMessageFactory,
        ActionMessageRepository_1.ActionMessageRepository, Object])
], ActionMessageService);
exports.ActionMessageService = ActionMessageService;
//# sourceMappingURL=ActionMessageService.js.map