// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Setting } from '../../models/Setting';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { SettingUpdateRequest } from '../../requests/SettingUpdateRequest';

export class SettingSetCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.SettingService) private profileService: ProfileService
    ) {
        super(Commands.MARKET_ADD);
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
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<void> {
        return await this.profileService.removeSetting({
            profileId : data.params[0],
            key : data.params[1],
            value : data.params[2]
        } as SettingUpdateRequest);
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
