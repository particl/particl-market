import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageEscrowRepository } from '../repositories/MessageEscrowRepository';
import { MessageEscrow } from '../models/MessageEscrow';
import { MessageEscrowCreateRequest } from '../requests/MessageEscrowCreateRequest';
import { MessageEscrowUpdateRequest } from '../requests/MessageEscrowUpdateRequest';
import {NotImplementedException} from '../exceptions/NotImplementedException';


export class MessageEscrowService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.MessageEscrowRepository) public messageEscrowRepo: MessageEscrowRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<MessageEscrow>> {
        return this.messageEscrowRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<MessageEscrow> {
        const messageEscrow = await this.messageEscrowRepo.findOne(id, withRelated);
        if (messageEscrow === null) {
            this.log.warn(`MessageEscrow with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return messageEscrow;
    }

    @validate()
    public async create( @request(MessageEscrowCreateRequest) data: MessageEscrowCreateRequest): Promise<MessageEscrow> {

        const body = JSON.parse(JSON.stringify(data));

        this.log.debug('messageescrow body:', JSON.stringify(body, null, 2));

        // If the request body was valid we will create the messageEscrow
        const messageEscrow = await this.messageEscrowRepo.create(body);

        // finally find and return the created messageEscrow
        const newMessageEscrow = await this.findOne(messageEscrow.id);
        return newMessageEscrow;
    }

    @validate()
    public async update(id: number, @request(MessageEscrowUpdateRequest) body: MessageEscrowUpdateRequest): Promise<MessageEscrow> {

        // find the existing one without related
        const messageEscrow = await this.findOne(id, false);

        // set new values
        messageEscrow.Type = body.type;
        messageEscrow.Rawtx = body.rawtx;

        // update messageEscrow record
        const updatedMessageEscrow = await this.messageEscrowRepo.update(id, messageEscrow.toJSON());

        const newMessageEscrow = await this.findOne(id);
        return newMessageEscrow;
    }

    public async destroy(id: number): Promise<void> {
        await this.messageEscrowRepo.destroy(id);
    }

}
