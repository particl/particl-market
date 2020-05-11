// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Comment } from '../../models/Comment';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { CommentService } from '../../services/model/CommentService';
import { CommentSearchParams } from '../../requests/search/CommentSearchParams';
import { CommentType } from '../../enums/CommentType';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ListingItemService } from '../../services/model/ListingItemService';
import { BaseSearchCommand } from '../BaseSearchCommand';
import { CommentSearchOrderField } from '../../enums/SearchOrderField';
import { EnumHelper } from '../../../core/helpers/EnumHelper';

export class CommentSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<Comment>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.CommentService) public commentService: CommentService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService
    ) {
        super(Commands.COMMENT_SEARCH);
        this.log = new Logger(__filename);
    }

    public getAllowedSearchOrderFields(): string[] {
        return EnumHelper.getValues(CommentSearchOrderField) as string[];
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: type, CommentType
     *  [5]: target, string
     *  [6]: parentComment, resources.Comment
     *  [7]: withRelated, boolean
     *
     * @param data
     * @returns {Promise<Comment>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Comment>> {

        const parentComment: resources.Comment = data.params[6];
        const withRelated = data.params[7];

        const searchParams = {
            page: data.params[0],
            pageLimit: data.params[1],
            order: data.params[2],
            orderField: data.params[3],
            type: data.params[4],
            target: data.params[5],
            parentCommentId: parentComment.id
        } as CommentSearchParams;

        return await this.commentService.search(searchParams, withRelated);
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: type, CommentType
     *  [5]: target, string
     *  [6]: parentCommentHash, string
     *  [7]: withRelated, boolean
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        // type, CommentType
        if (data.params.length >= 5
            && (typeof data.params[4] !== 'string' || !EnumHelper.containsName(CommentType, data.params[4]))) {
            throw new InvalidParamException('type', 'CommentType');
        }

        // target, string
        if (data.params.length >= 6) {
            if (typeof data.params[5] !== 'string') {
                throw new InvalidParamException('target', 'string');
            }

            // make sure the target ListingItem exists
            if (data.params[4] === CommentType.LISTINGITEM_QUESTION_AND_ANSWERS
                && data.params[5]) {
                await this.listingItemService.findOneByHash(data.params[5])
                    .then(value => value.toJSON())
                    .catch(() => {
                        throw new ModelNotFoundException('ListingItem');
                    });
            }
        }

        // parentCommentHash, string
        if (data.params.length >= 7) {
            if (data.params[6] && typeof data.params[6] !== 'string') {
                throw new InvalidParamException('parentCommentHash', 'string');
            }

            if (data.params[6] && data.params[6].length > 0) {
                // make sure the parent Comment exists
                data.params[6] = await this.commentService.findOneByHash(data.params[6])
                    .then(value => value.toJSON())
                    .catch(() => {
                        throw new ModelNotFoundException('Comment');
                    });
            }
        }

        if (data.params.length >= 8 && typeof data.params[7] !== 'boolean') {
            throw new InvalidParamException('withRelated', 'boolean');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + '  <page> <pageLimit> <order> <orderField> [<type> [<target> [<parentCommentHash>]]]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <page>                   - Numeric - The number of result page we want to return. \n'
            + '    <pageLimit>              - Numeric - The number of results per page. \n'
            + '    <order>                  - SearchOrder - The order of the returned results. \n'
            + '    <orderField>             - CommentSearchOrderField - The field to order the results by. \n'
            + '    <type>                   - [optional] CommentType - The type of Comment.\n'
            + '    <target>                 - [optional] String - The target of the Comment.\n'
            + '    <parentCommentHash>      - [optional] String - The hash of the parent Comment.\n';
    }

    public description(): string {
        return 'Search Comments.';
    }

    public example(): string {
        return 'comment ' + this.getName() + ' 0 10 \'ASC\' \'STATE\'';
    }

}
