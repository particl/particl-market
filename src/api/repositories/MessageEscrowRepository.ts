import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { MessageEscrow } from '../models/MessageEscrow';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class MessageEscrowRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.MessageEscrow) public MessageEscrowModel: typeof MessageEscrow,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<MessageEscrow>> {
        const list = await this.MessageEscrowModel.fetchAll();
        return list as Bookshelf.Collection<MessageEscrow>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<MessageEscrow> {
        return this.MessageEscrowModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<MessageEscrow> {
        const messageEscrow = this.MessageEscrowModel.forge<MessageEscrow>(data);
        try {
            const messageEscrowCreated = await messageEscrow.save();
            return this.MessageEscrowModel.fetchById(messageEscrowCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the messageEscrow!', error);
        }
    }

    public async update(id: number, data: any): Promise<MessageEscrow> {
        const messageEscrow = this.MessageEscrowModel.forge<MessageEscrow>({ id });
        try {
            const messageEscrowUpdated = await messageEscrow.save(data, { patch: true });
            return this.MessageEscrowModel.fetchById(messageEscrowUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the messageEscrow!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let messageEscrow = this.MessageEscrowModel.forge<MessageEscrow>({ id });
        try {
            messageEscrow = await messageEscrow.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await messageEscrow.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the messageEscrow!', error);
        }
    }

}
