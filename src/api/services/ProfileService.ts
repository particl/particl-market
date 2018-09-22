// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ProfileRepository } from '../repositories/ProfileRepository';
import { Profile } from '../models/Profile';
import { Setting } from '../models/Setting';
import { ProfileCreateRequest } from '../requests/ProfileCreateRequest';
import { ProfileUpdateRequest } from '../requests/ProfileUpdateRequest';
import { AddressService } from './AddressService';
import { SettingService } from './SettingService';
import { CryptocurrencyAddressService } from './CryptocurrencyAddressService';
import { CoreRpcService } from './CoreRpcService';
import { ShoppingCartService } from './ShoppingCartService';
import { AddressCreateRequest } from '../requests/AddressCreateRequest';
import { AddressUpdateRequest } from '../requests/AddressUpdateRequest';
import { CryptocurrencyAddressCreateRequest } from '../requests/CryptocurrencyAddressCreateRequest';
import { CryptocurrencyAddressUpdateRequest } from '../requests/CryptocurrencyAddressUpdateRequest';
import { SettingCreateRequest } from '../requests/SettingCreateRequest';
import { SettingGetRequest } from '../requests/SettingGetRequest';
import { SettingRemoveRequest } from '../requests/SettingRemoveRequest';
import { SettingUpdateRequest } from '../requests/SettingUpdateRequest';
import { ShoppingCartCreateRequest } from '../requests/ShoppingCartCreateRequest';
import {MessageException} from '../exceptions/MessageException';

export class ProfileService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.AddressService) public addressService: AddressService,
        @inject(Types.Service) @named(Targets.Service.CryptocurrencyAddressService) public cryptocurrencyAddressService: CryptocurrencyAddressService,
        @inject(Types.Service) @named(Targets.Service.ShoppingCartService) public shoppingCartService: ShoppingCartService,
        @inject(Types.Service) @named(Targets.Service.SettingService) public settingService: SettingService,
        @inject(Types.Repository) @named(Targets.Repository.ProfileRepository) public profileRepo: ProfileRepository,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
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
        if (profile === null) {
            this.log.warn(`Profile with the name=${name} was not found!`);
            throw new NotFoundException(name);
        }
        return profile;
    }

    public async findOneByAddress(address: string, withRelated: boolean = true): Promise<Profile> {
        const profile = await this.profileRepo.findOneByAddress(address, withRelated);
        if (profile === null) {
            this.log.warn(`Profile with the address=${address} was not found!`);
            throw new NotFoundException(address);
        }
        return profile;
    }

    @validate()
    public async create( @request(ProfileCreateRequest) data: ProfileCreateRequest): Promise<Profile> {
        const body = JSON.parse(JSON.stringify(data));

        if ( !body.address ) {
            body.address = await this.getNewAddress();
        }

        // extract and remove related models from request
        const shippingAddresses = body.shippingAddresses || [];
        delete body.shippingAddresses;
        const cryptocurrencyAddresses = body.cryptocurrencyAddresses || [];
        delete body.cryptocurrencyAddresses;
        const settings = body.settings || [];
        delete body.settings;
        // If the request body was valid we will create the profile
        const profile = await this.profileRepo.create(body);
        // then create related models
        for (const address of shippingAddresses) {
            address.profile_id = profile.Id;
            await this.addressService.create(address as AddressCreateRequest);
        }

        for (const cryptoAddress of cryptocurrencyAddresses) {
            cryptoAddress.profile_id = profile.Id;
            await this.cryptocurrencyAddressService.create(cryptoAddress as CryptocurrencyAddressCreateRequest);
        }

        for (const setting of settings) {
            setting.profile_id = profile.Id;
            await this.cryptocurrencyAddressService.create(setting as CryptocurrencyAddressCreateRequest);
        }

        const shoppingCartData = {
            name: 'DEFAULT',
            profile_id: profile.Id
        };

        // create default shoppingCart
        const defaultShoppingCart = await this.shoppingCartService.create(shoppingCartData as ShoppingCartCreateRequest);
        // finally find and return the created profileId
        const newProfile = await this.findOne(profile.Id);
        return newProfile;
    }

    public async getNewAddress(): Promise<string> {
        const newAddress = await this.coreRpcService.getNewAddress()
            .then( async (res) => {
                this.log.info('Successfully created new address for profile: ' + res);
                return res;
            })
            .catch(async (reason) => {
                this.log.warn('Could not create new address for profile: ' + reason);
                return 'ERROR_NO_ADDRESS';
            });
        this.log.debug('new address: ', newAddress );
        return newAddress;
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

        // update profile
        const updatedProfile = await this.profileRepo.update(id, profile.toJSON());
        this.log.debug('updatedProfile: ', updatedProfile.toJSON());

        // remove existing addresses
        const addressesToDelete = profile.toJSON().ShippingAddresses || [];
        for (const address of addressesToDelete) {
            await this.addressService.destroy(address.id);
        }

        // update related data
        const shippingAddresses = body.shippingAddresses || [];

        // add new addresses
        for (const address of shippingAddresses) {
            address.profile_id = id;
            await this.addressService.create(address as AddressCreateRequest);
        }

        const cryptocurrencyAddresses = body.cryptocurrencyAddresses || [];
        for (const cryptoAddress of cryptocurrencyAddresses) {
            if (cryptoAddress.profile_id) {
                await this.cryptocurrencyAddressService.update(cryptoAddress.id, cryptoAddress as CryptocurrencyAddressUpdateRequest);
            } else {
                cryptoAddress.profile_id = id;
                await this.cryptocurrencyAddressService.create(cryptoAddress as CryptocurrencyAddressCreateRequest);
            }
        }

        const settings = body.settings || [];
        for (const setting of settings) {
            if (setting.profile_id) {
                await this.settingService.update(setting.id, setting as SettingUpdateRequest);
            } else {
                setting.profile_id = id;
                await this.settingService.create(setting as SettingCreateRequest);
            }
        }

        // finally find and return the updated itemInformation
        const newProfile = await this.findOne(id);
        return newProfile;
    }

    public async destroy(id: number): Promise<void> {
        await this.profileRepo.destroy(id);
    }
}
