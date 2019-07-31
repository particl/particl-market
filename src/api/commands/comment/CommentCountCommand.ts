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
import { CommentService } from '../../services/model/CommentService';
import { CommentSearchParams } from '../../requests/search/CommentSearchParams';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class CommentCountCommand extends BaseCommand implements RpcCommandInterface<number> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.CommentService) public commentService: CommentService
    ) {
        super(Commands.COMMENT_COUNT);
        this.log = new Logger(__filename);
    }

    /**
     * @param data
     * @returns {Promise<Comment>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<number> {
        const countArgs = {
            type: data.params[0],
            target: data.params[1],
            parentCommentId: data.params[2]
        } as CommentSearchParams;

        return await this.commentService.count(countArgs);
    }

    /**
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('type');
        } else if (data.params.length < 2) {
            throw new MissingParamException('target');
        }

        let parentCommentHash;
        if (data.params.length >= 3) {
            parentCommentHash = data.params[2];
            // Throws NotFoundException
            if (parentCommentHash && parentCommentHash.length > 0) {
                data.params[2] = await this.commentService.findOneByHash(parentCommentHash).then(value => value.toJSON().id)
                    .catch(() => {
                        throw new ModelNotFoundException('Parent Comment');
                    });
            }
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' [<type>] [<target>]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <type>                   - ENUM{LISTINGITEM_QUESTION_AND_ANSWERS} - The type of comment.\n'
            + '    <target>                 - String - The target of the comment.'
            + '    <parentCommentHash>      - [optional] String - The hash of the parent comment.\n';
    }


    public description(): string {
        return 'Count comments with a certain type and target.';
    }

    public example(): string {
        return 'comment ' + this.getName() + ' LISTINGITEM_QUESTION_AND_ANSWERS \'8d5adf3a47bf796a834af487ad4475de4a85306a5a4213e9d761b731b0014c14\'';
    }

}
