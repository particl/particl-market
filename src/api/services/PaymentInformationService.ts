import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { PaymentInformationRepository } from '../repositories/PaymentInformationRepository';
import { PaymentInformation } from '../models/PaymentInformation';
import { PaymentInformationCreateRequest } from '../requests/PaymentInformationCreateRequest';
import { PaymentInformationUpdateRequest } from '../requests/PaymentInformationUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class PaymentInformationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.PaymentInformationRepository) public paymentInformationRepo: PaymentInformationRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<PaymentInformation>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<PaymentInformation>> {
        return this.paymentInformationRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<PaymentInformation> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<PaymentInformation> {
        const paymentInformation = await this.paymentInformationRepo.findOne(id, withRelated);
        if (paymentInformation === null) {
            this.log.warn(`PaymentInformation with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return paymentInformation;
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<PaymentInformation> {
        return this.create({
            data: data.params[0] // TODO: convert your params to PaymentInformationCreateRequest
        });
    }

    @validate()
    public async create( @request(PaymentInformationCreateRequest) body: any): Promise<PaymentInformation> {

        // TODO: extract and remove related models from request
        // const paymentInformationRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the paymentInformation
        const paymentInformation = await this.paymentInformationRepo.create(body);

        // TODO: create related models
        // paymentInformationRelated._id = paymentInformation.Id;
        // await this.paymentInformationRelatedService.create(paymentInformationRelated);

        // finally find and return the created paymentInformation
        const newPaymentInformation = await this.findOne(paymentInformation.id);
        return newPaymentInformation;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<PaymentInformation> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to PaymentInformationUpdateRequest
        });
    }

    @validate()
    public async update(id: number, @request(PaymentInformationUpdateRequest) body: any): Promise<PaymentInformation> {

        // find the existing one without related
        const paymentInformation = await this.findOne(id, false);

        // set new values
        paymentInformation.Type = body.type;

        // update paymentInformation record
        const updatedPaymentInformation = await this.paymentInformationRepo.update(id, paymentInformation.toJSON());

        // TODO: yes, this is stupid
        // TODO: find related record and delete it
        // let paymentInformationRelated = updatedPaymentInformation.related('PaymentInformationRelated').toJSON();
        // await this.paymentInformationService.destroy(paymentInformationRelated.id);

        // TODO: recreate related data
        // paymentInformationRelated = body.paymentInformationRelated;
        // paymentInformationRelated._id = paymentInformation.Id;
        // const createdPaymentInformation = await this.paymentInformationService.create(paymentInformationRelated);

        // TODO: finally find and return the updated paymentInformation
        // const newPaymentInformation = await this.findOne(id);
        // return newPaymentInformation;

        return updatedPaymentInformation;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.paymentInformationRepo.destroy(id);
    }

}
