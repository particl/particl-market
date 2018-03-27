import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { MessageInfo } from '../models/MessageInfo';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class MessageInfoRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.MessageInfo) public MessageInfoModel: typeof MessageInfo,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<MessageInfo>> {
        const list = await this.MessageInfoModel.fetchAll();
        return list as Bookshelf.Collection<MessageInfo>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<MessageInfo> {
        return this.MessageInfoModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<MessageInfo> {
        const messageInfo = this.MessageInfoModel.forge<MessageInfo>(data);
        try {
            const messageInfoCreated = await messageInfo.save();
            return this.MessageInfoModel.fetchById(messageInfoCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the messageInfo!', error);
        }
    }

    public async update(id: number, data: any): Promise<MessageInfo> {
        const messageInfo = this.MessageInfoModel.forge<MessageInfo>({ id });
        try {
            const messageInfoUpdated = await messageInfo.save(data, { patch: true });
            return this.MessageInfoModel.fetchById(messageInfoUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the messageInfo!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let messageInfo = this.MessageInfoModel.forge<MessageInfo>({ id });
        try {
            messageInfo = await messageInfo.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await messageInfo.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the messageInfo!', error);
        }
    }

}
