import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { WalletRepository } from '../../repositories/WalletRepository';
import { Wallet } from '../../models/Wallet';
import { WalletCreateRequest } from '../../requests/model/WalletCreateRequest';
import { WalletUpdateRequest } from '../../requests/model/WalletUpdateRequest';
import { SettingValue } from '../../enums/SettingValue';
import { SettingService } from './SettingService';
import { MessageException } from '../../exceptions/MessageException';


export class WalletService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.WalletRepository) public walletRepo: WalletRepository,
        @inject(Types.Service) @named(Targets.Service.model.SettingService) public settingService: SettingService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getDefaultForProfile(profileId: number, withRelated: boolean = true): Promise<Wallet> {

        const profileSettings: resources.Setting[] = await this.settingService.findAllByProfileId(profileId).then(value => value.toJSON());

        const defaultWalletSetting = _.find(profileSettings, value => {
            return value.key === SettingValue.DEFAULT_WALLET;
        });

        if (_.isEmpty(defaultWalletSetting)) {
            this.log.error(new MessageException(SettingValue.DEFAULT_WALLET + ' not set.').getMessage());
            throw new MessageException(SettingValue.DEFAULT_WALLET + ' not set.');
        }

        this.log.debug('getDefaultForProfile(), defaultWalletSetting: ', JSON.stringify(defaultWalletSetting, null, 2));

        const wallet: Wallet = await this.walletRepo.findOne(+defaultWalletSetting!.value, withRelated)
            .catch(reason => {
                this.log.error('Default Wallet was not found!');
                throw new NotFoundException(defaultWalletSetting!.value);
            });

        return wallet;
    }

    public async findAll(): Promise<Bookshelf.Collection<Wallet>> {
        return this.walletRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Wallet> {
        const wallet = await this.walletRepo.findOne(id, withRelated);
        if (wallet === null) {
            this.log.warn(`Wallet with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return wallet;
    }

    public async findOneByName(name: string, withRelated: boolean = true): Promise<Wallet> {
        const wallet = await this.walletRepo.findOneByName(name, withRelated);
        if (wallet === null) {
            this.log.warn(`Wallet with the name=${name} was not found!`);
            throw new NotFoundException(name);
        }
        return wallet;
    }

    @validate()
    public async create( @request(WalletCreateRequest) data: WalletCreateRequest): Promise<Wallet> {
        const body = JSON.parse(JSON.stringify(data));
        return await this.walletRepo.create(body);
    }

    @validate()
    public async update(id: number, @request(WalletUpdateRequest) body: WalletUpdateRequest): Promise<Wallet> {

        const wallet = await this.findOne(id, false);
        wallet.Name = body.name;

        const updatedWallet = await this.walletRepo.update(id, wallet.toJSON());
        return updatedWallet;
    }

    public async destroy(id: number): Promise<void> {
        await this.walletRepo.destroy(id);
    }

}
