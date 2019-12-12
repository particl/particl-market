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

export class CommentPostCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.action.CommentAddActionService) public commentActionService: CommentAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) private identityService: IdentityService,
        @inject(Types.Service) @named(Targets.Service.model.CommentService) public commentService: CommentService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService
    ) {
        super(Commands.COMMENT_POST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: identity, resources.Identity
     *  [1]: receiver
     *  [2]: type, CommentType
     *  [3]: target
     *  [4]: message
     *  [5]: parentComment, resources.Comment, optional
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<SmsgSendResponse>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<SmsgSendResponse> {

        const identity: resources.Identity = data.params[0];
        let toAddress = data.params[1];
        const type  = CommentType[data.params[2]];
        const target = data.params[3];
        const message = data.params[4];
        const parentComment = data.params.length > 5 ? data.params[5] : undefined;

        const fromAddress = identity.address;   // send from the given identity

        const daysRetention: number = parseInt(process.env.FREE_MESSAGE_RETENTION_DAYS, 10);
        const estimateFee = false;

        if (!toAddress) {
            // TODO: if theres no receiver, post to the identity Profiles default Market
            // TODO: perhaps we should rather just throw if receiver === undefined
            const market = await this.marketService.getDefaultForProfile(identity.Profile.id).then(value => value.toJSON());
            toAddress = market.receiveAddress;
        }

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
     *  [1]: receiver, string
     *  [0]: type, CommentType
     *  [3]: target, string
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
            throw new MissingParamException('receiver');
        } else if (data.params.length < 3) {
            throw new MissingParamException('type');
        } else if (data.params.length < 4) {
            throw new MissingParamException('target');
        } else if (data.params.length < 5) {
            throw new MissingParamException('message');
        }

        const identityId = data.params[0];
        const receiver = data.params[1];
        const type = data.params[2];
        const target = data.params[3];
        const message = data.params[4];

        if (typeof identityId !== 'number') {
            throw new InvalidParamException('identityId', 'number');
        } else if (typeof receiver !== 'string') {
            throw new InvalidParamException('receiver', 'string');
        } else if (!EnumHelper.containsName(CommentType, type)) {
            throw new InvalidParamException('type', 'CommentType');
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

        // make sure Identity with the id exists
        const identity: resources.Identity = await this.identityService.findOne(identityId)
            .then(value => value.toJSON())
            .catch(reason => {
                throw new ModelNotFoundException('Identity');
            });
        data.params[0] = identity;

        // make sure Comment with the hash exists
        if (parentHash) {
            data.params[5] = await this.commentService.findOneByHash(parentHash)
                .then(value => value.toJSON())
                .catch(() => {
                    throw new ModelNotFoundException('Comment');
                });
        }

        // make sure ListingItem with the hash exists
        if (type === CommentType.LISTINGITEM_QUESTION_AND_ANSWERS) {
            await this.listingItemService.findOneByHash(target).then(value => value.toJSON())
                .catch(() => {
                    throw new ModelNotFoundException('ListingItem');
                });
        }

        if (!message || message.trim() === '') {
            throw new MessageException('The comment text cannot be empty.');
        }

        if (message.length > 1000) {
            throw new MessageException('The maximum length for the comment text cannot exceed 1000 characters.');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <identityId> <receiver> <type> <target> <message> [parentHash]';
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
        return 'Commands for posting comments.';
    }

    public example(): string {
        return this.getName() + ' comment post 1 \'pVfK8M2jnyBoAwyWwKv1vUBWat8fQGaJNW\' \'LISTINGITEM_QUESTION_AND_ANSWERS\'' +
            ' \'e1ccdf1201676a0f56aa1c5f5c4c1a9c0cef205c9cf6b51a40a443da5d47aae4\' \'testMessage\'';
    }

}
