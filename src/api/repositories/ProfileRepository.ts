import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Profile } from '../models/Profile';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class ProfileRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Profile) public ProfileModel: typeof Profile,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(data: any): Promise<Bookshelf.Collection<Profile>> {
        const list = await this.ProfileModel.forge<Profile>().fetchAll(
            {
                withRelated: ['Address']
            });

        return list as Bookshelf.Collection<Profile>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Profile> {
        return this.ProfileModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<Profile> {
        const profile = this.ProfileModel.forge<Profile>(data);
        try {
            const profileCreated = await profile.save();
            return this.ProfileModel.fetchById(profileCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the profile!', error);
        }
    }

    public async update(id: number, data: any): Promise<Profile> {
        const profile = this.ProfileModel.forge<Profile>({ id });
        try {
            const profileUpdated = await profile.save(data, { patch: true });
            return this.ProfileModel.fetchById(profileUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the profile!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let profile = this.ProfileModel.forge<Profile>({ id });
        try {
            profile = await profile.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await profile.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the profile!', error);
        }
    }

}
