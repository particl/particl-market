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


export class SettingService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.SettingRepository) public settingRepo: SettingRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Setting>> {
        return this.settingRepo.findAll();
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
