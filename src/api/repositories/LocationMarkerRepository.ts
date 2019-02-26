// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { LocationMarker } from '../models/LocationMarker';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class LocationMarkerRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.LocationMarker) public LocationMarkerModel: typeof LocationMarker,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<LocationMarker>> {
        const list = await this.LocationMarkerModel.fetchAll();
        return list as Bookshelf.Collection<LocationMarker>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<LocationMarker> {
        return this.LocationMarkerModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<LocationMarker> {
        const locationMarker = this.LocationMarkerModel.forge<LocationMarker>(data);
        try {
            const locationMarkerCreated = await locationMarker.save();
            return this.LocationMarkerModel.fetchById(locationMarkerCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the locationMarker!', error);
        }
    }

    public async update(id: number, data: any): Promise<LocationMarker> {
        const locationMarker = this.LocationMarkerModel.forge<LocationMarker>({ id });
        try {
            const locationMarkerUpdated = await locationMarker.save(data, { patch: true });
            return this.LocationMarkerModel.fetchById(locationMarkerUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the locationMarker!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let locationMarker = this.LocationMarkerModel.forge<LocationMarker>({ id });
        try {
            locationMarker = await locationMarker.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await locationMarker.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the locationMarker!', error);
        }
    }

}
