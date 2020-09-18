// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { MessagingInformation } from '../models/MessagingInformation';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class MessagingInformationRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.MessagingInformation) public MessagingInformationModel: typeof MessagingInformation,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<MessagingInformation>> {
        const list = await this.MessagingInformationModel.fetchAll();
        return list as Bookshelf.Collection<MessagingInformation>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<MessagingInformation> {
        return this.MessagingInformationModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<MessagingInformation> {
        const messagingInformation = this.MessagingInformationModel.forge<MessagingInformation>(data);
        try {
            const messagingInformationCreated = await messagingInformation.save();
            return this.MessagingInformationModel.fetchById(messagingInformationCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the messagingInformation!', error);
        }
    }

    public async update(id: number, data: any): Promise<MessagingInformation> {
        const messagingInformation = this.MessagingInformationModel.forge<MessagingInformation>({ id });
        try {
            const messagingInformationUpdated = await messagingInformation.save(data, { patch: true });
            return this.MessagingInformationModel.fetchById(messagingInformationUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the messagingInformation!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let messagingInformation = this.MessagingInformationModel.forge<MessagingInformation>({ id });
        try {
            messagingInformation = await messagingInformation.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await messagingInformation.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the messagingInformation!', error);
        }
    }

}
