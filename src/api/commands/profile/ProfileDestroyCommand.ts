import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommand } from '../RpcCommand';
import { MessageException } from '../../exceptions/MessageException';

export class ProfileDestroyCommand implements RpcCommand<void> {
    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'removeprofile';
    }

    /**
     * data.params[]:
     *  [0]: id or name
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<void> {
        throw new MessageException('Not implemented');
    }

    public help(): string {
        return 'ProfileDestroyCommand: TODO: Fill in help string.';
    }
}
