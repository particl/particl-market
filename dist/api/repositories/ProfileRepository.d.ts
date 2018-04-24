import * as Bookshelf from 'bookshelf';
import { Profile } from '../models/Profile';
import { Logger as LoggerType } from '../../core/Logger';
export declare class ProfileRepository {
    ProfileModel: typeof Profile;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(ProfileModel: typeof Profile, Logger: typeof LoggerType);
    getDefault(withRelated?: boolean): Promise<Profile>;
    findAll(): Promise<Bookshelf.Collection<Profile>>;
    findOne(id: number, withRelated?: boolean): Promise<Profile>;
    findOneByName(name: string, withRelated?: boolean): Promise<Profile>;
    findOneByAddress(name: string, withRelated?: boolean): Promise<Profile>;
    create(data: any): Promise<Profile>;
    update(id: number, data: any): Promise<Profile>;
    destroy(id: number): Promise<void>;
}
