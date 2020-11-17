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
import { CommentService } from '../../services/model/CommentService';
import { CommentSearchParams } from '../../requests/search/CommentSearchParams';
import { CommentCategory } from '../../enums/CommentCategory';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ListingItemService } from '../../services/model/ListingItemService';
import { BaseSearchCommand } from '../BaseSearchCommand';
import { CommentSearchOrderField } from '../../enums/SearchOrderField';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { MarketService} from '../../services/model/MarketService';
import { IdentityService } from '../../services/model/IdentityService';
import { MessageException } from '../../exceptions/MessageException';
import { CommandParamValidationRules, EnumValidationRule, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';


export class CommentSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<Comment>> {

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

    /**
     * params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: type, CommentType
     *  [5]: receiver, string (when type === LISTINGITEM_QUESTION_AND_ANSWERS -> Market.receiveAddress)
     *  [6]: target, string, optional (when type === LISTINGITEM_QUESTION_AND_ANSWERS -> ListingItem.hash)
     *  [7]: sender, string
     *  [8]: parentComment, resources.Comment, optional
     *  [9]: ignoreSenders, string[]
     */
    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new EnumValidationRule('commentType', true, 'CommentType', EnumHelper.getValues(CommentCategory) as string[]),
                new StringValidationRule('receiver', true),
                new StringValidationRule('target', false),
                new StringValidationRule('sender', false),
                new StringValidationRule('parentCommentHash', false)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    public getAllowedSearchOrderFields(): string[] {
        return EnumHelper.getValues(CommentSearchOrderField) as string[];
    }

    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Comment>> {

        const type: CommentCategory = data.params[4];
        const receiver: string = data.params[5];
        const target: string = data.params[6];                      // optional
        const sender: string = data.params[7];                      // optional
        const parentComment: resources.Comment = data.params[8];    // optional
        const ignoreSenders: string[] = data.params[9];             // optional

        const searchParams = {
            page: data.params[0],
            pageLimit: data.params[1],
            order: data.params[2],
            orderField: data.params[3],
            type,
            receiver,
            target,
            sender,
            parentCommentId: parentComment ? parentComment.id : undefined,
            ignoreSenders
        } as CommentSearchParams;

        return await this.commentService.search(searchParams);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const type: CommentCategory = data.params[4];
        const receiver: string = data.params[5];
        const target: string = data.params[6];      // optional
        const sender: string = data.params[7];      // optional
        const parentCommentHash = data.params[8];   // optional

        // TODO: add support for other CommentTypes
        if (CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS === type) {

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

        } // else {
        //    throw new MessageException('CommentType not supported.');
        // }

        if (!_.isNil(parentCommentHash) && parentCommentHash.length > 0) {
            // make sure the parent Comment exists
            data.params[7] = await this.commentService.findOneByHash(parentCommentHash)
                .then(value => value.toJSON())
                .catch(() => {
                    throw new ModelNotFoundException('Comment');
                });
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <page> <pageLimit> <order> <orderField> <type> <receiver> [target] [sender] [parentCommentHash] [ignoreSenders]';
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
            + '    <sender>                 - [optional] string - The Comment sender address.\n'
            + '    <parentCommentHash>      - [optional] string - The hash of the parent Comment.\n'
            + '    <ignoreSenders>          - [optional] string[] - Ignore comments from senders.\n';
    }

    public description(): string {
        return 'Search Comments.';
    }

    public example(): string {
        return 'comment ' + this.getName() + ' 0 10 \'ASC\' \'FIELD\' \'LISTINGITEM_QUESTION_AND_ANSWERS\' \'pVfK8M2jnyBoAwyWwKv1vUBWat8fQGaJNW\'';
    }

}
