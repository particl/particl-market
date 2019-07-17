import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Wallet } from '../models/Wallet';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class WalletRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Wallet) public WalletModel: typeof Wallet,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Wallet>> {
        const list = await this.WalletModel.fetchAll();
        return list as Bookshelf.Collection<Wallet>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Wallet> {
        return await this.WalletModel.fetchById(id, withRelated);
    }

    public async findAllByProfileId(profileId: number, withRelated: boolean = true): Promise<Bookshelf.Collection<Wallet>> {
        return await this.WalletModel.fetchAllByProfileId(profileId, withRelated);
    }

    public async create(data: any): Promise<Wallet> {
        const wallet = this.WalletModel.forge<Wallet>(data);
        try {
            const walletCreated = await wallet.save();
            return await this.WalletModel.fetchById(walletCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the wallet!', error);
        }
    }

    public async update(id: number, data: any): Promise<Wallet> {
        const wallet = this.WalletModel.forge<Wallet>({ id });
        try {
            const walletUpdated = await wallet.save(data, { patch: true });
            return await this.WalletModel.fetchById(walletUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the wallet!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let wallet = this.WalletModel.forge<Wallet>({ id });
        try {
            wallet = await wallet.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await wallet.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the wallet!', error);
        }
    }

}
