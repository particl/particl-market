
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { Cryptocurrency, OpenMarketProtocol } from 'omp-lib/dist/omp';
import { CoreRpcService } from './CoreRpcService';

export class OmpService {

    public log: LoggerType;
    public omp: OpenMarketProtocol;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        // TODO: we could do this during startup and then inject the omp in the classes
        this.omp = new OpenMarketProtocol();
        this.omp.inject(Cryptocurrency.PART, coreRpcService);

    }

}
