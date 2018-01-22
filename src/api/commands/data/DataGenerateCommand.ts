import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { TestDataService } from '../../services/TestDataService';
import { RpcRequest } from '../../requests/RpcRequest';
import { TestDataGenerateRequest } from '../../requests/TestDataGenerateRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import {CommandEnumType, Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

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
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<any>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<any> {
        this.log.info('data.params[0]: ', data.params[0]);
        this.log.info('data.params[1]: ', data.params[1]);

        return await this.testDataService.generate({
            model: data.params[0],
            amount: data.params[1],
            withRelated: data.params[2]
        } as TestDataGenerateRequest);
    }

    public help(): string {
        return '<model> [<amount> [<withRelated>]]\n'
            + '    <model>                 - [TODO] ENUM{} - [TODO]\n'
            + '    <amount>                - [optional] Numeric - [TODO]\n'
            + '    <withRelated>           - [optional] Boolean - [TODO]';
    }

    public example(): any {
        return null;
    }

}
