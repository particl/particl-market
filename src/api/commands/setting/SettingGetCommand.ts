// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { SettingService } from '../../services/SettingService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Setting } from '../../models/Setting';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MessageException } from '../../exceptions/MessageException';

export class SettingGetCommand extends BaseCommand implements RpcCommandInterface<Setting> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.SettingService) public settingService: SettingService
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
        return await this.settingService.findOneByKeyAndProfileId(key, profileId);
    }

    /**
     * data.params[]:
     *  [0]: profileId
     *  [1]: key
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 2) {
            throw new MessageException('Missing params.');
        }
        return data;
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
