// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProfileService } from '../../services/ProfileService';
import { SettingService } from '../../services/SettingService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Setting } from '../../models/Setting';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MessageException } from '../../exceptions/MessageException';
import { SettingUpdateRequest } from '../../requests/SettingUpdateRequest';
import { SettingCreateRequest } from '../../requests/SettingCreateRequest';
import { SettingGetRequest } from '../../requests/SettingGetRequest';

export class SettingSetCommand extends BaseCommand implements RpcCommandInterface<Setting> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.SettingService) private settingService: SettingService
    ) {
        super(Commands.SETTING_SET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile id
     *  [1]: key
     *  [2]: value
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Setting>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Setting> {
        // validate params
        data = await this.validate(data);
        // fetch if setting exist
        const setting = await this.profileService.getSetting({
            profileId: data.params[0],
            key: data.params[1]
        } as SettingGetRequest);
        // add new setting
        if (!setting) {
            return await this.settingService.create({
                profileId: data.params[0],
                key: data.params[1],
                value: data.params[2]
            } as SettingCreateRequest);
        }
        return await this.profileService.setSetting({
            profileId: data.params[0],
            key: data.params[1],
            value: data.params[2]
        } as SettingUpdateRequest);
    }

    public async validate( @request(RpcRequest) data: RpcRequest): Promise<RpcRequest> {
        for (const param of data.params) {
           if (!param) {
               throw new MessageException('Missing params!');
           }
        }
        return data;
    }


    public usage(): string {
        return this.getName() + ' <profileId> <key> <value> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <profileId>              - Numeric - The ID of the related profile \n'
            + '    <key>                    - String - The key of the setting we want to fetch. \n'
            + '    <value>                  - String - The value of the setting we want to set.';
    }

    public description(): string {
        return 'Set setting with key from a profile with profileId.';
    }

    public example(): string {
        return 'setting ' + this.getName() + ' setting set 1 key value';
    }
}
