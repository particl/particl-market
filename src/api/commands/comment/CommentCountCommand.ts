// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
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
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { CommentCategory } from '../../enums/CommentCategory';
import { CommandParamValidationRules, EnumValidationRule, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';


export class CommentCountCommand extends BaseCommand implements RpcCommandInterface<number> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.CommentService) public commentService: CommentService
    ) {
        super(Commands.COMMENT_COUNT);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new EnumValidationRule('commentType', true, 'CommentType', [CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
                    CommentCategory.PROPOSAL_QUESTION_AND_ANSWERS, CommentCategory.MARKETPLACE_COMMENT, CommentCategory.PRIVATE_MESSAGE] as string[]),
                new StringValidationRule('target', true),
                new StringValidationRule('parentCommentHash', false)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
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
            parentCommentId: parentComment ? parentComment.id : undefined
        } as CommentSearchParams;

        return await this.commentService.count(commentSearchParams);
    }

    /**
     * TODO: the params here might need some rethinking
     *
     * data.params[]:
     *  [0]: type, CommentType
     *  [1]: target
     *  [2]: parentCommentHash, optional
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const parentCommentHash = data.params[2];   // optional

        if (!_.isNil(parentCommentHash) && parentCommentHash.length > 0) {
            data.params[2] = await this.commentService.findOneByHash(parentCommentHash)
                .then(value => value.toJSON())
                .catch(() => {
                    throw new ModelNotFoundException('Comment');
                });
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
