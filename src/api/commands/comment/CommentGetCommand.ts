// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { CommentService } from '../../services/model/CommentService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Comment } from '../../models/Comment';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';

export class CommentGetCommand extends BaseCommand implements RpcCommandInterface<Comment> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.CommentService) public commentService: CommentService
    ) {
        super(Commands.COMMENT_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: id or hash
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<Comment>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Comment> {
        if (typeof data.params[0] === 'number') {
            return await this.commentService.findOne(data.params[0]);
        } else {
            return await this.commentService.findOneByHash(data.params[0]);
        }
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('id or hash');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' [<commenId>|<hash>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <commenId>          - [optional] Numeric - The ID of the comment we want to retrieve. \n'
            + '    <hash>              - [optional] String - The hash of the comment we want to retrieve. ';
    }

    public description(): string {
        return 'Get a comment via commentId or hash.';
    }

    public example(): string {
        return 'comment ' + this.getName() + ' d7d3829e4a1acbbc26029f448510f1a684ba3797b95b28ac5a323c37fd69db14';
    }
}
