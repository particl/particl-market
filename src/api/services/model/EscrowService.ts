// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { Escrow } from '../../models/Escrow';
import { EscrowRepository } from '../../repositories/EscrowRepository';
import { EscrowCreateRequest } from '../../requests/model/EscrowCreateRequest';
import { EscrowUpdateRequest } from '../../requests/model/EscrowUpdateRequest';
import { EscrowRatioService } from './EscrowRatioService';
import { AddressService } from './AddressService';

export class EscrowService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.EscrowRepository) public escrowRepo: EscrowRepository,
        @inject(Types.Service) @named(Targets.Service.model.EscrowRatioService) public escrowRatioService: EscrowRatioService,
        @inject(Types.Service) @named(Targets.Service.model.AddressService) public addressService: AddressService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Escrow>> {
        return this.escrowRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Escrow> {
        const escrow = await this.escrowRepo.findOne(id, withRelated);
        if (escrow === null) {
            this.log.warn(`Escrow with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return escrow;
    }

    @validate()
    public async create( @request(EscrowCreateRequest) data: EscrowCreateRequest): Promise<Escrow> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('body: ', JSON.stringify(body, null, 2));

        const escrowRatio = body.ratio;
        delete body.ratio;

        // If the request body was valid we will create the escrow
        const escrow: resources.Escrow = await this.escrowRepo.create(body).then(value => value.toJSON());
        // this.log.debug('escrow, result:', JSON.stringify(escrow, null, 2));

        // create related models, escrowRatio
        if (!_.isEmpty(escrowRatio)) {
            escrowRatio.escrow_id = escrow.id;
            await this.escrowRatioService.create(escrowRatio);
        }

        // finally find and return the created escrow
        return await this.findOne(escrow.id);
    }

    @validate()
    public async update(id: number, @request(EscrowUpdateRequest) data: EscrowUpdateRequest): Promise<Escrow> {

        const body: EscrowUpdateRequest = JSON.parse(JSON.stringify(data));

        const escrow = await this.findOne(id, false);

        escrow.Type = body.type;
        escrow.SecondsToLock = body.secondsToLock;
        escrow.ReleaseType = body.releaseType;

        const updatedEscrow = await this.escrowRepo.update(id, escrow.toJSON());

        // find related escrowratio and update
        let relatedRatio = updatedEscrow.related('Ratio').toJSON();
        await this.escrowRatioService.destroy(relatedRatio.id);
        relatedRatio = body.ratio;
        relatedRatio.escrow_id = id;
        await this.escrowRatioService.create(relatedRatio);

        return await this.findOne(id);
    }

    public async destroy(id: number): Promise<void> {
        await this.escrowRepo.destroy(id);
    }

}
