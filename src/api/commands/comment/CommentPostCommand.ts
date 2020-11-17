// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { BaseCommand } from '../BaseCommand';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { CommentService } from '../../services/model/CommentService';
import { ProfileService } from '../../services/model/ProfileService';
import { CommentCategory } from '../../enums/CommentCategory';
import { MarketService } from '../../services/model/MarketService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { CommentAddRequest } from '../../requests/action/CommentAddRequest';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { CommentAddActionService } from '../../services/action/CommentAddActionService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { MessageException } from '../../exceptions/MessageException';
import { IdentityService } from '../../services/model/IdentityService';
import { IdentityType } from '../../enums/IdentityType';
import { ProposalService } from '../../services/model/ProposalService';
import {
    CommandParamValidationRules, EnumValidationRule,
    IdValidationRule,
    ParamValidationRule,
    StringValidationRule
} from '../CommandParamValidation';
import {BidRequest} from '../../requests/action/BidRequest';


export class CommentPostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.action.CommentAddActionService) public commentActionService: CommentAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.CommentService) public commentService: CommentService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService
    ) {
        super(Commands.COMMENT_POST);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('identityId', true, this.identityService),
                new EnumValidationRule('commentType', true, 'CommentType', [CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS,
                    CommentCategory.PROPOSAL_QUESTION_AND_ANSWERS, CommentCategory.MARKETPLACE_COMMENT, CommentCategory.PRIVATE_MESSAGE] as string[]),
                new StringValidationRule('receiver', true),
                new StringValidationRule('target', true),
                new StringValidationRule('message', true),
                new StringValidationRule('parentCommentHash', false)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: identity, resources.Identity
     *  [1]: type, CommentType
     *  [2]: receiver
     *  [3]: target
     *  [4]: message
     *  [5]: parentComment, resources.Comment, optional
     *  [6]: market, resources.Market
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<SmsgSendResponse> {

        const identity: resources.Identity = data.params[0];
        const type = CommentCategory[data.params[1]];
        const toAddress = data.params[2];
        const target = data.params[3];
        const message = data.params[4];
        const parentComment = data.params.length > 5 ? data.params[5] : undefined;

        const postRequest = {
            sendParams: {
                wallet: identity.wallet,
                fromAddress: identity.address,   // send from the given identity
                toAddress,
                paid: false,
                daysRetention: parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10),
                estimateFee: false,
                anonFee: false
            } as SmsgSendParams,
            sender: identity,
            receiver: toAddress,
            type,
            target,
            message,
            parentComment
        } as CommentAddRequest;

        return await this.commentActionService.post(postRequest);
    }

    /**
     * data.params[]:
     *  [0]: identityId, number
     *  [1]: type, CommentType (LISTINGITEM_QUESTION_AND_ANSWERS, PROPOSAL_QUESTION_AND_ANSWERS, MARKETPLACE_COMMENT, PRIVATE_MESSAGE)
     *  [2]: receiver, string, this would be the marketReceiveAddress, or when private messaging, the receiving profile or identity address
     *  [3]: target, string, target identifier, when type === LISTINGITEM_QUESTION_AND_ANSWERS -> ListingItem.hash
     *  [4]: message, string
     *  [5]: parentCommentHash, string, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const identity: resources.Identity = data.params[0];
        const type: CommentCategory = data.params[1];
        const receiver = data.params[2];
        const target = data.params[3];
        const message = data.params[4];
        const parentCommentHash = data.params[5];

        // make sure the Identity is of type IdentityType.MARKET
        if (identity.type !== IdentityType.MARKET) {
            throw new InvalidParamException('Identity', 'IdentityType.MARKET');
        }

        // in all of the currently supported CommentTypes, receiver is the marketReceiveAddress
        const market: resources.Market = await this.marketService.findOneByProfileIdAndReceiveAddress(identity.Profile.id, receiver)
            .then(value => value.toJSON())
            .catch(() => {
                throw new ModelNotFoundException('Market');
            });
        data.params[6] = market;

        switch (type) {
            case CommentCategory.LISTINGITEM_QUESTION_AND_ANSWERS:
                await this.listingItemService.findOneByHashAndMarketReceiveAddress(target, market.receiveAddress).then(value => value.toJSON())
                    .catch(() => {
                        throw new ModelNotFoundException('ListingItem');
                    });
                break;
            case CommentCategory.PROPOSAL_QUESTION_AND_ANSWERS:
                // todo: findOneByHashAndMarket
                await this.proposalService.findOneByHash(target).then(value => value.toJSON())
                    .catch(() => {
                        throw new ModelNotFoundException('ListingItem');
                    });
                break;
            case CommentCategory.MARKETPLACE_COMMENT:
                await this.marketService.findOneByProfileIdAndReceiveAddress(identity.Profile.id, target)
                    .then(value => value.toJSON())
                    .catch(() => {
                        throw new ModelNotFoundException('Market');
                    });
                break;
            case CommentCategory.PRIVATE_MESSAGE:
                break;
            default:
                throw new MessageException('CommentType not supported.');

        }

        // make sure Comment with the hash exists
        if (parentCommentHash) {
            data.params[5] = await this.commentService.findOneByHash(parentCommentHash)
                .then(value => value.toJSON())
                .catch(() => {
                    throw new ModelNotFoundException('Comment');
                });
        }

        if (!message || message.trim() === '') {
            throw new MessageException('The Comment text cannot be empty.');
        }

        if (message.length > 1000) {
            throw new MessageException('The maximum length for the Comment text cannot exceed 1000 characters.');
        }

        data.params[0] = identity;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <identityId> <type> <receiver> <target> <message> [parentHash]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <identityId>                 - number, the ID of the Identity. \n'
            + '    <receiver>                   - string, The receiver address. \n'
            + '    <type>                       - CommentType, the type of Comment.\n'
            + '    <target>                     - string, the Comments targets hash. \n'
            + '    <message>                    - string, the message passed in the Comment. \n'
            + '    <parentCommentHash>          - [optional] string, the hash of the parent Comment.\n';
    }

    public description(): string {
        return 'Post a Comment.';
    }

    public example(): string {
        return this.getName() + ' comment post 1 \'pVfK8M2jnyBoAwyWwKv1vUBWat8fQGaJNW\' \'LISTINGITEM_QUESTION_AND_ANSWERS\'' +
            ' \'e1ccdf1201676a0f56aa1c5f5c4c1a9c0cef205c9cf6b51a40a443da5d47aae4\' \'message\'';
    }
}
