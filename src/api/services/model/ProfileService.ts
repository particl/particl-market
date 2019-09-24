// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { ProfileRepository } from '../../repositories/ProfileRepository';
import { Profile } from '../../models/Profile';
import { ProfileCreateRequest } from '../../requests/model/ProfileCreateRequest';
import { ProfileUpdateRequest } from '../../requests/model/ProfileUpdateRequest';
import { AddressService } from './AddressService';
import { CryptocurrencyAddressService } from './CryptocurrencyAddressService';
import { CoreRpcService } from '../CoreRpcService';
import { ShoppingCartService } from './ShoppingCartService';
import { AddressCreateRequest } from '../../requests/model/AddressCreateRequest';
import { CryptocurrencyAddressCreateRequest } from '../../requests/model/CryptocurrencyAddressCreateRequest';
import { CryptocurrencyAddressUpdateRequest } from '../../requests/model/CryptocurrencyAddressUpdateRequest';
import { ShoppingCartCreateRequest } from '../../requests/model/ShoppingCartCreateRequest';
import { SettingCreateRequest } from '../../requests/model/SettingCreateRequest';
import { SettingService } from './SettingService';
import { SettingValue } from '../../enums/SettingValue';
import { WalletService } from './WalletService';

export class ProfileService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.AddressService) public addressService: AddressService,
        @inject(Types.Service) @named(Targets.Service.model.CryptocurrencyAddressService) public cryptocurrencyAddressService: CryptocurrencyAddressService,
        @inject(Types.Service) @named(Targets.Service.model.ShoppingCartService) public shoppingCartService: ShoppingCartService,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Service) @named(Targets.Service.model.WalletService) public walletService: WalletService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Repository) @named(Targets.Repository.ProfileRepository) public profileRepo: ProfileRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getDefault(withRelated: boolean = true): Promise<Profile> {

        const defaultProfileSettings: resources.Setting[] = await this.settingService.findAllByKey(SettingValue.DEFAULT_PROFILE_ID)
            .then(value => value.toJSON());
        const defaultProfileSetting = defaultProfileSettings[0];
        this.log.debug('getDefault(), defaultProfileSetting: ', defaultProfileSetting.value);

        const profile = await this.findOne(+defaultProfileSetting.value, withRelated);
        if (profile === null) {
            this.log.warn(`Default Profile was not found!`);
            throw new NotFoundException(defaultProfileSetting.value);
        }
        return profile;
    }

    public async findAll(): Promise<Bookshelf.Collection<Profile>> {
        return await this.profileRepo.findAll();
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
        const body: ProfileCreateRequest = JSON.parse(JSON.stringify(data));

        // this.log.debug('body: ', JSON.stringify(body, null, 2));
        if (_.isEmpty(body.address)) {
            body.address = await this.getNewAddress();
        }

        // extract and remove related models from request
        const shippingAddresses = body.shippingAddresses || [];
        delete body.shippingAddresses;
        const cryptocurrencyAddresses = body.cryptocurrencyAddresses || [];
        delete body.cryptocurrencyAddresses;
        const settings = body.settings || [];
        delete body.settings;
        const wallet = body.wallet;
        delete body.wallet;

        // If the request body was valid we will create the profile
        const profile = await this.profileRepo.create(body);

        // then create related models
        for (const address of shippingAddresses) {
            address.profile_id = profile.Id;
            await this.addressService.create(address);
        }

        for (const cryptoAddress of cryptocurrencyAddresses) {
            cryptoAddress.profile_id = profile.Id;
            await this.cryptocurrencyAddressService.create(cryptoAddress);
        }

        for (const setting of settings) {
            setting.profile_id = profile.Id;
            await this.settingService.create(setting);
        }

        if (!_.isEmpty(wallet)) {
            wallet.profile_id = profile.Id;
            await this.walletService.create(wallet);
        }

        // create default shoppingCart
        await this.shoppingCartService.create({
            name: 'DEFAULT',
            profile_id: profile.Id
        } as ShoppingCartCreateRequest);

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

        // update address only if it is set
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

        // finally find and return the updated itemInformation
        const newProfile = await this.findOne(id);
        return newProfile;
    }

    public async destroy(id: number): Promise<void> {
        await this.profileRepo.destroy(id);
    }

}
