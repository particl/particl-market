import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Escrow } from '../models/Escrow';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class EscrowRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Escrow) public EscrowModel: typeof Escrow,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Escrow>> {
        const list = await this.EscrowModel.fetchAll();
        return list as Bookshelf.Collection<Escrow>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Escrow> {
        return this.EscrowModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<Escrow> {
        const escrow = this.EscrowModel.forge<Escrow>(data);
        try {
            const escrowCreated = await escrow.save();
            return this.EscrowModel.fetchById(escrowCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the escrow!', error);
        }
    }

    public async update(id: number, data: any): Promise<Escrow> {
        const escrow = this.EscrowModel.forge<Escrow>({ id });
        try {
            const escrowUpdated = await escrow.save(data, { patch: true });
            return this.EscrowModel.fetchById(escrowUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the escrow!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let escrow = this.EscrowModel.forge<Escrow>({ id });
        try {
            escrow = await escrow.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await escrow.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the escrow!', error);
        }
    }

}
