// Copyright (c) 2017-2019, The Particl Market developers
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
import { IdentityRepository } from '../../repositories/IdentityRepository';
import { Identity } from '../../models/Identity';
import { IdentityCreateRequest } from '../../requests/model/IdentityCreateRequest';
import { IdentityUpdateRequest } from '../../requests/model/IdentityUpdateRequest';
import { SettingService } from './SettingService';
import { IdentityType } from '../../enums/IdentityType';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ProfileService } from './ProfileService';

export class IdentityService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.IdentityRepository) public identityRepository: IdentityRepository,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Identity>> {
        return this.identityRepository.findAll();
    }

    public async findAllByProfileId(profileId: number, withRelated: boolean = true): Promise<Bookshelf.Collection<Identity>> {
        return await this.identityRepository.findAllByProfileId(profileId, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Identity> {
        const identity = await this.identityRepository.findOne(id, withRelated);
        if (identity === null) {
            this.log.warn(`Identity with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return identity;
    }

    public async findOneByWalletName(wallet: string, withRelated: boolean = true): Promise<Identity> {
        const identity = await this.identityRepository.findOneByWalletName(wallet, withRelated);
        if (identity === null) {
            this.log.warn(`Identity with the wallet=${wallet} was not found!`);
            throw new NotFoundException(wallet);
        }
        return identity;
    }

    public async findProfileIdentity(profileId: number, withRelated: boolean = true): Promise<Identity> {
        const profile: resources.Profile = await this.findOne(profileId, true).then(value => value.toJSON());
        const identity: resources.Identity | undefined = _.find(profile.Identities, p => {
            return p.type === IdentityType.PROFILE;
        });
        if (!identity) {
            this.log.warn(`Profile with the id=${profileId} has no Identity!`);
            throw new ModelNotFoundException('Identity');
        }
        return await this.identityRepository.findOne(identity.id, withRelated);
    }

    @validate()
    public async create( @request(IdentityCreateRequest) data: IdentityCreateRequest): Promise<Identity> {
        // this.log.debug('create(): ', JSON.stringify(data, null, 2));
        const body = JSON.parse(JSON.stringify(data));
        return await this.identityRepository.create(body);
    }

    @validate()
    public async update(id: number, @request(IdentityUpdateRequest) body: IdentityUpdateRequest): Promise<Identity> {

        const identity = await this.findOne(id, false);
        identity.Wallet = body.wallet;
        identity.Address = body.address;
        identity.Hdseedid = body.hdseedid;
        identity.Path = body.hdseedid;
        identity.Mnemonic = body.mnemonic;
        identity.Passphrase = body.passphrase;
        identity.Type = body.type;

        const updatedIdentity = await this.identityRepository.update(id, identity.toJSON());
        return updatedIdentity;
    }

    public async destroy(id: number): Promise<void> {
        await this.identityRepository.destroy(id);
    }

}
