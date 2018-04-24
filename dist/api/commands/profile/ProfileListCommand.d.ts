import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { RpcRequest } from '../../requests/RpcRequest';
import { Profile } from '../../models/Profile';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ProfileService } from '../../services/ProfileService';
import { BaseCommand } from '../BaseCommand';
export declare class ProfileListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Profile>> {
    Logger: typeof LoggerType;
    private profileService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, profileService: ProfileService);
    /**
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Profile>>}
     */
    execute(data: RpcRequest): Promise<Bookshelf.Collection<Profile>>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
