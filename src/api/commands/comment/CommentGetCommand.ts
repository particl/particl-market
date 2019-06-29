// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { NotImplementedException } from '../../exceptions/NotImplementedException';
import { CommentService } from '../../services/model/CommentService';
import { Comment } from '../../models/Comment';
import {MissingParamException} from '../../exceptions/MissingParamException';
import {InvalidParamException} from '../../exceptions/InvalidParamException';
import {MarketService} from '../../services/MarketService';

export class CommentGetCommand extends BaseCommand implements RpcCommandInterface<Comment> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CommentService) public commentService: CommentService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService
    ) {
        super(Commands.COMMENT_GET);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<Comment>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<Comment> {
        const id = data.params[0];
        const commentHash = data.params[1];
        if (!commentHash) {
            return await this.commentService.findOne(id);
        } else {
            return await this.commentService.findOneByHash(id, commentHash);
        }
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('commentId|marketId');
        }
        const id = data.params[0];
        if (typeof id !== 'number') {
            throw new InvalidParamException('commentId|marketId', 'number');
        }
        if (data.params.length >= 2) {
            const commentHash = data.params[1];
            if (typeof commentHash !== 'string') {
                throw new InvalidParamException('commentHash', 'string');
            }

            // Check market exists (Throws NotFoundException)
            await this.marketService.findOne(id);
        }
        return data;
    }

    public help(): string {
        return this.getName() + ' (<commentId> | <marketId> <commentHash>)';
    }

    public description(): string {
        return 'Commands for managing CommentGetCommand.';
    }

    public example(): string {
        return this.getName() + ' TODO: example';
    }
}
