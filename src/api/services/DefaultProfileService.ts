import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { Profile } from '../models/Profile';
import { ProfileService } from './ProfileService';
import { CoreRpcService } from './CoreRpcService';
import { ProfileCreateRequest } from '../requests/ProfileCreateRequest';

export class DefaultProfileService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async seedDefaultProfile(): Promise<void> {
        const defaultProfile = {
            name: 'DEFAULT'
        } as ProfileCreateRequest;

        defaultProfile.address = await this.getAddress();
        const newProfile = await this.insertOrUpdateProfile(defaultProfile);

        this.log.debug('default profile:', newProfile.toJSON());
        return;
    }

    private async getAddress(): Promise<string> {
        return 'FIXFIXFIX';
        /*
        FFS fix this after merge
        await this.coreRpcService.call('getnewaddress')
            .then( async (res) => {
                this.log.info('Successfully created new address for profile: ' + res.result);
                return res.result;
            })
            .catch(reason => {
                // TODO: temporarily returning empty address, FIXTHIS!
                this.log.info('Could not create new address for profile: ', reason);
                return '';
            });
        */
    }

    public async insertOrUpdateProfile(profile: ProfileCreateRequest): Promise<Profile> {
        let newProfile = await this.profileService.findOneByName(profile.name);
        if (newProfile === null) {
            this.log.debug('created new default profile');
            newProfile = await this.profileService.create(profile);

        } else {
            newProfile = await this.profileService.update(newProfile.Id, profile);
            this.log.debug('updated new default profile');
        }
        return newProfile;
    }
}
