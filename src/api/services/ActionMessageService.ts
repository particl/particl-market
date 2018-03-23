import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ActionMessageRepository } from '../repositories/ActionMessageRepository';
import { ActionMessage } from '../models/ActionMessage';
import { ActionMessageCreateRequest } from '../requests/ActionMessageCreateRequest';
import { ActionMessageUpdateRequest } from '../requests/ActionMessageUpdateRequest';


export class ActionMessageService {

    public log: LoggerType;

    constructor(
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
    public async create( @request(ActionMessageCreateRequest) body: any): Promise<ActionMessage> {

        // TODO: extract and remove related models from request
        // const actionMessageRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the actionMessage
        const actionMessage = await this.actionMessageRepo.create(body);

        // TODO: create related models
        // actionMessageRelated._id = actionMessage.Id;
        // await this.actionMessageRelatedService.create(actionMessageRelated);

        // finally find and return the created actionMessage
        const newActionMessage = await this.findOne(actionMessage.id);
        return newActionMessage;
    }

    @validate()
    public async update(id: number, @request(ActionMessageUpdateRequest) body: any): Promise<ActionMessage> {

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
    }

    public async destroy(id: number): Promise<void> {
        await this.actionMessageRepo.destroy(id);
    }

}
