// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { SettingService } from '../../services/model/SettingService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class SettingRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService
    ) {
        super(Commands.SETTING_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: setting: resources.Setting
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<void> {
        const setting = data.params[0];
        return this.settingService.destroy(setting.id);
    }

    /**
     * data.params[]:
     *  [0]: settingId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('settingId');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('settingId', 'number');
        }

        // make sure Setting with the id exists
        const setting: resources.Setting = await this.settingService.findOne(data.params[0])
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('Setting');
            });
        data.params[0] = setting;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <settingId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <settingId>              - The ID of the Setting. ';
    }

    public description(): string {
        return 'Remove a Setting.';
    }

    public example(): string {
        return 'setting ' + this.getName() + ' 1';
    }
}
