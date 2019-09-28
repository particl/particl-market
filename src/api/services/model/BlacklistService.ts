import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { BlacklistRepository } from '../../repositories/BlacklistRepository';
import { Blacklist } from '../../models/Blacklist';
import { BlacklistCreateRequest } from '../../requests/model/BlacklistCreateRequest';
import { BlacklistUpdateRequest } from '../../requests/model/BlacklistUpdateRequest';
import {BlacklistType} from '../../enums/BlacklistType';


export class BlacklistService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.BlacklistRepository) public blacklistRepo: BlacklistRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Blacklist>> {
        return this.blacklistRepo.findAll();
    }

    public async findAllByType(type: BlacklistType): Promise<Bookshelf.Collection<Blacklist>> {
        return this.blacklistRepo.findAllByType(type);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Blacklist> {
        const blacklist = await this.blacklistRepo.findOne(id, withRelated);
        if (blacklist === null) {
            this.log.warn(`Blacklist with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return blacklist;
    }

    @validate()
    public async create( @request(BlacklistCreateRequest) data: BlacklistCreateRequest): Promise<Blacklist> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create Blacklist, body: ', JSON.stringify(body, null, 2));

        // If the request body was valid we will create the blacklist
        const blacklist = await this.blacklistRepo.create(body);

        // finally find and return the created blacklist
        const newBlacklist = await this.findOne(blacklist.id);
        return newBlacklist;
    }

    @validate()
    public async update(id: number, @request(BlacklistUpdateRequest) body: BlacklistUpdateRequest): Promise<Blacklist> {

        const blacklist = await this.findOne(id, false);

        // set new values
        blacklist.Type = body.type;
        blacklist.Hash = body.hash;

        const updatedBlacklist = await this.blacklistRepo.update(id, blacklist.toJSON());
        return updatedBlacklist;
    }

    public async destroy(id: number): Promise<void> {
        await this.blacklistRepo.destroy(id);
    }

}
