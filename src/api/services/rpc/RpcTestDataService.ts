import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { TestDataService } from '../TestDataService';
import { RpcRequest } from '../../requests/RpcRequest';


export class RpcTestDataService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.TestDataService) private testDataService: TestDataService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * cleans up the database
     *
     * data.params[]:
     *  [0]: table to ignore
     *  [1]: table to ignore
     *  [n]: table to ignore
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async clean( @request(RpcRequest) data: any): Promise<void> {
        this.log.info('data.params: ', JSON.stringify(data.params));
        return await this.testDataService.clean(data.params);
    }
}
