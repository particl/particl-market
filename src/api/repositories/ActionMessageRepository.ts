import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ActionMessage } from '../models/ActionMessage';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ActionMessageRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ActionMessage) public ActionMessageModel: typeof ActionMessage,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ActionMessage>> {
        const list = await this.ActionMessageModel.fetchAll();
        return list as Bookshelf.Collection<ActionMessage>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ActionMessage> {
        return this.ActionMessageModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<ActionMessage> {
        const actionMessage = this.ActionMessageModel.forge<ActionMessage>(data);
        try {
            const actionMessageCreated = await actionMessage.save();
            return this.ActionMessageModel.fetchById(actionMessageCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the actionMessage!', error);
        }
    }

    public async update(id: number, data: any): Promise<ActionMessage> {
        const actionMessage = this.ActionMessageModel.forge<ActionMessage>({ id });
        try {
            const actionMessageUpdated = await actionMessage.save(data, { patch: true });
            return this.ActionMessageModel.fetchById(actionMessageUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the actionMessage!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let actionMessage = this.ActionMessageModel.forge<ActionMessage>({ id });
        try {
            actionMessage = await actionMessage.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await actionMessage.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the actionMessage!', error);
        }
    }

}
