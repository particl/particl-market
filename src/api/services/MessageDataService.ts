import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageDataRepository } from '../repositories/MessageDataRepository';
import { MessageData } from '../models/MessageData';
import { MessageDataCreateRequest } from '../requests/MessageDataCreateRequest';
import { MessageDataUpdateRequest } from '../requests/MessageDataUpdateRequest';


export class MessageDataService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.MessageDataRepository) public messageDataRepo: MessageDataRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<MessageData>> {
        return this.messageDataRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<MessageData> {
        const messageData = await this.messageDataRepo.findOne(id, withRelated);
        if (messageData === null) {
            this.log.warn(`MessageData with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return messageData;
    }

    @validate()
    public async create( @request(MessageDataCreateRequest) body: any): Promise<MessageData> {

        // TODO: extract and remove related models from request
        // const messageDataRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the messageData
        const messageData = await this.messageDataRepo.create(body);

        // TODO: create related models
        // messageDataRelated._id = messageData.Id;
        // await this.messageDataRelatedService.create(messageDataRelated);

        // finally find and return the created messageData
        const newMessageData = await this.findOne(messageData.id);
        return newMessageData;
    }

    @validate()
    public async update(id: number, @request(MessageDataUpdateRequest) body: any): Promise<MessageData> {

        // find the existing one without related
        const messageData = await this.findOne(id, false);

        // set new values
        messageData.Msgid = body.msgid;
        messageData.Version = body.version;
        messageData.Received = body.received;
        messageData.Sent = body.sent;
        messageData.From = body.from;
        messageData.To = body.to;

        // update messageData record
        const updatedMessageData = await this.messageDataRepo.update(id, messageData.toJSON());

        // TODO: find related record and update it

        // TODO: finally find and return the updated messageData
        // const newMessageData = await this.findOne(id);
        // return newMessageData;

        return updatedMessageData;
    }

    public async destroy(id: number): Promise<void> {
        await this.messageDataRepo.destroy(id);
    }

}
