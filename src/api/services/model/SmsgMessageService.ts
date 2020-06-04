// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { SmsgMessageRepository } from '../../repositories/SmsgMessageRepository';
import { SmsgMessage } from '../../models/SmsgMessage';
import { SmsgMessageCreateRequest } from '../../requests/model/SmsgMessageCreateRequest';
import { SmsgMessageUpdateRequest } from '../../requests/model/SmsgMessageUpdateRequest';
import { SmsgMessageSearchParams } from '../../requests/search/SmsgMessageSearchParams';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { ActionDirection } from '../../enums/ActionDirection';
import { MessageException } from '../../exceptions/MessageException';

export class SmsgMessageService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.SmsgMessageRepository) public smsgMessageRepo: SmsgMessageRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async searchBy(options: SmsgMessageSearchParams, withRelated: boolean = true): Promise<Bookshelf.Collection<SmsgMessage>> {
        const result = await this.smsgMessageRepo.searchBy(options, withRelated);
        // this.log.debug('searchBy, result: ', JSON.stringify(result.toJSON(), null, 2));
        return result;
    }

    public async findAll(): Promise<Bookshelf.Collection<SmsgMessage>> {
        return this.smsgMessageRepo.findAll();
    }

    public async findLast(): Promise<SmsgMessage> {
        const smsgMessage = await this.smsgMessageRepo.findLast();
        // this.log.debug('findLast(), smsgMessage:', JSON.stringify(smsgMessage, null, 2));
        if (!smsgMessage) {
            this.log.warn(`SmsgMessage not found!`);
            throw new MessageException('SmsgMessage not found.');
        }
        return smsgMessage;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<SmsgMessage> {
        const smsgMessage = await this.smsgMessageRepo.findOne(id, withRelated);
        if (smsgMessage === null) {
            this.log.warn(`SmsgMessage with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return smsgMessage;
    }

    public async findOneByMsgId(msgId: string, direction: ActionDirection = ActionDirection.BOTH, withRelated: boolean = true): Promise<SmsgMessage> {
        let smsgMessage;
        if (direction === ActionDirection.BOTH) {
            smsgMessage = await this.smsgMessageRepo.findOneByMsgIdAndDirection(msgId, ActionDirection.INCOMING, withRelated);
            if (smsgMessage === null) {
                smsgMessage = await this.smsgMessageRepo.findOneByMsgIdAndDirection(msgId, ActionDirection.OUTGOING, withRelated);
                if (smsgMessage === null) {
                    this.log.warn(`SmsgMessage with the msgid=${msgId} was not found!`);
                    throw new NotFoundException(msgId);
                }
            }
        } else {
            smsgMessage = await this.smsgMessageRepo.findOneByMsgIdAndDirection(msgId, direction, withRelated);
            if (smsgMessage === null) {
                this.log.warn(`SmsgMessage with the msgid=${msgId} and direction=${direction} was not found!`);
                throw new NotFoundException(msgId);
            }
        }
        return smsgMessage;
    }

    @validate()
    public async create( @request(SmsgMessageCreateRequest) data: SmsgMessageCreateRequest): Promise<SmsgMessage> {
        const body = JSON.parse(JSON.stringify(data));
        const smsgMessage = await this.smsgMessageRepo.create(body);
        return await this.findOne(smsgMessage.id);
    }

    public async createAll(datas: SmsgMessageCreateRequest[]): Promise<string[]> {
        return await this.smsgMessageRepo.createAll(datas);
    }

    @validate()
    public async update(id: number, @request(SmsgMessageUpdateRequest) body: SmsgMessageUpdateRequest): Promise<SmsgMessage> {

        const smsgMessage = await this.findOne(id, false);

        smsgMessage.Type = body.type;
        smsgMessage.Status = body.status;
        smsgMessage.Direction = body.direction;
        smsgMessage.Target = body.target;
        smsgMessage.Msgid = body.msgid;
        smsgMessage.Version = body.version;
        smsgMessage.Read = body.read;
        smsgMessage.Paid = body.paid;
        smsgMessage.Payloadsize = body.payloadsize;
        smsgMessage.Received = body.received;
        smsgMessage.Sent = body.sent;
        smsgMessage.Expiration = body.expiration;
        smsgMessage.Daysretention = body.daysretention;
        smsgMessage.From = body.from;
        smsgMessage.To = body.to;
        smsgMessage.Text = body.text;
        smsgMessage.ProcessedCount = body.processedCount;
        smsgMessage.ProcessedAt = body.processedAt;

        return await this.smsgMessageRepo.update(id, smsgMessage.toJSON());
    }

    /**
     * update the processed count and time
     *
     * @param id
     * @param {SmsgMessageStatus} status
     * @returns {Promise<module:resources.SmsgMessage>}
     */
    public async updateProcessedCount(id: number): Promise<SmsgMessage> {
        const smsgMessage = await this.findOne(id, false);
        smsgMessage.set('processed_at', Date.now());
        smsgMessage.set('processed_count', smsgMessage.ProcessedCount + 1);
        await this.smsgMessageRepo.update(id, smsgMessage.toJSON());
        return await this.findOne(id);
    }

    /**
     * update the status of the message
     *
     * @param id
     * @param {SmsgMessageStatus} status
     * @returns {Promise<module:resources.SmsgMessage>}
     */
    public async updateStatus(id: number, status: SmsgMessageStatus): Promise<SmsgMessage> {
        const smsgMessage = await this.findOne(id, false);
        smsgMessage.set('status', status);
        await this.smsgMessageRepo.update(id, smsgMessage.toJSON());
        return await this.findOne(id);
    }

    public async destroy(id: number): Promise<void> {
        await this.smsgMessageRepo.destroy(id);
    }

}
