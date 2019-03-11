import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Comment } from '../../models/Comment';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import {MissingParamException} from '../../exceptions/MissingParamException';
import {InvalidParamException} from '../../exceptions/InvalidParamException';
import {CommentType} from '../../enums/CommentType';
import {SearchOrder} from '../../enums/SearchOrder';
import {MarketService} from '../../services/MarketService';
import {CommentSearchParams} from '../../requests/CommentSearchParams';
import {CommentService} from '../../services/CommentService';

export class CommentSearchCommand extends BaseCommand implements RpcCommandInterface<Comment> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CommentService) public commentService: CommentService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService
    ) {
        super(Commands.COMMENT_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        const searchArgs = {
            marketId: data.params[0]
        } as CommentSearchParams;

        if (typeof data.params[1] === 'number') {
            searchArgs.page = data.params[1];
            searchArgs.pageLimit = data.params[2];
            searchArgs.order = data.params[3];
            searchArgs.orderField = data.params[4];
            searchArgs.type = data.params[5];
            searchArgs.target = data.params[6];
        } else {
            searchArgs.commentHash = data.params[1];
            searchArgs.order = SearchOrder.ASC;
        }

        this.log.error('1000:');
        try {
            return await this.commentService.search(searchArgs);
        } catch (ex) {
            this.log.error(JSON.stringify(ex, null, 2));
            throw ex;
        }
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('marketId');
        }

        const marketId = data.params[0];
        if (typeof marketId !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        }

        if (data.params.length >= 2) {
            const hashOrPage = data.params[1];
            if (typeof hashOrPage === 'number') {
                // It's a page
                if (hashOrPage < 0) {
                    throw new InvalidParamException('page', 'number');
                }
            } else if (typeof hashOrPage === 'string') {
                // It's a commentHash
                await this.validateHash(data);
            } else {
                throw new InvalidParamException('commentHash|page', 'string|number');
            }
        }

        // check market exists
        // Throws NotFoundException
        await this.marketService.findOne(marketId);

        return data;
    }

    public async validateHash(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length >= 3) {
            const pageLimit = data.params[2];
            if (typeof pageLimit !== 'number' || pageLimit <= 0) {
                throw new InvalidParamException('pageLimit', 'number');
            }
        }
        if (data.params.length >= 4) {
            const order = data.params[3];
            if (typeof order !== 'string' || !SearchOrder[order]) {
                throw new InvalidParamException('order', 'SearchOrder');
            }
        }

        if (data.params.length >= 5) {
            const orderField = data.params[4];
            if (typeof orderField !== 'string'
                && !(orderField === 'id'
                    || orderField === 'hash'
                    || orderField === 'sender'
                    || orderField === 'receiver'
                    || orderField === 'target'
                    || orderField === 'message'
                    || orderField === 'type'
                    || orderField === 'postedAt'
                    || orderField === 'receivedAt'
                    || orderField === 'expiredAt'
                    || orderField === 'updatedAt'
                    || orderField === 'createdAt'
                    || orderField === 'parent_comment_id'
                    || orderField === 'market_id')) {
                throw new InvalidParamException('orderField', 'string');
            }
        }

        if (data.params.length >= 5) {
            const type = data.params[4];
            if (typeof type !== 'string' || !CommentType[type]) {
                throw new InvalidParamException('type', 'CommentType');
            }
        }

        if (data.params.length >= 6) {
            const target = data.params[5];
            if (typeof target !== 'string') {
                throw new InvalidParamException('target', 'string');
            }
        }
        return data;
    }

    public help(): string {
        return this.getName() + 'search <marketId> (<commentHash> | [<page> [<pageLimit> [<order> [<orderField> [<type> [<target>]]]]]])';
    }

    public description(): string {
        return 'Commands for searching comments.';
    }

    public example(): string {
        return this.getName() + ' TODO: example';
    }
}
