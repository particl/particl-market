// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { SettingRepository } from '../repositories/SettingRepository';
import { Setting } from '../models/Setting';
import { SettingCreateRequest } from '../requests/SettingCreateRequest';
import { SettingUpdateRequest } from '../requests/SettingUpdateRequest';
import { ProfileService } from './ProfileService';

export class SettingService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Repository) @named(Targets.Repository.SettingRepository) public settingRepo: SettingRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Setting>> {
        return this.settingRepo.findAll();
    }

    public async findAllByProfileId(profileId: number, withRelated: boolean = true): Promise<Bookshelf.Collection<Setting>> {
        return await this.settingRepo.findAllByProfileId(profileId, withRelated);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Setting> {
        const setting = await this.settingRepo.findOne(id, withRelated);
        if (setting === null) {
            this.log.warn(`Setting with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return setting;
    }

    public async findOneByKeyAndProfileId(key: string, profileId: number): Promise<Setting> {
        const profileModel = await this.profileService.findOne(profileId);
        const profile = profileModel.toJSON();

        for (const setting of profile.Settings) {
            if (setting.key === key) {
                return setting;
            }
        }
        throw new NotFoundException(key);
    }


    @validate()
    public async setSetting(@request(SettingUpdateRequest) data: any): Promise<void> {
        // Create get request
        const profileId = data.params[0];
        const key = data.params[1];
        const settingGetRequest = {
            profileId,
            key
        } as SettingGetRequest;

        // Update setting
        const setting = await this.getSetting(settingGetRequest);
        await this.settingService.update(setting.id, data);
    }


    @validate()
    public async removeSetting(@request(SettingRemoveRequest) data: any): Promise<void> {
        // Create get request
        const profileId = data.params[0];
        const key = data.params[1];
        const settingGetRequest = {
            profileId,
            key
        } as SettingGetRequest;

        // Remove setting
        const setting = await this.getSetting(settingGetRequest);
        await this.settingService.destroy(setting.id);
    }

    @validate()
    public async create( @request(SettingCreateRequest) data: SettingCreateRequest): Promise<Setting> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create Setting, body: ', JSON.stringify(body, null, 2));

        const setting = await this.settingRepo.create(body);

        const newSetting = await this.findOne(setting.id);
        return newSetting;
    }

    @validate()
    public async update(id: number, @request(SettingUpdateRequest) body: SettingUpdateRequest): Promise<Setting> {
        const setting = await this.findOne(id, false);
        setting.Key = body.key;
        setting.Value = body.value;

        return await this.settingRepo.update(id, setting.toJSON());
    }

    public async destroy(id: number): Promise<void> {
        await this.settingRepo.destroy(id);
    }

}
