// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { MarketService} from '../../services/model/MarketService';
import { IdentityService } from '../../services/model/IdentityService';
import { MessageException } from '../../exceptions/MessageException';


export class CommentSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<Comment>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.CommentService) public commentService: CommentService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) public identityService: IdentityService,
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
     *  [4]: type, CommentType (only LISTINGITEM_QUESTION_AND_ANSWERS supported for now)
     *  [5]: receiver, string (when type === LISTINGITEM_QUESTION_AND_ANSWERS -> Market.receiveAddress)
     *  [6]: target, string, optional (when type === LISTINGITEM_QUESTION_AND_ANSWERS -> ListingItem.hash)
     *  [7]: parentComment, resources.Comment, optional
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Comment>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Comment>> {

        const parentComment: resources.Comment = data.params[7];

        const searchParams = {
            page: data.params[0],
            pageLimit: data.params[1],
            order: data.params[2],
            orderField: data.params[3],
            type: data.params[4],
            receiver: data.params[5],
            target: data.params[6],
            parentCommentId: parentComment ? parentComment.id : undefined

        } as CommentSearchParams;

        return await this.commentService.search(searchParams);
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: type, CommentType (LISTINGITEM_QUESTION_AND_ANSWERS)
     *  [5]: receiver, string, this would be the marketReceiveAddress, or when private messaging, the receiving profile address
     *  [6]: target, string, optional, when type === LISTINGITEM_QUESTION_AND_ANSWERS, ListingItem.hash
     *  [7]: parentCommentHash, string, optional
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        // type && receiver is not optional
        if (data.params.length < 5) {
            throw new MissingParamException('type');
        } else if (data.params.length < 6) {
            throw new MissingParamException('receiver');
        }

        const type = data.params[4];
        const receiver = data.params[5];
        const target = data.params[6];              // optional
        const parentCommentHash = data.params[7];   // optional

        if (!EnumHelper.containsName(CommentType, type)) {
            throw new InvalidParamException('type', 'CommentType');
        } else if (typeof receiver !== 'string') {
            throw new InvalidParamException('receiver', 'string');
        }

        // target, string
        if (data.params.length >= 7 && typeof target !== 'string') {
            throw new InvalidParamException('target', 'string');
        }

        if (CommentType.LISTINGITEM_QUESTION_AND_ANSWERS === type) {

            // make sure given the receiver (Market), exists
            await this.marketService.findAllByReceiveAddress(receiver)
                .then(value => {
                    const markets: resources.Market[] = value.toJSON();
                    if (_.isEmpty(markets)) {
                        throw new ModelNotFoundException('Market');
                    }
                })
                .catch(() => {
                    throw new ModelNotFoundException('Market');
                });

            // ...and if target is given, make sure the ListingItem with the hash exists
            if (target) {
                await this.listingItemService.findOneByHashAndMarketReceiveAddress(target, receiver)
                    .then(value => value.toJSON())
                    .catch(() => {
                        throw new ModelNotFoundException('ListingItem');
                    });
            }

        } else {
            throw new MessageException('Only CommentType.LISTINGITEM_QUESTION_AND_ANSWERS is supported.');
        }

        // parentCommentHash, string
        if (data.params.length >= 8) {
            if (parentCommentHash && typeof parentCommentHash !== 'string') {
                throw new InvalidParamException('parentCommentHash', 'string');
            }

            if (parentCommentHash && parentCommentHash.length > 0) {
                // make sure the parent Comment exists
                data.params[7] = await this.commentService.findOneByHash(parentCommentHash)
                    .then(value => value.toJSON())
                    .catch(() => {
                        throw new ModelNotFoundException('Comment');
                    });
            }
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <page> <pageLimit> <order> <orderField> <type> <receiver> [target] [parentCommentHash]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <page>                   - number - The number of result page we want to return. \n'
            + '    <pageLimit>              - number - The number of results per page. \n'
            + '    <order>                  - SearchOrder - The order of the returned results. \n'
            + '    <orderField>             - CommentSearchOrderField - The field to order the results by. \n'
            + '    <type>                   - CommentType - The type of Comment.\n'
            + '    <receiver>               - string - The receiver of the Comment (Market receiveAddress for example).\n'
            + '    <target>                 - [optional] string - The target of the Comment (ListingItem hash for example).\n'
            + '    <parentCommentHash>      - [optional] string - The hash of the parent Comment.\n';
    }

    public description(): string {
        return 'Search Comments.';
    }

    public example(): string {
        return 'comment ' + this.getName() + ' 0 10 \'ASC\' \'FIELD\' \'LISTINGITEM_QUESTION_AND_ANSWERS\' \'pVfK8M2jnyBoAwyWwKv1vUBWat8fQGaJNW\'';
    }

}
