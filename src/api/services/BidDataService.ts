import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { BidDataRepository } from '../repositories/BidDataRepository';
import { BidData } from '../models/BidData';
import { BidDataCreateRequest } from '../requests/BidDataCreateRequest';
import { BidDataUpdateRequest } from '../requests/BidDataUpdateRequest';


export class BidDataService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.BidDataRepository) public bidDataRepo: BidDataRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<BidData>> {
        return this.bidDataRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<BidData> {
        const bidData = await this.bidDataRepo.findOne(id, withRelated);
        if (bidData === null) {
            this.log.warn(`BidData with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return bidData;
    }

    @validate()
    public async create( @request(BidDataCreateRequest) data: BidDataCreateRequest): Promise<BidData> {

        const body = JSON.parse(JSON.stringify(data));
        this.log.debug('body: ', JSON.stringify(body,null, 2));

        // If the request body was valid we will create the bidData
        const bidData = await this.bidDataRepo.create(body);

        // finally find and return the created bidData
        const newBidData = await this.findOne(bidData.id);
        return newBidData;
    }

    @validate()
    public async update(id: number, @request(BidDataUpdateRequest) body: BidDataUpdateRequest): Promise<BidData> {
        // find the existing one without related
        const bidData = await this.findOne(id, false);

        // set new values
        bidData.DataValue = body.dataValue;
        bidData.DataId = body.dataId;
        // update bidData record
        const updatedBidData = await this.bidDataRepo.update(id, bidData.toJSON());

        return updatedBidData;
    }

    public async destroy(id: number): Promise<void> {
        await this.bidDataRepo.destroy(id);
    }

}
