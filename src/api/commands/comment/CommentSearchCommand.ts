// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { Comment } from '../../models/Comment';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { CommentService } from '../../services/model/CommentService';
import { CommentSearchParams } from '../../requests/search/CommentSearchParams';
import { SearchOrder } from '../../enums/SearchOrder';
import { CommentType } from '../../enums/CommentType';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ListingItemService } from '../../services/model/ListingItemService';

export class CommentSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Comment>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.CommentService) public commentService: CommentService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService
    ) {
        super(Commands.COMMENT_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * @param data
     * @returns {Promise<Comment>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Comment>> {
        const searchArgs = {} as CommentSearchParams;

        let withRelated;
        if (typeof data.params[0] === 'number') {
            searchArgs.page = data.params[0];
            searchArgs.pageLimit = data.params[1];
            const order: string = data.params[2];
            searchArgs.order = SearchOrder[order] || SearchOrder.ASC;
            searchArgs.orderField = data.params[3];
            searchArgs.type = data.params[4];
            searchArgs.target = data.params[5];
            withRelated = data.params[6];
        } else {
            searchArgs.commentHash = data.params[0];
            searchArgs.order = SearchOrder.ASC;
            withRelated = data.params[1];
        }

        return await this.commentService.search(searchArgs, withRelated);
    }

    /**
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length >= 2) {
            const hashOrPage = data.params[0];
            if (typeof hashOrPage === 'number') {
                // It's a page
                if (hashOrPage < 0) {
                    throw new InvalidParamException('page', 'number');
                }
                await this.validatePage(data);
            } else if (typeof hashOrPage === 'string') {
                // It's a commentHash
            } else {
                throw new InvalidParamException('hash|page', 'string|number');
            }
        }
        return data;
    }

    public async validatePage(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length >= 2) {
            const pageLimit = data.params[1];
            if (typeof pageLimit !== 'number' || pageLimit <= 0) {
                throw new InvalidParamException('pageLimit', 'number');
            }
        }
        if (data.params.length >= 3) {
            const order = data.params[2];
            if (typeof order !== 'string' || !SearchOrder[order]) {
                throw new InvalidParamException('order', 'SearchOrder');
            }
        }

        if (data.params.length >= 4) {
            const orderField = data.params[3];
            if (typeof orderField !== 'string'
                || !(orderField === 'id'
                    || orderField === 'hash'
                    || orderField === 'sender'
                    || orderField === 'receiver'
                    || orderField === 'target'
                    || orderField === 'message'
                    || orderField === 'type'
                    || orderField === 'posted_at'
                    || orderField === 'received_at'
                    || orderField === 'expired_at'
                    || orderField === 'updated_at'
                    || orderField === 'created_at'
                    || orderField === 'parent_comment_id'
                    || orderField === 'market_id')) {
                throw new InvalidParamException('orderField', 'string');
            }
        }

        let type;
        if (data.params.length >= 5) {
            type = data.params[4];
            if (typeof type !== 'string' || !CommentType[type]) {
                throw new InvalidParamException('type', 'CommentType');
            }
        }

        let target;
        if (data.params.length >= 6) {
            target = data.params[5];
            if (typeof target !== 'string') {
                throw new InvalidParamException('target', 'string');
            }
        }

        if (type === CommentType.LISTINGITEM_QUESTION_AND_ANSWERS && target) {
            await this.listingItemService.findOneByHash(target).then(value => value.toJSON())
                .catch(() => {
                    throw new ModelNotFoundException('Listing Item');
                });
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' (<commentHash> [<withRelated>]| [<page> [<pageLimit> [<order> [<orderField> [<type> [<target> [<withRelated>]]]]]]])';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <commentHash>            - String - The comments hash.\n'
            + '    <page>                   - [optional] Numeric - The number page we want to \n'
            + '                                view of searchBy comment results.\n'
            + '    <pageLimit>              - [optional] Numeric - The number of results per page.\n'
            + '    <order>                  - [optional] ENUM{ASC,DESC} - The ordering of the searchBy results. \n'
            + '    <orderField>             - [optional] The field to order the results by. \n'
            + '    <type>                   - [optional] ENUM{LISTINGITEM_QUESTION_AND_ANSWERS} - The type of comment.\n'
            + '    <target>                 - [optional] String - The target of the comment.\n'
            + '    <withRelated>            - [optional] Boolean - Whether to include related data or not (default: true). ';
    }


    public description(): string {
        return 'Search comments with the comment hash, or the page, page limit, order, order field, type, target and with related.';
    }

    public example(): string {
        return 'comment ' + this.getName() + ' commentHash \'8d5adf3a47bf796a834af487ad4475de4a85306a5a4213e9d761b731b0014c14\'';
    }

}
