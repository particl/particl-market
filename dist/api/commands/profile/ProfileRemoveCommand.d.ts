import { Logger as LoggerType } from '../../../core/Logger';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ProfileService } from '../../services/ProfileService';
import { BaseCommand } from '../BaseCommand';
export declare class ProfileRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {
    Logger: typeof LoggerType;
    private profileService;
    log: LoggerType;
    name: string;
    helpStr: string;
    constructor(Logger: typeof LoggerType, profileService: ProfileService);
    /**
     * data.params[]:
     *  [0]: id or name
     *
     * @param data
     * @returns {Promise<void>}
     */
    execute(data: RpcRequest): Promise<void>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
