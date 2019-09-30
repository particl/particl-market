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
import { SettingValue } from '../../enums/SettingValue';
import { SettingService } from './SettingService';
import { MessageException } from '../../exceptions/MessageException';

export class IdentityService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.IdentityRepository) public identityRepository: IdentityRepository,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getDefaultForProfile(profileId: number, withRelated: boolean = true): Promise<Identity> {

        const profileSettings: resources.Setting[] = await this.settingService.findAllByProfileId(profileId).then(value => value.toJSON());

        const defaultIdentitySetting = _.find(profileSettings, value => {
            return value.key === SettingValue.DEFAULT_IDENTITY;
        });

        if (_.isEmpty(defaultIdentitySetting)) {
            this.log.error(new MessageException(SettingValue.DEFAULT_IDENTITY + ' not set.').getMessage());
            throw new MessageException(SettingValue.DEFAULT_IDENTITY + ' not set.');
        }

        this.log.debug('getDefaultForProfile(), defaultIdentitySetting: ', JSON.stringify(defaultIdentitySetting, null, 2));

        const identity: Identity = await this.identityRepository.findOne(+defaultIdentitySetting!.value, withRelated)
            .catch(reason => {
                this.log.error('Default Identity was not found!');
                throw new NotFoundException(defaultIdentitySetting!.value);
            });

        return identity;
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

    @validate()
    public async create( @request(IdentityCreateRequest) data: IdentityCreateRequest): Promise<Identity> {
        this.log.debug('create(): ', JSON.stringify(data, null, 2));
        const body = JSON.parse(JSON.stringify(data));
        return await this.identityRepository.create(body);
    }

    @validate()
    public async update(id: number, @request(IdentityUpdateRequest) body: IdentityUpdateRequest): Promise<Identity> {

        const identity = await this.findOne(id, false);
        identity.Wallet = body.wallet;
        identity.IdentitySpaddress = body.identitySpaddress;
        identity.EscrowSpaddress = body.escrowSpaddress;
        identity.TxfeeSpaddress = body.txfeeSpaddress;
        identity.WalletHdseedid = body.walletHdseedid;

        const updatedIdentity = await this.identityRepository.update(id, identity.toJSON());
        return updatedIdentity;
    }

    public async destroy(id: number): Promise<void> {
        await this.identityRepository.destroy(id);
    }

}
