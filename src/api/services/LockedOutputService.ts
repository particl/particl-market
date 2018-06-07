import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { LockedOutputRepository } from '../repositories/LockedOutputRepository';
import { LockedOutput } from '../models/LockedOutput';
import { LockedOutputCreateRequest } from '../requests/LockedOutputCreateRequest';
import { LockedOutputUpdateRequest } from '../requests/LockedOutputUpdateRequest';
import * as resources from 'resources';
import { CoreRpcService } from './CoreRpcService';


export class LockedOutputService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Repository) @named(Targets.Repository.LockedOutputRepository) public lockedOutputRepo: LockedOutputRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<LockedOutput>> {
        return this.lockedOutputRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<LockedOutput> {
        const lockedOutput = await this.lockedOutputRepo.findOne(id, withRelated);
        if (lockedOutput === null) {
            this.log.warn(`LockedOutput with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return lockedOutput;
    }

    public async findOneByTxId(txid: string, withRelated: boolean = true): Promise<LockedOutput> {
        const lockedOutput = await this.lockedOutputRepo.findOneByTxId(txid, withRelated);
        return lockedOutput;
    }

    @validate()
    public async create( @request(LockedOutputCreateRequest) data: LockedOutputCreateRequest): Promise<LockedOutput> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create LockedOutput, body: ', JSON.stringify(body, null, 2));

        // If the request body was valid we will create the lockedOutput
        const lockedOutput = await this.lockedOutputRepo.create(body).catch(reason => {
            this.log.error('error:', reason);
            throw reason;
        });

        // finally find and return the created lockedOutput
        const newLockedOutput = await this.findOne(lockedOutput.id);
        return newLockedOutput;
    }

    @validate()
    public async update(id: number, @request(LockedOutputUpdateRequest) body: LockedOutputUpdateRequest): Promise<LockedOutput> {

        // find the existing one without related
        const lockedOutput = await this.findOne(id, false);

        // set new values
        lockedOutput.Txid = body.txid;
        lockedOutput.Vout = body.vout;
        lockedOutput.Amount = body.amount;
        lockedOutput.Data = body.data;
        lockedOutput.Address = body.address;
        lockedOutput.ScriptPubKey = body.scriptPubKey;

        // update lockedOutput record
        const updatedLockedOutput = await this.lockedOutputRepo.update(id, lockedOutput.toJSON());
        return updatedLockedOutput;
    }

    public async destroy(id: number): Promise<void> {
        await this.lockedOutputRepo.destroy(id);
    }

    public async createLockedOutputs(outputs: LockedOutputCreateRequest[], bidId: number): Promise<resources.LockedOutput[]> {
        const lockedOutputs: resources.LockedOutput[] = [];
        for (const selectedOutput of outputs) {
            selectedOutput.bid_id = bidId;
            const lockedOutputModel = await this.create(selectedOutput);
            const lockedOutput = lockedOutputModel.toJSON();
            lockedOutputs.push(lockedOutput);
        }
        return lockedOutputs;
    }

    public async destroyLockedOutputs(outputs: resources.LockedOutput[]): Promise<void> {
        for (const selectedOutput of outputs) {
            const lockedOutput = await this.findOneByTxId(selectedOutput.txid);
            await this.destroy(lockedOutput.Id);
        }
    }

    public async lockOutputs(outputs: resources.LockedOutput[]): Promise<boolean> {
        this.log.debug('locking outputs:', JSON.stringify(outputs));
        const locked = await this.coreRpcService.lockUnspent(false, outputs)
            .catch(reason => {
                if (reason.body.error.code === -8) {
                    // "message": "Invalid parameter, output already locked"
                    return true;
                }
                throw reason;
            });
        this.log.debug('outputs locked?', locked);
        return locked;
    }

    public async unlockOutputs(outputs: resources.LockedOutput[]): Promise<boolean> {
        this.log.debug('unlocking outputs:', JSON.stringify(outputs));
        const unlocked = await this.coreRpcService.lockUnspent(true, outputs);
        this.log.debug('outputs unlocked?', unlocked);
        return unlocked;
    }

}
