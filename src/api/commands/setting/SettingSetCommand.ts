// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Setting } from '../../models/Setting';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { SettingUpdateRequest } from '../../requests/SettingUpdateRequest';
import { SettingService } from '../../services/model/SettingService';
import { MessageException } from '../../exceptions/MessageException';
import { SettingCreateRequest } from '../../requests/SettingCreateRequest';
import { ProfileService } from '../../services/model/ProfileService';

export class SettingSetCommand extends BaseCommand implements RpcCommandInterface<Setting> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) private settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.SETTING_SET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: key
     *  [2]: value
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Setting> {
        const profileId = data.params[0];
        const key = data.params[1];
        const settingModel = await this.settingService.findOneByKeyAndProfileId(key, profileId)
            .then(async value => {
                return value;
            })
            .catch(async reason => {
                return null;
            });

        if (settingModel) {
            // found -> update
            const setting = settingModel.toJSON();
            return await this.settingService.update(setting.id, {
                key: data.params[1],
                value: data.params[2]
            } as SettingUpdateRequest);

        } else {
            // not found -> create
            return await this.settingService.create({
                profile_id: data.params[0],
                key: data.params[1],
                value: data.params[2]
            } as SettingCreateRequest);

        }

    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: key
     *  [2]: value
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MessageException('Missing profileId.');
        }

        if (data.params.length < 2) {
            throw new MessageException('Missing key.');
        }

        if (data.params.length < 3) {
            throw new MessageException('Missing value.');
        }

        const profileId = data.params[0];
        if (profileId && typeof profileId === 'string') {
            throw new MessageException('profileId cant be a string.');
        } else {
            // make sure Profile with the id exists
            await this.profileService.findOne(profileId) // throws if not found
                .catch(reason => {
                    throw new MessageException('Profile not found.');
                });
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
