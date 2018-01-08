import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import {ProfileService} from '../../services/ProfileService';

export class ProfileDestroyCommand implements RpcCommandInterface<void> {
    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService,
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
        return this.profileService.destroy(data.params[0]);
    }

    public help(): string {
        return 'removeprofile (<profileId>|<profileName>)\n'
            + '    <profileID>            -  That profile ID of the profile we want to destroy.\n'
            + '    <profileName>          -  [TODO implement] The name of the profile we\n'
            + '                               want to destroy.';
    }
}
