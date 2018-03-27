import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { MessageData } from '../models/MessageData';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class MessageDataRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.MessageData) public MessageDataModel: typeof MessageData,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<MessageData>> {
        const list = await this.MessageDataModel.fetchAll();
        return list as Bookshelf.Collection<MessageData>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<MessageData> {
        return this.MessageDataModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<MessageData> {
        const messageData = this.MessageDataModel.forge<MessageData>(data);
        try {
            const messageDataCreated = await messageData.save();
            return this.MessageDataModel.fetchById(messageDataCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the messageData!', error);
        }
    }

    public async update(id: number, data: any): Promise<MessageData> {
        const messageData = this.MessageDataModel.forge<MessageData>({ id });
        try {
            const messageDataUpdated = await messageData.save(data, { patch: true });
            return this.MessageDataModel.fetchById(messageDataUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the messageData!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let messageData = this.MessageDataModel.forge<MessageData>({ id });
        try {
            messageData = await messageData.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await messageData.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the messageData!', error);
        }
    }

}
