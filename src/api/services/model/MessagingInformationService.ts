// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { ValidationException } from '../../exceptions/ValidationException';
import { MessagingInformationRepository } from '../../repositories/MessagingInformationRepository';
import { MessagingInformation } from '../../models/MessagingInformation';
import { MessagingInformationCreateRequest } from '../../requests/model/MessagingInformationCreateRequest';
import { MessagingInformationUpdateRequest } from '../../requests/model/MessagingInformationUpdateRequest';

export class MessagingInformationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.MessagingInformationRepository) public messagingInformationRepo: MessagingInformationRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<MessagingInformation>> {
        return this.messagingInformationRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<MessagingInformation> {
        const messagingInformation = await this.messagingInformationRepo.findOne(id, withRelated);
        if (messagingInformation === null) {
            this.log.warn(`MessagingInformation with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return messagingInformation;
    }

    @validate()
    public async create( @request(MessagingInformationCreateRequest) body: MessagingInformationCreateRequest): Promise<MessagingInformation> {
        // this.log.debug('messagingInformationService.create, body: ', JSON.stringify(body, null, 2));
        if (body.listing_item_id === undefined && body.listing_item_template_id === undefined) {
            throw new ValidationException('Request body is not valid', ['listing_item_id or listing_item_template_id missing']);
        }

        const messagingInformation = await this.messagingInformationRepo.create(body);
        return await this.findOne(messagingInformation.Id);
    }

    @validate()
    public async update(id: number, @request(MessagingInformationUpdateRequest) body: MessagingInformationUpdateRequest): Promise<MessagingInformation> {
        const messagingInformation = await this.findOne(id, false);
        messagingInformation.Protocol = body.protocol;
        messagingInformation.PublicKey = body.publicKey;
        return await this.messagingInformationRepo.update(id, messagingInformation.toJSON());
    }

    public async destroy(id: number): Promise<void> {
        await this.messagingInformationRepo.destroy(id);
    }

}
