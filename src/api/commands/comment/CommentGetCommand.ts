// Copyright (c) 2017-2020, The Particl Market developers
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
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class CommentGetCommand extends BaseCommand implements RpcCommandInterface<Comment> {

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
            return await this.commentService.findOne(data.params[0])
                .catch(reason => {
                    throw new ModelNotFoundException('Comment');
                });
        } else {
            return await this.commentService.findOneByHash(data.params[0])
                .catch(reason => {
                    throw new ModelNotFoundException('Comment');
                });
        }
    }

    /**
     * data.params[]:
     *  [0]: id or hash
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('id|hash');
        }

        if (typeof data.params[0] !== 'number' && typeof data.params[0] !== 'string') {
            throw new InvalidParamException('id|hash', 'number|string');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <hash> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <hash>              - String - The hash of the Comment we want to retrieve. ';
    }

    public description(): string {
        return 'Get a Comment via hash.';
    }

    public example(): string {
        return 'comment ' + this.getName() + ' d7d3829e4a1acbbc26029f448510f1a684ba3797b95b28ac5a323c37fd69db14';
    }
}
