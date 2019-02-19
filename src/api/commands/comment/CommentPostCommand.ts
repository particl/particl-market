import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { CommentService } from '../../services/CommentService';
import { RpcRequest } from '../../requests/RpcRequest';
import { CommentPost } from '../../models/CommentPost';
import { RpcCommandInterface } from './RpcCommandInterface';
import { Commands } from './CommandEnumType';
import { BaseCommand } from './BaseCommand';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import { MissingParamException } from '../exceptions/MissingParamException';
import { InvalidParamException } from '../exceptions/InvalidParamException';
import { NotFoundException } from '../exceptions/NotFoundException';

import { Comment } from '../models/Comment';
import { CommentService } from '../repositories/CommentService';
import { CommentCreateRequest } from '../requests/CommentCreateRequest';
import { CommentMessageType } from '../enums/CommentMessageType';

export class CommentPostCommand extends BaseCommand implements RpcCommandInterface<CommentPost> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CommentDataService) public commentDataService: CommentDataService,
        @inject(Types.Service) @named(Targets.Service.CommentService) public commentService: CommentService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService
    ) {
        super(Commands.COMMENT_POST);
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
        const commentRequest = {
        } as CommentCreateRequest;

        this.commentDataService.send(commentRequest);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('marketId');
        }
        const marketId = data.params[2];
        if (typeof marketId !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        }

        if (data.params.length < 2) {
            throw new MissingParamException('parentHash|profileId');
        }
        const unknownArg = data.params[1];
        let parentHash;
        if (typeof unknownArg === 'number') {
            const profileId = unknownArg;
            if (data.params.length < 3) {
                throw new MissingParamException('type');
            }
            if (data.params.length < 4) {
                throw new MissingParamException('target');
            }
            if (data.params.length < 5) {
                throw new MissingParamException('message');
            }
            if (data.params.length > 5) {
                parentHash = data.params[5];
                if (typeof parentHash !== 'string') {
                    throw new InvalidParamException('parentHash', 'string');
                }
            }

            const type = data.params[2];
            if (typeof type !== 'string' || !CommentMessageType[type]) {
                throw new InvalidParamException('type', 'CommentMessageType');
            }

            const target = data.params[3];
            if (typeof target !== 'string') {
                throw new InvalidParamException('target', 'string');
            }

            const message = data.params[4];
            if (typeof message !== 'string') {
                throw new InvalidParamException('message', 'string');
            }

            // TODO: Check profile with profileId exists
            // Throws NotFoundException
            this.profileService.findOne(profileId);

            // TODO: Check market with marketId exists
            // Throws NotFoundException
            this.marketService.findOne(marketId);
        } else if (typeof unknownArg === 'string') {
            parentHash = unknownArg;
        } else {
            throw new InvalidParamException('marketId');
        }

        // TODO: Check parent comment exists
        // Throws NotFoundException
        this.commentService.findOneByHash(parentHash);

        return data;
    }

    public help(): string {
        return this.getName() + ' post <marketId> (<parentHash> | <profileId> <type> <target> <message> [<parentHash>])';
    }

    public description(): string {
        return 'Commands for posting comments.';
    }

    public example(): string {
        return this.getName() + ' post example';
    }
}
