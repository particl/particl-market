import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';

export class RpcCliHelpService {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async help( @request(RpcRequest) data: any): Promise<string> {
        return  'available commands: \n' +
                'createprofile \n' +
                'updateprofile \n' +
                'getprofile \n' +
                'createaddress \n' +
                'updateaddress \n' +
                'finditems \n' +
                'getitem \n' +
                'getcategories \n' +
                'getcategory \n';
    }

}
