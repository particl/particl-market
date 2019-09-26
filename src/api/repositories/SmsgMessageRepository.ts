// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { SmsgMessage } from '../models/SmsgMessage';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';
import { SmsgMessageSearchParams } from '../requests/search/SmsgMessageSearchParams';
import { ActionDirection } from '../enums/ActionDirection';
import { SmsgMessageCreateRequest } from '../requests/model/SmsgMessageCreateRequest';


export class SmsgMessageRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.SmsgMessage) public SmsgMessageModel: typeof SmsgMessage,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async searchBy(options: SmsgMessageSearchParams, withRelated: boolean = true): Promise<Bookshelf.Collection<SmsgMessage>> {
        return this.SmsgMessageModel.searchBy(options, withRelated);
    }

    public async findAll(): Promise<Bookshelf.Collection<SmsgMessage>> {
        const list = await this.SmsgMessageModel.fetchAll();
        return list as Bookshelf.Collection<SmsgMessage>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<SmsgMessage> {
        return this.SmsgMessageModel.fetchById(id, withRelated);
    }

    public async findLast(): Promise<SmsgMessage> {
        return await this.SmsgMessageModel.fetchLast();
    }

    public async findOneByMsgIdAndDirection(msgId: string,
                                            direction: ActionDirection = ActionDirection.INCOMING,
                                            withRelated: boolean = true): Promise<SmsgMessage> {
        return this.SmsgMessageModel.fetchByMsgIdAndDirection(msgId, direction, withRelated);
    }

    public async create(data: any): Promise<SmsgMessage> {
        const smsgMessage = this.SmsgMessageModel.forge<SmsgMessage>(data);
        try {
            const smsgMessageCreated = await smsgMessage.save();
            return this.SmsgMessageModel.fetchById(smsgMessageCreated.id);
        } catch (error) {
            this.log.error(JSON.stringify(error, null, 2));
            throw new DatabaseException('Could not create the smsgMessage!', error);
        }
    }

    /**
     * returns an array of message ids that were added to the DB
     *
     * @param datas
     */
    public async createAll(datas: SmsgMessageCreateRequest[]): Promise<string[]> {
        return await SmsgMessage.createAll(datas);
    }

    public async update(id: number, data: any): Promise<SmsgMessage> {
        const smsgMessage = this.SmsgMessageModel.forge<SmsgMessage>({ id });
        try {
            const smsgMessageUpdated = await smsgMessage.save(data, { patch: true });
            return this.SmsgMessageModel.fetchById(smsgMessageUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the smsgMessage!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let smsgMessage = this.SmsgMessageModel.forge<SmsgMessage>({ id });
        try {
            smsgMessage = await smsgMessage.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await smsgMessage.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the smsgMessage!', error);
        }
    }

}
