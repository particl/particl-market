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
import { CommentService } from '../../services/CommentService';
import { Comment } from '../../models/Comment';

export class CommentGetCommand extends BaseCommand implements RpcCommandInterface<Comment> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CommentService) public commentService: CommentService
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
        // TODO: this
        return this.commentService.findOne(data.params[0]);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        // TODO: this
        return data;
    }

    public help(): string {
        return this.getName() + ' TODO: (command param help)';
    }

    public description(): string {
        return 'Commands for managing CommentGetCommand.';
    }

    public example(): string {
        return this.getName() + ' TODO: example';
    }
}
