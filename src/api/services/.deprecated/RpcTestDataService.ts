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
        return await this.testDataService.clean(data.params);
    }

    /**
     * rpc command to create test data
     *
     * data.params[]:
     *  [0]: modelType profile/listingitem/listingitemtemplate
     *  [1]: modelJson item as json
     *
     * @param data
     * @returns {Promise<void>}
     */
    public async create( @request(RpcRequest) data: any): Promise<any> {
        this.log.info('data.params[0]: ', data.params[0]);
        this.log.info('data.params[1]: ', data.params[1]);

        return await this.testDataService.create({
            model: data.params[0],
            data: JSON.parse(data.params[1])
        });
    }

    /**
     * rpc command to generate test data
     *
     * data.params[]:
     *  [0]: modelType profile/listingitem/listingitemtemplate
     *  [1]: amount of items generated
     *  [2]: withRelated, return with related or just id's, default true
     *
     * @param data
     * @returns {Promise<void>}
     */
    public async generate( @request(RpcRequest) data: any): Promise<any> {
        this.log.info('data.params[0]: ', data.params[0]);
        this.log.info('data.params[1]: ', data.params[1]);

        return await this.testDataService.generate({
            model: data.params[0],
            amount: data.params[1],
            withRelated: data.params[2]
        });

    }
}
