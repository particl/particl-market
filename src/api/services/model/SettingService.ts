// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { SettingRepository } from '../../repositories/SettingRepository';
import { Setting } from '../../models/Setting';
import { SettingCreateRequest } from '../../requests/model/SettingCreateRequest';
import { SettingUpdateRequest } from '../../requests/model/SettingUpdateRequest';

export class SettingService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.SettingRepository) public settingRepo: SettingRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Setting>> {
        return await this.settingRepo.findAll();
    }

    public async findAllByProfileId(profileId: number, withRelated: boolean = true): Promise<Bookshelf.Collection<Setting>> {
        return await this.settingRepo.findAllByProfileId(profileId, withRelated);
    }

    public async findAllByKeyAndProfileId(key: string, profileId: number, withRelated: boolean = true): Promise<Bookshelf.Collection<Setting>> {
        return await this.settingRepo.findAllByKeyAndProfileId(key, profileId, withRelated);
    }

    public async findAllByKey(key: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Setting>> {
        return await this.settingRepo.findAllByKey(key, withRelated);
    }

    public async findAllByProfileIdAndMarketId(profileId: number, marketId: number, withRelated: boolean = true): Promise<Bookshelf.Collection<Setting>> {
        return await this.settingRepo.findAllByProfileIdAndMarketId(profileId, marketId, withRelated);
    }

    public async findOneByKeyAndProfileIdAndMarketId(key: string, profileId: number, marketId: number, withRelated: boolean = true): Promise<Setting> {
        const setting = await this.settingRepo.findOneByKeyAndProfileIdAndMarketId(key, profileId, marketId, withRelated);
        if (setting === null) {
            this.log.warn(`Setting with the key=${key} was not found!`);
            throw new NotFoundException(key);
        }
        return setting;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Setting> {
        const setting = await this.settingRepo.findOne(id, withRelated);
        if (setting === null) {
            this.log.warn(`Setting with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return setting;
    }

    @validate()
    public async create( @request(SettingCreateRequest) data: SettingCreateRequest): Promise<Setting> {
        const body = JSON.parse(JSON.stringify(data));
        const setting = await this.settingRepo.create(body);
        return await this.findOne(setting.id);
    }

    // TODO: createOrUpdateProfileMarketSetting
    // TODO: createOrUpdateMarketSetting

    public async createOrUpdateProfileSetting(key: string, newValue: string, profileId: number): Promise<Setting> {
        return await this.findAllByKeyAndProfileId(key, profileId)
            .then(async values => {
                const foundSettings: resources.Setting[] = values.toJSON();
                const foundSetting = _.find(foundSettings, setting => {
                    return setting.key === key && setting.Profile.id === profileId && _.isEmpty(setting.Market);
                });

                if (foundSetting) {
                    const settingRequest = {
                        key,
                        value: newValue
                    } as SettingUpdateRequest;
                    return await this.update(foundSetting.id, settingRequest);
                } else {
                    const settingRequest = {
                        profile_id: profileId,
                        key,
                        value: newValue
                    } as SettingCreateRequest;
                    return await this.create(settingRequest);
                }
            });
    }

    @validate()
    public async update(id: number, @request(SettingUpdateRequest) body: SettingUpdateRequest): Promise<Setting> {

        // find the existing one without related
        const setting = await this.findOne(id, false);

        // set new values
        setting.Key = body.key;
        setting.Value = body.value;

        const updatedSetting = await this.settingRepo.update(id, setting.toJSON());
        return updatedSetting;
    }

    public async destroy(id: number): Promise<void> {
        await this.settingRepo.destroy(id);
    }

}
