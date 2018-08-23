import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { SmsgMessageRepository } from '../repositories/SmsgMessageRepository';
import { SmsgMessage } from '../models/SmsgMessage';
import { SmsgMessageCreateRequest } from '../requests/SmsgMessageCreateRequest';
import { SmsgMessageUpdateRequest } from '../requests/SmsgMessageUpdateRequest';
import { SmsgMessageSearchParams } from '../requests/SmsgMessageSearchParams';

export class SmsgMessageService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.SmsgMessageRepository) public smsgMessageRepo: SmsgMessageRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async searchBy(options: SmsgMessageSearchParams, withRelated: boolean = true): Promise<Bookshelf.Collection<SmsgMessage>> {
        const result = await this.smsgMessageRepo.searchBy(options, withRelated);
        // this.log.debug('searchBy, result: ', JSON.stringify(result.toJSON(), null, 2));
        return result;
    }

    public async findAll(): Promise<Bookshelf.Collection<SmsgMessage>> {
        return this.smsgMessageRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<SmsgMessage> {
        const smsgMessage = await this.smsgMessageRepo.findOne(id, withRelated);
        if (smsgMessage === null) {
            this.log.warn(`SmsgMessage with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return smsgMessage;
    }

    public async findOneByMsgId(msgId: string, withRelated: boolean = true): Promise<SmsgMessage> {
        const smsgMessage = await this.smsgMessageRepo.findOneByMsgId(msgId, withRelated);
        if (smsgMessage === null) {
            this.log.warn(`SmsgMessage with the msgid=${msgId} was not found!`);
            throw new NotFoundException(msgId);
        }
        return smsgMessage;
    }

    @validate()
    public async create( @request(SmsgMessageCreateRequest) data: SmsgMessageCreateRequest): Promise<SmsgMessage> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create SmsgMessage, body: ', JSON.stringify(body, null, 2));

        // If the request body was valid we will create the smsgMessage
        const smsgMessage = await this.smsgMessageRepo.create(body);

        // finally find and return the created smsgMessage
        const newSmsgMessage = await this.findOne(smsgMessage.id);
        return newSmsgMessage;
    }

    @validate()
    public async update(id: number, @request(SmsgMessageUpdateRequest) body: SmsgMessageUpdateRequest): Promise<SmsgMessage> {

        // find the existing one without related
        const smsgMessage = await this.findOne(id, false);

        // set new values
        smsgMessage.Type = body.type;
        smsgMessage.Status = body.status;
        smsgMessage.Msgid = body.msgid;
        smsgMessage.Version = body.version;
        smsgMessage.Received = body.received;
        smsgMessage.Sent = body.sent;
        smsgMessage.Expiration = body.expiration;
        smsgMessage.Daysretention = body.daysretention;
        smsgMessage.From = body.from;
        smsgMessage.To = body.to;
        smsgMessage.Text = body.text;

        // update smsgMessage record
        const updatedSmsgMessage = await this.smsgMessageRepo.update(id, smsgMessage.toJSON());

        // const newSmsgMessage = await this.findOne(id);
        // return newSmsgMessage;

        return updatedSmsgMessage;
    }

    public async destroy(id: number): Promise<void> {
        await this.smsgMessageRepo.destroy(id);
    }

}
