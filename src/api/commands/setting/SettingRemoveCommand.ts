// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MessageException } from '../../exceptions/MessageException';
import { SettingService } from '../../services/SettingService';
import { ProfileService } from '../../services/ProfileService';

export class SettingRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.SETTING_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: key
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<void> {
        const profileId = data.params[0];
        const key = data.params[1];
        return await this.settingService.destroyByKeyAndProfileId(key, profileId);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MessageException('Missing profileId.');
        }

        if (data.params.length < 2) {
            throw new MessageException('Missing key.');
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
        return this.getName() + ' <profileId> ' + ' <key> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>              - The ID of the profile, which setting it belongs to. '
            + '    <key>                    - key of the profile setting, which we want to remove. ';
    }

    public description(): string {
        return 'Remove and destroy setting via profile id and key.';
    }

    public example(): string {
        return 'setting ' + this.getName() + ' 1 key';
    }
}
