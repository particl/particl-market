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
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { BaseCommand } from '../BaseCommand';
import { Command } from '../Command';

import { NotImplementedException } from '../../exceptions/NotImplementedException';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { NotFoundException } from '../../exceptions/NotFoundException';

import { Comment } from '../../models/Comment';
import { CommentService } from '../../services/CommentService';
import { CommentActionService } from '../../services/CommentActionService';
import { MarketService } from '../../services/MarketService';
import { ProfileService } from '../../services/ProfileService';
import { CommentCreateRequest } from '../../requests/CommentCreateRequest';
import { CommentMessageType } from '../../enums/CommentMessageType';

export class CommentPostCommand extends BaseCommand implements RpcCommandInterface<Comment> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.CommentActionService) public commentActionService: CommentActionService,
        @inject(Types.Service) @named(Targets.Service.CommentService) public commentService: CommentService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService
    ) {
        super(Commands.COMMENT_POST);
        this.log = new Logger(__filename);
    }

    /**
     * command description
     *
     * @param data, RpcRequest
     * @param rpcCommandFactory, RpcCommandFactory
     * @returns {Promise<any>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any> {
        const marketId = data.params[0];
        const market = await this.marketService.findOne(marketId);
        const marketHash = market.Address;

        const profileId = data.params[1];
        const senderProfile = await this.profileService.findOne(profileId);
        const profileAddress = senderProfile.Address;

        const type = data.params[2];
        const target = data.params[3];
        const parentHash = data.params[5];
        const message = data.params[4];
        const commentRequest = {
            action: type,
            sender: profileAddress,
            marketHash,
            target,
            parentHash,
            message
        } as CommentCreateRequest;

        return await this.commentActionService.send(commentRequest);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('marketId');
        }
        if (data.params.length < 2) {
            throw new MissingParamException('profileId');
        }
        if (data.params.length < 3) {
            throw new MissingParamException('type');
        }
        if (data.params.length < 4) {
            throw new MissingParamException('target');
        }
        if (data.params.length < 5) {
            throw new MissingParamException('message');
        }

        const marketId = data.params[0];
        if (typeof marketId !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        }
        const profileId = data.params[1];
        if (typeof profileId !== 'number') {
            throw new InvalidParamException('profileId', 'number');
        }
        const type = data.params[2];
        if (typeof type !== 'string' || !CommentMessageType[type]) {
            throw new InvalidParamException('type', 'CommentMessageType');
        }

        const target = data.params[3];
        if (typeof target !== 'string') {
            throw new InvalidParamException('target', 'string');
        }

        const message = data.params[4];
        if (typeof message !== 'string') {
            throw new InvalidParamException('message', 'string');
        }

        let parentHash;
        if (data.params.length > 5) {
            parentHash = data.params[5];
            if (typeof parentHash !== 'string') {
                throw new InvalidParamException('parentHash', 'string');
            }
        }

        // Throws NotFoundException
        this.profileService.findOne(profileId);

        // Throws NotFoundException
        this.marketService.findOne(marketId);

        // Throws NotFoundException
        if (parentHash) {
            this.commentService.findOneByHash(parentHash);
        }

        return data;
    }

    public help(): string {
        return this.getName() + ' post <marketId> <profileId> <type> <target> <message> [<parentHash>]';
    }

    public description(): string {
        return 'Commands for posting comments.';
    }

    public example(): string {
        return this.getName() + ' comment post 1 1 MP_COMMENT_ADD pjT82w4qurXyr6wXur3aUwwUmWjafEKpLk \'testMessage\'';
    }
}
