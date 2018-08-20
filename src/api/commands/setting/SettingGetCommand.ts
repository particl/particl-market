// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Setting } from '../../models/Setting';
import { SettingGetRequest } from '../../requests/SettingGetRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

export class SettingGetCommand extends BaseCommand implements RpcCommandInterface<Setting> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService
    ) {
        super(Commands.SETTING_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: key
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<Setting>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Setting> {
        const profileId = data.params[0];
        const key = data.params[1];

        if (!profileId) {
            throw new Error('No profileId for a command');
        }
        if (!key) {
            throw new Error('No key for a command');
        }

        return await this.profileService.getSetting({
            profileId,
            key
        } as SettingGetRequest);
    }

    public usage(): string {
        return this.getName() + ' [<profileId>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <profileId>              - Numeric - The ID of the related profile \n'
            + '    <key>                    - String - The key of the setting we want to fetch.';
    }

    public description(): string {
        return 'Get the setting with profileId and key.';
    }

    public example(): string {
        return 'setting ' + this.getName() + ' 1 key';
    }
}
