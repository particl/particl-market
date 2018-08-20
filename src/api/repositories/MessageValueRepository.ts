import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { MessageValue } from '../models/MessageValue';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class MessageValueRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.MessageValue) public MessageValueModel: typeof MessageValue,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<MessageValue>> {
        const list = await this.MessageValueModel.fetchAll();
        return list as Bookshelf.Collection<MessageValue>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<MessageValue> {
        return this.MessageValueModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<MessageValue> {
        const messageValue = this.MessageValueModel.forge<MessageValue>(data);
        try {
            const messageValueCreated = await messageValue.save();
            return this.MessageValueModel.fetchById(messageValueCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the messageValue!', error);
        }
    }

    public async update(id: number, data: any): Promise<MessageValue> {
        const messageValue = this.MessageValueModel.forge<MessageValue>({ id });
        try {
            const messageValueUpdated = await messageValue.save(data, { patch: true });
            return this.MessageValueModel.fetchById(messageValueUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the messageValue!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let messageValue = this.MessageValueModel.forge<MessageValue>({ id });
        try {
            messageValue = await messageValue.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await messageValue.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the messageValue!', error);
        }
    }

}
