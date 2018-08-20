// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { SettingRemoveRequest } from '../../requests/SettingRemoveRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ProfileService } from '../../services/ProfileService';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

export class SettingRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService
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

        if (!profileId) {
            throw new Error('No profile_id for a command');
        }
        if (!key) {
            throw new Error('No key for a command');

        }

        return await this.profileService.removeSetting({
            profileId,
            key
        } as SettingRemoveRequest);
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
