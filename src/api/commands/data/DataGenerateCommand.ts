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
import { TestDataGenerateRequest } from '../../requests/testdata/TestDataGenerateRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { CreatableModel } from '../../enums/CreatableModel';
import { EnumHelper } from '../../../core/helpers/EnumHelper';

export class DataGenerateCommand extends BaseCommand implements RpcCommandInterface<any> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.TestDataService) private testDataService: TestDataService
    ) {
        super(Commands.DATA_GENERATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: CreatableModel, model to generate
     *  [1]: amount
     *  [2]: withRelated, return full objects or just id's
     *  [3...]: generateParams
     *
     * @param {RpcRequest} data
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<any> {
        this.log.info('data.params[0]: ', data.params[0]);
        this.log.info('data.params[1]: ', data.params[1]);
        const generateParams = data.params.length > 3 ? _.slice(data.params, 3) : [];

        return await this.testDataService.generate({
            model: data.params[0],
            amount: data.params[1],
            withRelated: data.params[2],
            generateParams
        } as TestDataGenerateRequest);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        this.log.info('data.params[]: ', JSON.stringify(data.params, null, 2));

        if (data.params.length < 1) {
            throw new MissingParamException('model');
        } else if (data.params.length < 2) {
            throw new MissingParamException('amount');
        } else if (data.params.length < 3) {
            throw new MissingParamException('withRelated');
        }

        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('model', 'string');
        } else if (typeof data.params[1] !== 'number' || data.params[1] < 1) {
            throw new InvalidParamException('amount', 'number');
        } else if (data.params.length > 2 && typeof data.params[2] !== 'boolean') {
            throw new InvalidParamException('withRelated', 'boolean');
        }

        if (!EnumHelper.containsValue(CreatableModel, data.params[0])) {
            throw new InvalidParamException('model', 'CreatableModel');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <model> <amount> [<withRelated>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <model>                  - ENUM{listingitemtemplate|listingitem|profile|itemcategory \n'
            + '                                |favoriteitem|iteminformation|bid|paymentinformation|itemimage} \n'
            + '                                - The type of data we want to generate. \n'
            + '    <amount>                 - Numeric - The number of objects we want to generate. \n'
            + '    <withRelated>            - Boolean - Whether to return full objects or just id. ';
    }

    public description(): string {
        return 'Autogenerates data for the database.';
    }

    public example(): string {
        return 'data ' + this.getName() + ' profile 1 true';
    }
}
