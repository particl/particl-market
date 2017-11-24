import * as Bookshelf from 'bookshelf';
import * as PromiseB from 'bluebird';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Address } from '../models/Address';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class AddressRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Address) public AddressModel: typeof Address,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Address>> {
        const list = await this.AddressModel.fetchAll();
        return list as Bookshelf.Collection<Address>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Address> {
        return this.AddressModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<Address> {
        const address = this.AddressModel.forge<Address>(data);
        try {
            const addressCreated = await address.save();
            return this.AddressModel.fetchById(addressCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the address!', error);
        }
    }

    public async update(id: number, data: any): Promise<Address> {
        const address = this.AddressModel.forge<Address>({ id });
        try {
            const addressUpdated = await address.save(data, { patch: true });
            return this.AddressModel.fetchById(addressUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the address!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let address = this.AddressModel.forge<Address>({ id });
        try {
            address = await address.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await address.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the address!', error);
        }
    }
}
