import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { PaymentInformation } from '../models/PaymentInformation';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class PaymentInformationRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.PaymentInformation) public PaymentInformationModel: typeof PaymentInformation,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<PaymentInformation>> {
        const list = await this.PaymentInformationModel.fetchAll();
        return list as Bookshelf.Collection<PaymentInformation>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<PaymentInformation> {
        return this.PaymentInformationModel.fetchById(id, withRelated);
    }

    public async findOneByListingItemTemplateId(id: number): Promise<PaymentInformation> {
        return this.PaymentInformationModel.fetchByListingItemTemplateId(id);
    }

    public async create(data: any): Promise<PaymentInformation> {
        const paymentInformation = this.PaymentInformationModel.forge<PaymentInformation>(data);
        try {
            const paymentInformationCreated = await paymentInformation.save();
            return this.PaymentInformationModel.fetchById(paymentInformationCreated.id);
        } catch (error) {
            this.log.error(error);
            throw new DatabaseException('Could not create the paymentInformation!', error);
        }
    }

    public async update(id: number, data: any): Promise<PaymentInformation> {
        const paymentInformation = this.PaymentInformationModel.forge<PaymentInformation>({ id });
        try {
            const paymentInformationUpdated = await paymentInformation.save(data, { patch: true });
            return this.PaymentInformationModel.fetchById(paymentInformationUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the paymentInformation!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let paymentInformation = this.PaymentInformationModel.forge<PaymentInformation>({ id });
        try {
            paymentInformation = await paymentInformation.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await paymentInformation.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the paymentInformation!', error);
        }
    }

}
