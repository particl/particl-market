import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { Profile } from '../models/Profile';
import { ProfileCreateRequest } from '../requests/ProfileCreateRequest';
import { ProfileUpdateRequest } from '../requests/ProfileUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';
import { AddressService } from './AddressService';


export class ProfileService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.AddressService) public addressService: AddressService,
        @inject(Types.Repository) @named(Targets.Repository.ProfileRepository) public profileRepo: ProfileRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getDefault(withRelated: boolean = true): Promise<Profile> {
        const profile = await this.profileRepo.getDefault(withRelated);
        if (profile === null) {
            this.log.warn(`Default Profile was not found!`);
            throw new NotFoundException('DEFAULT');
        }
        return profile;
    }

    public async findAll(): Promise<Bookshelf.Collection<Profile>> {
        return this.profileRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Profile> {
        const profile = await this.profileRepo.findOne(id, withRelated);
        if (profile === null) {
            this.log.warn(`Profile with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return profile;
    }

    public async findOneByName(name: string, withRelated: boolean = true): Promise<Profile> {
        const profile = await this.profileRepo.findOneByName(name, withRelated);
        return profile;
    }

    @validate()
    public async create( @request(ProfileCreateRequest) data: any): Promise<Profile> {

        const body = JSON.parse(JSON.stringify(data));

        // extract and remove related models from request
        const addresses = body.addresses || [];
        delete body.addresses;
        // If the request body was valid we will create the profile
        const profile = await this.profileRepo.create(body);

        // create related models
        for (const address of addresses) {
            address.profile_id = profile.Id;
            await this.addressService.create(address);
        }

        // finally find and return the created profileId
        const newProfile = await this.findOne(profile.Id);
        return newProfile;
    }

    @validate()
    public async update(id: number, @request(ProfileUpdateRequest) data: any): Promise<Profile> {

        const body = JSON.parse(JSON.stringify(data));

        // find the existing one without related
        const profile = await this.findOne(id, false);

        // set new values
        profile.Name = body.name;

        // update address only if its set
        if (body.address) {
            profile.Address = body.address;
        }

        // update address record
        const updatedProfile = await this.profileRepo.update(id, profile.toJSON());

        // todo: loop through addresses, add new ones that have no id, update the new ones with id and delete the removed
        // find related records and delete them
        let addresses = updatedProfile.related('ShippingAddresses').toJSON();
        for (const address of addresses) {
            await this.addressService.destroy(address.id);
        }

        // recreate related data
        addresses = body.addresses || [];
        for (const address of addresses) {
            address.profile_id = id;
            await this.addressService.create(address);
        }

        // finally find and return the updated itemInformation
        const newProfile = await this.findOne(id);
        return newProfile;
    }

    public async destroy(id: number): Promise<void> {
        await this.profileRepo.destroy(id);
    }

}
