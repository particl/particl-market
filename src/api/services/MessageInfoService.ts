import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageInfoRepository } from '../repositories/MessageInfoRepository';
import { MessageInfo } from '../models/MessageInfo';
import { MessageInfoCreateRequest } from '../requests/MessageInfoCreateRequest';
import { MessageInfoUpdateRequest } from '../requests/MessageInfoUpdateRequest';


export class MessageInfoService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.MessageInfoRepository) public messageInfoRepo: MessageInfoRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<MessageInfo>> {
        return this.messageInfoRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<MessageInfo> {
        const messageInfo = await this.messageInfoRepo.findOne(id, withRelated);
        if (messageInfo === null) {
            this.log.warn(`MessageInfo with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return messageInfo;
    }

    @validate()
    public async create( @request(MessageInfoCreateRequest) body: any): Promise<MessageInfo> {

        // TODO: extract and remove related models from request
        // const messageInfoRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the messageInfo
        const messageInfo = await this.messageInfoRepo.create(body);

        // TODO: create related models
        // messageInfoRelated._id = messageInfo.Id;
        // await this.messageInfoRelatedService.create(messageInfoRelated);

        // finally find and return the created messageInfo
        const newMessageInfo = await this.findOne(messageInfo.id);
        return newMessageInfo;
    }

    @validate()
    public async update(id: number, @request(MessageInfoUpdateRequest) body: any): Promise<MessageInfo> {

        // find the existing one without related
        const messageInfo = await this.findOne(id, false);

        // set new values
        messageInfo.Address = body.address;
        messageInfo.Memo = body.memo;

        // update messageInfo record
        const updatedMessageInfo = await this.messageInfoRepo.update(id, messageInfo.toJSON());

        // TODO: find related record and update it

        // TODO: finally find and return the updated messageInfo
        // const newMessageInfo = await this.findOne(id);
        // return newMessageInfo;

        return updatedMessageInfo;
    }

    public async destroy(id: number): Promise<void> {
        await this.messageInfoRepo.destroy(id);
    }

}
