// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Notification } from '../models/Notification';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';
import { NotificationSearchParams } from '../requests/search/NotificationSearchParams';


export class NotificationRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Notification) public NotificationModel: typeof Notification,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Notification>> {
        const list = await this.NotificationModel.fetchAll();
        return list as Bookshelf.Collection<Notification>;
    }

    public async findAllByProfileId(id: number | undefined, withRelated: boolean = true): Promise<Bookshelf.Collection<Notification>> {
        return await this.NotificationModel.fetchAllByProfileId(id, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Notification> {
        return await this.NotificationModel.fetchById(id, withRelated);
    }

    public async search(options: NotificationSearchParams, withRelated: boolean): Promise<Bookshelf.Collection<Notification>> {
        return this.NotificationModel.searchBy(options, withRelated);
    }

    public async create(data: any): Promise<Notification> {
        const notification = this.NotificationModel.forge<Notification>(data);
        try {
            const notificationCreated = await notification.save();
            return await this.NotificationModel.fetchById(notificationCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the notification!', error);
        }
    }

    public async update(id: number, data: any): Promise<Notification> {
        const notification = this.NotificationModel.forge<Notification>({ id });
        try {
            const notificationUpdated = await notification.save(data, { patch: true });
            return await this.NotificationModel.fetchById(notificationUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the notification!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let notification = this.NotificationModel.forge<Notification>({ id });
        try {
            notification = await notification.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await notification.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the notification!', error);
        }
    }

}
