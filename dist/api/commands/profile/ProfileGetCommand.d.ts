import { Logger as LoggerType } from '../../../core/Logger';
import { ProfileService } from '../../services/ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Profile } from '../../models/Profile';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class ProfileGetCommand extends BaseCommand implements RpcCommandInterface<Profile> {
    Logger: typeof LoggerType;
    private profileService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, profileService: ProfileService);
    /**
     * data.params[]:
     *  [0]: id or name
     *
     * when data.params[0] is number then findById, else findByName
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    execute(data: RpcRequest): Promise<Profile>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
