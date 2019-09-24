// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { TestDataService } from '../../services/TestDataService';
import { TestDataCreateRequest } from '../../requests/testdata/TestDataCreateRequest';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { CreatableModel } from '../../enums/CreatableModel';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { EnumHelper } from '../../../core/helpers/EnumHelper';

export class DataAddCommand extends BaseCommand implements RpcCommandInterface<any> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.TestDataService) private testDataService: TestDataService
    ) {
        super(Commands.DATA_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: CreatableModel, model to generate
     *  [1]: json
     *  [2]: withRelated, return full objects or just id's
     *
     * @param data
     * @param rpcCommandFactory
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        const withRelated = data.params[2] ? data.params[2] : true;
        return await this.testDataService.create({
            model: data.params[0],
            data: JSON.parse(data.params[1]),
            withRelated
        } as TestDataCreateRequest);
    }

    /**
     * data.params[]:
     *  [0]: CreatableModel, model to generate
     *  [1]: json
     *  [2]: withRelated, return full objects or just id's
     *
     * @param data
     * @param rpcCommandFactory
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        this.log.debug('data.params: ', JSON.stringify(data.params, null, 2));
        if (data.params.length < 1) {
            throw new MissingParamException('model');
        } else if (data.params.length < 2) {
            throw new MissingParamException('json');
        }

        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('model', 'CreatableModel');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('json', 'string');
        }

        if (data.params.length > 2) {
            const withRelated = data.params[2];
            if (typeof withRelated !== 'boolean') {
                throw new InvalidParamException('withRelated', 'boolean');
            }
        }

        if (!EnumHelper.containsValue(CreatableModel, data.params[0])) {
            throw new InvalidParamException('model', 'CreatableModel');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <model> <json> [<withRelated>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <model>                  - ENUM{listingitemtemplate|listingitem|profile|itemcategory \n'
            + '                                |favoriteitem|iteminformation|bid|paymentinformation|itemimage} \n'
            + '                                - The type of data we want to generate. \n'
            + '    <json>                   - String - json for the object to add. \n'
            + '    <withRelated>            - [optional] Boolean - Whether to return full objects or just id. ';
    }

    public description(): string {
        return 'Adds data to the database.';
    }

    public example(): string {
        return 'data add profile \'{"name":"someChangeFoundBetweenTwoCouchSeats","address":"1EBHA1ckUWzNKN7BMfDwGTx6GKEbADUozX"}\'';
    }
}
