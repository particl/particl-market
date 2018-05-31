import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { LockedOutput } from '../models/LockedOutput';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class LockedOutputRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.LockedOutput) public LockedOutputModel: typeof LockedOutput,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<LockedOutput>> {
        const list = await this.LockedOutputModel.fetchAll();
        return list as Bookshelf.Collection<LockedOutput>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<LockedOutput> {
        return this.LockedOutputModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<LockedOutput> {
        const lockedOutput = this.LockedOutputModel.forge<LockedOutput>(data);
        try {
            const lockedOutputCreated = await lockedOutput.save();
            return this.LockedOutputModel.fetchById(lockedOutputCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the lockedOutput!', error);
        }
    }

    public async update(id: number, data: any): Promise<LockedOutput> {
        const lockedOutput = this.LockedOutputModel.forge<LockedOutput>({ id });
        try {
            const lockedOutputUpdated = await lockedOutput.save(data, { patch: true });
            return this.LockedOutputModel.fetchById(lockedOutputUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the lockedOutput!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let lockedOutput = this.LockedOutputModel.forge<LockedOutput>({ id });
        try {
            lockedOutput = await lockedOutput.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await lockedOutput.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the lockedOutput!', error);
        }
    }

}
