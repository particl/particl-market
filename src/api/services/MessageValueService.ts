import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageValueRepository } from '../repositories/MessageValueRepository';
import { MessageValue } from '../models/MessageValue';
import { MessageValueCreateRequest } from '../requests/MessageValueCreateRequest';
import { MessageValueUpdateRequest } from '../requests/MessageValueUpdateRequest';


export class MessageValueService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.MessageValueRepository) public messageValueRepo: MessageValueRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<MessageValue>> {
        return this.messageValueRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<MessageValue> {
        const messageValue = await this.messageValueRepo.findOne(id, withRelated);
        if (messageValue === null) {
            this.log.warn(`MessageValue with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return messageValue;
    }

    @validate()
    public async create( @request(MessageValueCreateRequest) data: MessageValueCreateRequest): Promise<MessageValue> {

        const body = JSON.parse(JSON.stringify(data));
        this.log.debug('create MessageValue, key: '+ body.key + ', value: ' + body.value);

        // If the request body was valid we will create the messageValue
        const messageValue = await this.messageValueRepo.create(body);

        // finally find and return the created messageValue
        const newMessageValue = await this.findOne(messageValue.id);
        return newMessageValue;
    }

    @validate()
    public async update(id: number, @request(MessageValueUpdateRequest) body: MessageValueUpdateRequest): Promise<MessageValue> {

        // find the existing one without related
        const messageValue = await this.findOne(id, false);

        // set new values
        messageValue.Key = body.key;
        messageValue.Value = body.value;

        // update messageValue record
        const updatedMessageValue = await this.messageValueRepo.update(id, messageValue.toJSON());
        return updatedMessageValue;
    }

    public async destroy(id: number): Promise<void> {
        await this.messageValueRepo.destroy(id);
    }

}
