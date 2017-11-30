import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { ShippingDestination } from '../models/ShippingDestination';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';
import { ShippingDestinationSearchParams } from '../requests/ShippingDestinationSearchParams';

export class ShippingDestinationRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.ShippingDestination) public ShippingDestinationModel: typeof ShippingDestination,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ShippingDestination>> {
        const list = await this.ShippingDestinationModel.fetchAll();
        return list as Bookshelf.Collection<ShippingDestination>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ShippingDestination> {
        return this.ShippingDestinationModel.fetchById(id, withRelated);
    }

     /**
     * options:
     *  item_information_id: options.item_information_id
     *  country: options.options
     *  shipping_availability: options.shipping_availability
     *
     * @param options
     * @returns {Promise<ShippingDestination>}
     */
    public async search(options: ShippingDestinationSearchParams): Promise<ShippingDestination> {
        return this.ShippingDestinationModel.searchBy(options);

    }

    public async create(data: any): Promise<ShippingDestination> {
        const shippingDestination = this.ShippingDestinationModel.forge<ShippingDestination>(data);
        try {
            const shippingDestinationCreated = await shippingDestination.save();
            return this.ShippingDestinationModel.fetchById(shippingDestinationCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the shippingDestination!', error);
        }
    }

    public async update(id: number, data: any): Promise<ShippingDestination> {
        const shippingDestination = this.ShippingDestinationModel.forge<ShippingDestination>({ id });
        try {
            const shippingDestinationUpdated = await shippingDestination.save(data, { patch: true });
            return this.ShippingDestinationModel.fetchById(shippingDestinationUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the shippingDestination!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let shippingDestination = this.ShippingDestinationModel.forge<ShippingDestination>({ id });
        try {
            shippingDestination = await shippingDestination.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await shippingDestination.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the shippingDestination!', error);
        }
    }

}
