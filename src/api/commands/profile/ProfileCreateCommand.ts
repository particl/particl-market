import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ProfileCreateRequest } from '../../requests/ProfileCreateRequest';
import { Profile } from '../../models/Profile';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ProfileCreateCommand extends BaseCommand implements RpcCommandInterface<Profile> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService
    ) {
        super(Commands.PROFILE_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: profile name
     *  [1]: profile address
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Profile> {
        return this.profileService.create({
            name : data.params[0],
            address : data.params[1]
        } as ProfileCreateRequest);
    }

    public help(): string {
        return this.getName() + ' <profileName> [<profileAddress>]\n'
            + '    <profileName>          - The name of the profile we want to create.\n'
            + '    <profileAddress>       - [optional] the particl address of this profile.\n'
            + '                              This is the address that\'s used in the particl\n'
            + '                              messaging system. Will be automatically generated\n'
            + '                              if omitted.';
    }

}
