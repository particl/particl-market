import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ProfileService } from '../../services/ProfileService';
import {CommandEnumType, Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';

export class ProfileDestroyCommand extends BaseCommand implements RpcCommandInterface<void> {
    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.PROFILE_REMOVE);
        this.log = new Logger(__filename);
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

    public example(): any {
        return null;
    }
}
