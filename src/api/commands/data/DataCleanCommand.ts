import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { TestDataService } from '../../services/TestDataService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class DataCleanCommand extends BaseCommand implements RpcCommandInterface<void> {

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
     *  none
     *
     * @param {RpcRequest} data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        return await this.testDataService.clean();
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
