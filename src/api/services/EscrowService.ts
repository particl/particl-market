import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { EscrowRepository } from '../repositories/EscrowRepository';
import { Escrow } from '../models/Escrow';
import { EscrowCreateRequest } from '../requests/EscrowCreateRequest';
import { EscrowUpdateRequest } from '../requests/EscrowUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';
import { EscrowRatioService } from '../services/EscrowRatioService';

export class EscrowService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowRatioService) private escrowratioService: EscrowRatioService,
        @inject(Types.Repository) @named(Targets.Repository.EscrowRepository) public escrowRepo: EscrowRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Escrow>> {
        return this.escrowRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Escrow> {
        const escrow = await this.escrowRepo.findOne(id, withRelated);
        if (escrow === null) {
            this.log.warn(`Escrow with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return escrow;
    }

    @validate()
    public async create( @request(EscrowCreateRequest) data: any): Promise<Escrow> {

        const body = JSON.parse(JSON.stringify(data));

        const escrowRatio = body.ratio;
        delete body.ratio;

        // If the request body was valid we will create the escrow
        const escrow = await this.escrowRepo.create(body);

        // then create escrowratio
        escrowRatio.escrow_id = escrow.Id;
        await this.escrowratioService.create(escrowRatio);

        // finally find and return the created escrow
        const newEscrow = await this.findOne(escrow.Id);
        return newEscrow;
    }

    @validate()
    public async update(id: number, @request(EscrowUpdateRequest) data: any): Promise<Escrow> {

        const body = JSON.parse(JSON.stringify(data));

        // find the existing one without related
        const escrow = await this.findOne(id, false);

        // set new values
        escrow.Type = body.type;

        // update escrow record
        const updatedEscrow = await this.escrowRepo.update(id, escrow.toJSON());

        // find related escrowratio
        let relatedRatio = updatedEscrow.related('Ratio').toJSON();

        // delete it
        await this.escrowratioService.destroy(relatedRatio.id);

        // and create new related data
        relatedRatio = body.ratio;
        relatedRatio.escrow_id = id;
        await this.escrowratioService.create(relatedRatio);

        // finally find and return the updated escrow
        const newEscrow = await this.findOne(id);
        return newEscrow;
    }

    public async destroy(id: number): Promise<void> {
        await this.escrowRepo.destroy(id);
    }

    // TODO: REMOVE
    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Escrow>> {
        return this.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<Escrow> {
        return this.findOne(data.params[0]);
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<Escrow> {
        return this.create({
            type: data.params[0],
            ratio: {
                buyer: data.params[1],
                seller: data.params[2]
            }
        });
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<Escrow> {
        return this.update(data.params[0], {
            type: data.params[1],
            ratio: {
                buyer: data.params[2],
                seller: data.params[3]
            }
        });
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

}
