// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { TestDataService } from '../../services/TestDataService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class DataCleanCommand extends BaseCommand implements RpcCommandInterface<boolean> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.TestDataService) private testDataService: TestDataService
    ) {
        super(Commands.DATA_CLEAN);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: bootstrap, boolean
     *
     * @param {RpcRequest} data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute(@request(RpcRequest) data: RpcRequest): Promise<boolean> {
        await this.testDataService.clean(data.params[0]);

        return true;
    }

    /**
     * data.params[]:
     *  [0]: bootstrap, boolean, optional, default true, bootstraps the default data
     *
     * @param {RpcRequest} data
     * @returns {Promise<void>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (!_.isEmpty(data.params[0])) {
            data.params[0] = data.params[0] === true;
        }
        return data;
    }

    public usage(): string {
        return this.getName() + ' ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n';
    }

    public description(): string {
        return 'Cleans database, inserts default data.';
    }

    public example(): string {
        return 'data ' + this.getName();
    }
}
