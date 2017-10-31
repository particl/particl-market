import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { EscrowRatioRepository } from '../repositories/EscrowRatioRepository';
import { EscrowRatio } from '../models/EscrowRatio';
import { EscrowRatioCreateRequest } from '../requests/EscrowRatioCreateRequest';
import { EscrowRatioUpdateRequest } from '../requests/EscrowRatioUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class EscrowRatioService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.EscrowRatioRepository) public escrowRatioRepo: EscrowRatioRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<EscrowRatio>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<EscrowRatio>> {
        return this.escrowRatioRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<EscrowRatio> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<EscrowRatio> {
        const escrowRatio = await this.escrowRatioRepo.findOne(id, withRelated);
        if (escrowRatio === null) {
            this.log.warn(`EscrowRatio with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return escrowRatio;
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<EscrowRatio> {
        return this.create({
            data: data.params[0] // TODO: convert your params to EscrowRatioCreateRequest
        });
    }

    @validate()
    public async create( @request(EscrowRatioCreateRequest) body: any): Promise<EscrowRatio> {

        // TODO: extract and remove related models from request
        // const escrowRatioRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the escrowRatio
        const escrowRatio = await this.escrowRatioRepo.create(body);

        // TODO: create related models
        // escrowRatioRelated._id = escrowRatio.Id;
        // await this.escrowRatioRelatedService.create(escrowRatioRelated);

        // finally find and return the created escrowRatio
        const newEscrowRatio = await this.findOne(escrowRatio.id);
        return newEscrowRatio;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<EscrowRatio> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to EscrowRatioUpdateRequest
        });
    }

    @validate()
    public async update(id: number, @request(EscrowRatioUpdateRequest) body: any): Promise<EscrowRatio> {

        // find the existing one without related
        const escrowRatio = await this.findOne(id, false);

        // set new values
        escrowRatio.Buyer = body.buyer;
        escrowRatio.Seller = body.seller;

        // update escrowRatio record
        const updatedEscrowRatio = await this.escrowRatioRepo.update(id, escrowRatio.toJSON());

        // TODO: yes, this is stupid
        // TODO: find related record and delete it
        // let escrowRatioRelated = updatedEscrowRatio.related('EscrowRatioRelated').toJSON();
        // await this.escrowRatioService.destroy(escrowRatioRelated.id);

        // TODO: recreate related data
        // escrowRatioRelated = body.escrowRatioRelated;
        // escrowRatioRelated._id = escrowRatio.Id;
        // const createdEscrowRatio = await this.escrowRatioService.create(escrowRatioRelated);

        // TODO: finally find and return the updated escrowRatio
        // const newEscrowRatio = await this.findOne(id);
        // return newEscrowRatio;

        return updatedEscrowRatio;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.escrowRatioRepo.destroy(id);
    }

}
