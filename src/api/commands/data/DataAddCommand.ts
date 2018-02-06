import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { TestDataService } from '../../services/TestDataService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { TestDataCreateRequest } from '../../requests/TestDataCreateRequest';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

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
     *
     * @param data
     * @returns {Promise<Bookshelf.Model<any>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<any> {
        const withRelated = data.params[2] ? data.params[2] : true;
        return await this.testDataService.create({
            model: data.params[0],
            data: JSON.parse(data.params[1]),
            withRelated
        } as TestDataCreateRequest);
    }

    public help(): string {
        return this.getName() + '<model> <json> [<withRelated>]';
    }

    public description(): string {
        return 'Create data as per given model and data.';
    }


}
