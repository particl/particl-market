import { Logger as LoggerType } from '../../core/Logger';
import { Profile } from '../models/Profile';
import { ProfileService } from './ProfileService';
import { CoreRpcService } from './CoreRpcService';
import { ProfileCreateRequest } from '../requests/ProfileCreateRequest';
export declare class DefaultProfileService {
    profileService: ProfileService;
    coreRpcService: CoreRpcService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(profileService: ProfileService, coreRpcService: CoreRpcService, Logger: typeof LoggerType);
    seedDefaultProfile(): Promise<void>;
    insertOrUpdateProfile(profile: ProfileCreateRequest): Promise<Profile>;
}
