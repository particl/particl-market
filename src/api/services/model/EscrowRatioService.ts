// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { EscrowRatioRepository } from '../../repositories/EscrowRatioRepository';
import { EscrowRatio } from '../../models/EscrowRatio';
import { EscrowRatioCreateRequest } from '../../requests/model/EscrowRatioCreateRequest';
import { EscrowRatioUpdateRequest } from '../../requests/model/EscrowRatioUpdateRequest';

export class EscrowRatioService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.EscrowRatioRepository) public escrowRatioRepo: EscrowRatioRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<EscrowRatio>> {
        return this.escrowRatioRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<EscrowRatio> {
        const escrowRatio = await this.escrowRatioRepo.findOne(id, withRelated);
        if (escrowRatio === null) {
            this.log.warn(`EscrowRatio with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return escrowRatio;
    }

    @validate()
    public async create( @request(EscrowRatioCreateRequest) body: EscrowRatioCreateRequest): Promise<EscrowRatio> {
        const escrowRatio = await this.escrowRatioRepo.create(body);
        return await this.findOne(escrowRatio.Id);
    }

    @validate()
    public async update(id: number, @request(EscrowRatioUpdateRequest) body: EscrowRatioUpdateRequest): Promise<EscrowRatio> {
        const escrowRatio = await this.findOne(id, false);
        escrowRatio.Buyer = body.buyer;
        escrowRatio.Seller = body.seller;
        return await this.escrowRatioRepo.update(id, escrowRatio.toJSON());
    }

    public async destroy(id: number): Promise<void> {
        await this.escrowRatioRepo.destroy(id);
    }
}
