import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { Profile } from '../models/Profile';
import { ProfileCreateRequest } from '../requests/ProfileCreateRequest';
import { RpcRequest } from '../requests/RpcRequest';
import { AddressService } from './AddressService';
import { ProfileService } from './ProfileService';
import { Country } from '../enums/Country';


export class DefaultProfileService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.AddressService) public addressService: AddressService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Repository) @named(Targets.Repository.ProfileRepository) public profileRepo: ProfileRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }


    public async seedDefaultProfile(): Promise<void> {
        const defaultProfile = {
            name: 'DEFAULT',
            addresses: [{
                title: 'Work',
                addressLine1: '123 6th St',
                addressLine2: 'Melbourne, FL 32904',
                city: 'Melbourne',
                country: Country.SWEDEN
            }, {
                title: 'Home',
                addressLine1: '123 6th St',
                addressLine2: 'FINLAND, FL 32904',
                city: 'FINLAND',
                country: Country.FINLAND
            }]
        };
        const ROOT = await this.insertOrUpdateProfile(defaultProfile);
    }

    public async insertOrUpdateProfile(profile: any): Promise<Profile> {
        let newProfile = await this.profileService.findOneByName(profile.name);
        if (newProfile === null) {
            newProfile = await this.profileService.create(profile);
            this.log.debug('created new default profile');
        } else {
            newProfile = await this.profileService.update(newProfile.Id, profile);
            this.log.debug('updated new default profile');
        }
        return newProfile;
    }
}
