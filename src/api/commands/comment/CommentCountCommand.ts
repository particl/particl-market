// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
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
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { CommentType } from '../../enums/CommentType';

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
     * data.params[]:
     *  [0]: type, CommentType
     *  [1]: target
     *  [2]: parentComment: resources.Comment, optional
     *
     * @param data
     * @returns {Promise<Comment>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<number> {
        const parentComment: resources.Comment = data.params[2];

        const commentSearchParams = {
            type: data.params[0],
            target: data.params[1],
            parentCommentId: parentComment.id
        } as CommentSearchParams;

        return await this.commentService.count(commentSearchParams);
    }

    /**
     * data.params[]:
     *  [0]: type, CommentType
     *  [1]: target
     *  [2]: parentHash, optional
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('type');
        } else if (data.params.length < 2) {
            throw new MissingParamException('target');
        }

        if (!EnumHelper.containsName(CommentType, data.params[0])) {
            throw new InvalidParamException('type', 'CommentType');
        } else if (data.params[1] && typeof data.params[1] !== 'string') {
            throw new InvalidParamException('target', 'string');
        }

        let parentHash;
        if (data.params.length >= 3) {
            parentHash = data.params[2];

            if (data.params[2] && typeof data.params[2] !== 'string') {
                throw new InvalidParamException('parentHash', 'string');
            }

            if (parentHash && parentHash.length > 0) {
                data.params[2] = await this.commentService.findOneByHash(parentHash)
                    .then(value => value.toJSON())
                    .catch(() => {
                        throw new ModelNotFoundException('Comment');
                    });
            }
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <type> <target> [parentCommentHash]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <type>                   - ENUM{LISTINGITEM_QUESTION_AND_ANSWERS} - The type of Comment.\n'
            + '    <target>                 - String - The target of the Comment.'
            + '    <parentHash>             - [optional] String - The hash of the parent Comment.\n';
    }


    public description(): string {
        return 'Count comments with a certain type and target.';
    }

    public example(): string {
        return 'comment ' + this.getName() + ' LISTINGITEM_QUESTION_AND_ANSWERS \'8d5adf3a47bf796a834af487ad4475de4a85306a5a4213e9d761b731b0014c14\'';
    }

}
