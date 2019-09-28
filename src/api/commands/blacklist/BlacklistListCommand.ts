import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BlacklistService } from '../../services/model/BlacklistService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Blacklist } from '../../models/Blacklist';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { BlacklistType } from '../../enums/BlacklistType';

export class BlacklistListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Blacklist>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.BlacklistService) private blacklistService: BlacklistService
    ) {
        super(Commands.BLACKLIST_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     *
     * data.params[]:
     *  [0]: type: BlacklistType
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<Bookshelf.Collection<Blacklist>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Bookshelf.Collection<Blacklist>> {
        const type: BlacklistType = data.params[0];
        return await this.blacklistService.findAllByType(type);
    }

    /**
     * data.params[]:
     *  [0]: type: BlacklistType
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('type');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('type', 'string');
        }

        // check for valid enum
        if (!EnumHelper.containsName(BlacklistType, data.params[0])) {
            throw new InvalidParamException('type', 'BlacklistType');
        }
        return data;
    }

    public usage(): string {
        return this.getName() + '<type>';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <type>                      - string, type of hash \n';
    }

    public description(): string {
        return 'List blacklisted hashes.';
    }

    public example(): string {
        return 'blacklist list "MARKET”';
    }
}
