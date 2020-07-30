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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { CommentService } from '../../services/model/CommentService';
import { ProfileService } from '../../services/model/ProfileService';
import { CommentType } from '../../enums/CommentType';
import { MarketService } from '../../services/model/MarketService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { CommentAddRequest } from '../../requests/action/CommentAddRequest';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { CommentAddActionService } from '../../services/action/CommentAddActionService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { MessageException } from '../../exceptions/MessageException';
import { IdentityService } from '../../services/model/IdentityService';
import { IdentityType } from '../../enums/IdentityType';
import { ProposalService } from '../../services/model/ProposalService';

export class CommentPostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

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
        const type = CommentType[data.params[1]];
        const toAddress = data.params[2];
        const target = data.params[3];
        const message = data.params[4];
        const parentComment = data.params.length > 5 ? data.params[5] : undefined;

        const fromAddress = identity.address;   // send from the given identity

        const daysRetention: number = parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10);
        const estimateFee = false;

        const commentRequest = {
            sendParams: new SmsgSendParams(identity.wallet, fromAddress, toAddress, false, daysRetention, estimateFee),
            sender: identity,
            receiver: toAddress,
            type,
            target,
            message,
            parentComment
        } as CommentAddRequest;

        return await this.commentActionService.send(commentRequest);
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

        if (data.params.length < 1) {
            throw new MissingParamException('identityId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('type');
        } else if (data.params.length < 3) {
            throw new MissingParamException('receiver');
        } else if (data.params.length < 4) {
            throw new MissingParamException('target');
        } else if (data.params.length < 5) {
            throw new MissingParamException('message');
        }

        const identityId = data.params[0];
        const type = data.params[1];
        const receiver = data.params[2];
        const target = data.params[3];
        const message = data.params[4];

        if (typeof identityId !== 'number') {
            throw new InvalidParamException('identityId', 'number');
        } else if (!EnumHelper.containsName(CommentType, type)) {
            throw new InvalidParamException('type', 'CommentType');
        } else if (typeof receiver !== 'string') {
            throw new InvalidParamException('receiver', 'string');
        } else if (typeof target !== 'string') {
            throw new InvalidParamException('target', 'string');
        } else if (typeof message !== 'string') {
            throw new InvalidParamException('message', 'string');
        }

        let parentHash;
        if (data.params.length > 5) {
            parentHash = data.params[5];
            if (typeof parentHash !== 'string') {
                throw new InvalidParamException('parentCommentHash', 'string');
            }
        }

        // make sure Identity with the id exists, and that the Identity is linked to a Market
        const identity: resources.Identity = await this.identityService.findOne(identityId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Identity');
            });

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
            case CommentType.LISTINGITEM_QUESTION_AND_ANSWERS:
                await this.listingItemService.findOneByHashAndMarketReceiveAddress(target, market.receiveAddress).then(value => value.toJSON())
                    .catch(() => {
                        throw new ModelNotFoundException('ListingItem');
                    });
                break;
            case CommentType.PROPOSAL_QUESTION_AND_ANSWERS:
                // todo: findOneByHashAndMarket
                await this.proposalService.findOneByHash(target).then(value => value.toJSON())
                    .catch(() => {
                        throw new ModelNotFoundException('ListingItem');
                    });
                break;
            case CommentType.MARKETPLACE_COMMENT:
                await this.marketService.findOneByProfileIdAndReceiveAddress(identity.Profile.id, target)
                    .then(value => value.toJSON())
                    .catch(() => {
                        throw new ModelNotFoundException('Market');
                    });
                break;
            default:
                throw new MessageException('Only CommentType.LISTINGITEM_QUESTION_AND_ANSWERS is supported.');

        }

        // make sure Comment with the hash exists
        if (parentHash) {
            data.params[5] = await this.commentService.findOneByHash(parentHash)
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
            + '    <identityId>             - Numeric - The id of the Identity. \n'
            + '    <receiver>               - String - The receiver address. \n'
            + '    <type>                   - ENUM{LISTINGITEM_QUESTION_AND_ANSWERS} - The type of Comment.\n'
            + '    <target>                 - String - The Comments targets hash. \n'
            + '    <message>                - String - The message passed in the Comment. \n'
            + '    <parentHash>             - [optional] String - The hash of the parent Comment.\n';
    }

    public description(): string {
        return 'Post a Comment.';
    }

    public example(): string {
        return this.getName() + ' comment post 1 \'pVfK8M2jnyBoAwyWwKv1vUBWat8fQGaJNW\' \'LISTINGITEM_QUESTION_AND_ANSWERS\'' +
            ' \'e1ccdf1201676a0f56aa1c5f5c4c1a9c0cef205c9cf6b51a40a443da5d47aae4\' \'message\'';
    }

}
