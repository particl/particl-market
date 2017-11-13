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

    /**
     * params: none
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Profile>>}
     */
    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Profile>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<Profile>> {
        return this.profileRepo.findAll();
    }

    /**
     * data.params[]:
     *  [0]: id or name
     *
     * when data.params[0] is number then findById, else findByName
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<Profile> {
        if (typeof data.params[0] === 'number') {
            return await this.findOne(data.params[0]);
        } else {
            return await this.findOneByName(data.params[0]);
        }
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
        if (profile === null) {
            this.log.warn(`Profile with the name=${name} was not found!`);
            throw new NotFoundException(name);
        }
        return profile;
    }

    /**
     * data.params[]:
     *  [0]: profile name
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<Profile> {
        return this.create({
            name : data.params[0]
        });
    }

    @validate()
    public async create( @request(ProfileCreateRequest) body: any): Promise<Profile> {

        // extract and remove related models from request
        const addresses = body.addresses;
        delete body.addresses;

        // If the request body was valid we will create the profile
        const profile = await this.profileRepo.create(body);

        // create related models
        for (const address of addresses) {
            address.profileId = profile.Id;
            await this.addressService.create(address);
        }

        // finally find and return the created profileId
        const newProfile = await this.findOne(profile.Id);
        return newProfile;
    }

    /**
     * data.params[]:
     *  [0]: profile id
     *  [1]: new name
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<Profile> {
        return this.update(data.params[0], {
            name: data.params[1]
        });
    }

    @validate()
    public async update(id: number, @request(ProfileUpdateRequest) body: any): Promise<Profile> {

        // find the existing one without related
        const profile = await this.findOne(id, false);

        // set new values
        profile.Name = body.name;

        // update address record
        const updatedProfile = await this.profileRepo.update(id, profile.toJSON());

        // todo: loop through addresses, add new ones that have no idea, update the new ones with id and delete the removed
        // find related records and delete them
        let addresses = updatedProfile.related('Addresses').toJSON();
        for (const address of addresses) {
            await this.addressService.destroy(address.id);
        }

        // recreate related data
        addresses = body.addresses;
        for (const address of addresses) {
            address.profileId = id;
            await this.addressService.create(address);
        }

        // finally find and return the updated itemInformation
        const newProfile = await this.findOne(id);
        return newProfile;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.profileRepo.destroy(id);
    }

}
