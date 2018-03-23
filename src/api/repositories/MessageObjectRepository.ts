import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { MessageObject } from '../models/MessageObject';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class MessageObjectRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.MessageObject) public MessageObjectModel: typeof MessageObject,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<MessageObject>> {
        const list = await this.MessageObjectModel.fetchAll();
        return list as Bookshelf.Collection<MessageObject>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<MessageObject> {
        return this.MessageObjectModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<MessageObject> {
        const messageObject = this.MessageObjectModel.forge<MessageObject>(data);
        try {
            const messageObjectCreated = await messageObject.save();
            return this.MessageObjectModel.fetchById(messageObjectCreated.id);
        } catch (error) {
            this.log.debug('ERROR:', error);
            throw new DatabaseException('Could not create the messageObject!', error);
        }
    }

    public async update(id: number, data: any): Promise<MessageObject> {
        const messageObject = this.MessageObjectModel.forge<MessageObject>({ id });
        try {
            const messageObjectUpdated = await messageObject.save(data, { patch: true });
            return this.MessageObjectModel.fetchById(messageObjectUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the messageObject!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let messageObject = this.MessageObjectModel.forge<MessageObject>({ id });
        try {
            messageObject = await messageObject.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await messageObject.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the messageObject!', error);
        }
    }

}
