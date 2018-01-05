import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { CryptocurrencyAddress } from '../models/CryptocurrencyAddress';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class CryptocurrencyAddressRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.CryptocurrencyAddress) public CryptocurrencyAddressModel: typeof CryptocurrencyAddress,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<CryptocurrencyAddress>> {
        const list = await this.CryptocurrencyAddressModel.fetchAll();
        return list as Bookshelf.Collection<CryptocurrencyAddress>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<CryptocurrencyAddress> {
        return this.CryptocurrencyAddressModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<CryptocurrencyAddress> {
        const cryptocurrencyAddress = this.CryptocurrencyAddressModel.forge<CryptocurrencyAddress>(data);
        try {
            const cryptocurrencyAddressCreated = await cryptocurrencyAddress.save();
            return this.CryptocurrencyAddressModel.fetchById(cryptocurrencyAddressCreated.id);
        } catch (error) {
            this.log.error(error);
            throw new DatabaseException('Could not create the cryptocurrencyAddress!', error);
        }
    }

    public async update(id: number, data: any): Promise<CryptocurrencyAddress> {
        const cryptocurrencyAddress = this.CryptocurrencyAddressModel.forge<CryptocurrencyAddress>({ id });
        try {
            const cryptocurrencyAddressUpdated = await cryptocurrencyAddress.save(data, { patch: true });
            return this.CryptocurrencyAddressModel.fetchById(cryptocurrencyAddressUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the cryptocurrencyAddress!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let cryptocurrencyAddress = this.CryptocurrencyAddressModel.forge<CryptocurrencyAddress>({ id });
        try {
            cryptocurrencyAddress = await cryptocurrencyAddress.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await cryptocurrencyAddress.destroy();
            return;
        } catch (error) {
            this.log.error(error);
            throw new DatabaseException('Could not delete the cryptocurrencyAddress!', error);
        }
    }

}
