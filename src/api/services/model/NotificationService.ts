import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { NotificationRepository } from '../../repositories/NotificationRepository';
import { Notification } from '../../models/Notification';
import { NotificationCreateRequest } from '../../requests/model/NotificationCreateRequest';
import { NotificationUpdateRequest } from '../../requests/model/NotificationUpdateRequest';
import { NotificationSearchParams } from '../../requests/search/NotificationSearchParams';


export class NotificationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.NotificationRepository) public notificationRepo: NotificationRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Notification>> {
        return this.notificationRepo.findAll();
    }

    public async findAllByProfileId(profileId: number | undefined, withRelated: boolean = true): Promise<Bookshelf.Collection<Notification>> {
        return await this.notificationRepo.findAllByProfileId(profileId, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Notification> {
        const notification = await this.notificationRepo.findOne(id, withRelated);
        if (notification === null) {
            this.log.warn(`Notification with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return notification;
    }

    @validate()
    public async search(@request(NotificationSearchParams) options: NotificationSearchParams,
                        withRelated: boolean = true): Promise<Bookshelf.Collection<Notification>> {
        return await this.notificationRepo.search(options, withRelated);
    }

    @validate()
    public async create( @request(NotificationCreateRequest) data: NotificationCreateRequest): Promise<Notification> {
        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create Notification, body: ', JSON.stringify(body, null, 2));

        const notification = await this.notificationRepo.create(body);
        return await this.findOne(notification.id);
    }

    @validate()
    public async update(id: number, @request(NotificationUpdateRequest) body: NotificationUpdateRequest): Promise<Notification> {
        const notification = await this.findOne(id, false);
        notification.Type = body.type;
        notification.ObjectId = body.objectId;
        notification.ObjectHash = body.objectHash;
        if (!_.isEmpty(body.parentObjectId)) {
            notification.ParentObjectId = body.parentObjectId;
        }

        if (!_.isEmpty(body.parentObjectHash)) {
            notification.ParentObjectHash = body.parentObjectHash;
        }
        if (!_.isEmpty(body.target)) {
            notification.Target = body.target;
        }
        if (!_.isEmpty(body.from)) {
            notification.From = body.from;
        }
        if (!_.isEmpty(body.to)) {
            notification.To = body.to;
        }
        if (!_.isEmpty(body.market)) {
            notification.Market = body.market;
        }
        if (!_.isEmpty(body.category)) {
            notification.Category = body.category;
        }
        if (!_.isEmpty(body.read)) {
            notification.Read = body.read;
        }

        return await this.notificationRepo.update(id, notification.toJSON());
    }

    public async setRead(id: number, read: boolean): Promise<Notification> {
        return await this.notificationRepo.update(id, {
            read
        } as NotificationUpdateRequest);
    }

    public async destroy(id: number): Promise<void> {
        await this.notificationRepo.destroy(id);
    }

}
