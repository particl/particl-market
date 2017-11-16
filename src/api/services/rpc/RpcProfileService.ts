import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ProfileService } from '../ProfileService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Profile } from '../../models/Profile';

export class RpcProfileService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType) {
        this.log = new Logger(__filename);
    }

    /**
     * params: none
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Profile>>}
     */
    @validate()
    public async findAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Profile>> {
        return this.profileService.findAll();
    }

    /**
     * data.params[]:
     *  [0]: id or name
     *
     * when data.params[0] is number then findById, else findByName
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async findOne( @request(RpcRequest) data: any): Promise<Profile> {
        if (data.params.length === 0) {
            data.params[0] = 'DEFAULT';
        }

        if (typeof data.params[0] === 'number') {
            return await this.profileService.findOne(data.params[0]);
        } else {
            return await this.profileService.findOneByName(data.params[0]);
        }
    }

    /**
     * data.params[]:
     *  [0]: profile name
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async create( @request(RpcRequest) data: any): Promise<Profile> {
        return this.profileService.create({
            name : data.params[0]
        });
    }

    /**
     * data.params[]:
     *  [0]: profile id
     *  [1]: new name
     *
     * @param data
     * @returns {Promise<Profile>}
     */
    @validate()
    public async update( @request(RpcRequest) data: any): Promise<Profile> {
        return this.profileService.update(data.params[0], {
            name: data.params[1]
        });
    }

    @validate()
    public async destroy( @request(RpcRequest) data: any): Promise<void> {
        return this.profileService.destroy(data.params[0]);
    }

}
