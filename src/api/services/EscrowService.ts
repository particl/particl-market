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


export class EscrowService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.EscrowRepository) public escrowRepo: EscrowRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Escrow>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<Escrow>> {
        return this.escrowRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<Escrow> {
        return this.findOne(data.params[0]);
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
    public async rpcCreate( @request(RpcRequest) data: any): Promise<Escrow> {
        return this.create({
            data: data.params[0] // TODO: convert your params to EscrowCreateRequest
        });
    }

    @validate()
    public async create( @request(EscrowCreateRequest) body: any): Promise<Escrow> {

        // TODO: extract and remove related models from request
        // const escrowRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the escrow
        const escrow = await this.escrowRepo.create(body);

        // TODO: create related models
        // escrowRelated._id = escrow.Id;
        // await this.escrowRelatedService.create(escrowRelated);

        // finally find and return the created escrow
        const newEscrow = await this.findOne(escrow.id);
        return newEscrow;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<Escrow> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to EscrowUpdateRequest
        });
    }

    @validate()
    public async update(id: number, @request(EscrowUpdateRequest) body: any): Promise<Escrow> {

        // find the existing one without related
        const escrow = await this.findOne(id, false);

        // set new values
        escrow.Type = body.type;

        // update escrow record
        const updatedEscrow = await this.escrowRepo.update(id, escrow.toJSON());

        // TODO: yes, this is stupid
        // TODO: find related record and delete it
        // let escrowRelated = updatedEscrow.related('EscrowRelated').toJSON();
        // await this.escrowService.destroy(escrowRelated.id);

        // TODO: recreate related data
        // escrowRelated = body.escrowRelated;
        // escrowRelated._id = escrow.Id;
        // const createdEscrow = await this.escrowService.create(escrowRelated);

        // TODO: finally find and return the updated escrow
        // const newEscrow = await this.findOne(id);
        // return newEscrow;

        return updatedEscrow;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.escrowRepo.destroy(id);
    }

}
