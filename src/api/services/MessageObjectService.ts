import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageObjectRepository } from '../repositories/MessageObjectRepository';
import { MessageObject } from '../models/MessageObject';
import { MessageObjectCreateRequest } from '../requests/MessageObjectCreateRequest';
import { MessageObjectUpdateRequest } from '../requests/MessageObjectUpdateRequest';


export class MessageObjectService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.MessageObjectRepository) public messageObjectRepo: MessageObjectRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<MessageObject>> {
        return this.messageObjectRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<MessageObject> {
        const messageObject = await this.messageObjectRepo.findOne(id, withRelated);
        if (messageObject === null) {
            this.log.warn(`MessageObject with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return messageObject;
    }

    @validate()
    public async create( @request(MessageObjectCreateRequest) body: any): Promise<MessageObject> {

        // TODO: extract and remove related models from request
        // const messageObjectRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the messageObject
        const messageObject = await this.messageObjectRepo.create(body);

        // TODO: create related models
        // messageObjectRelated._id = messageObject.Id;
        // await this.messageObjectRelatedService.create(messageObjectRelated);

        // finally find and return the created messageObject
        const newMessageObject = await this.findOne(messageObject.id);
        return newMessageObject;
    }

    @validate()
    public async update(id: number, @request(MessageObjectUpdateRequest) body: any): Promise<MessageObject> {

        // find the existing one without related
        const messageObject = await this.findOne(id, false);

        // set new values
        messageObject.DataId = body.dataId;
        messageObject.DataValue = body.dataValue;

        // update messageObject record
        const updatedMessageObject = await this.messageObjectRepo.update(id, messageObject.toJSON());

        // TODO: find related record and update it

        // TODO: finally find and return the updated messageObject
        // const newMessageObject = await this.findOne(id);
        // return newMessageObject;

        return updatedMessageObject;
    }

    public async destroy(id: number): Promise<void> {
        await this.messageObjectRepo.destroy(id);
    }

}
