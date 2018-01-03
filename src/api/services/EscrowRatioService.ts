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

    public async findAll(): Promise<Bookshelf.Collection<EscrowRatio>> {
        return this.escrowRatioRepo.findAll();
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
    public async create( @request(EscrowRatioCreateRequest) body: EscrowRatioCreateRequest): Promise<EscrowRatio> {

        // If the request body was valid we will create the escrowRatio
        const escrowRatio = await this.escrowRatioRepo.create(body);

        // finally find and return the created escrowRatio
        const newEscrowRatio = await this.findOne(escrowRatio.Id);
        return newEscrowRatio;
    }

    @validate()
    public async update(id: number, @request(EscrowRatioUpdateRequest) body: EscrowRatioUpdateRequest): Promise<EscrowRatio> {

        // find the existing one without related
        const escrowRatio = await this.findOne(id, false);

        // set new values
        escrowRatio.Buyer = body.buyer;
        escrowRatio.Seller = body.seller;

        // update escrowRatio record
        const updatedEscrowRatio = await this.escrowRatioRepo.update(id, escrowRatio.toJSON());
        return updatedEscrowRatio;
    }

    public async destroy(id: number): Promise<void> {
        await this.escrowRatioRepo.destroy(id);
    }
}
