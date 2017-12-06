import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { TestService } from '../repositories/TestService';
import { RpcRequest } from '../requests/RpcRequest';
import { Test } from '../models/Test';


export class TestCommand {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.TestService) public testService: TestService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Test>> {
        return this.testService.findAll();
    }

}
