// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { ObjectHash } from '../../core/helpers/ObjectHash';
import { HashableObjectType } from '../enums/HashableObjectType';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ValidationException } from '../exceptions/ValidationException';
import { Comment } from '../models/Comment';
import { CommentRepository } from '../repositories/CommentRepository';
import { CommentCreateRequest } from '../requests/CommentCreateRequest';
import { CommentUpdateRequest } from '../requests/CommentUpdateRequest';
import {CommentSearchParams} from '../requests/CommentSearchParams';

export class CommentService {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Repository) @named(Targets.Repository.CommentRepository) public commentRepo: CommentRepository
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Comment>> {
        return await this.commentRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Comment> {
        const comment = await this.commentRepo.findOne(id, withRelated);
        if (comment === null) {
            this.log.warn(`Comment with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return comment;
    }

    public async findAllByCommentorsAndCommentHash(addresses: string[], hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Comment>> {
        return await this.commentRepo.findAllByCommentorsAndCommentHash(addresses, hash, withRelated);
    }

    public async findOneByHash(marketId: number, hash: string, withRelated: boolean = true): Promise<Comment> {
        const comment = await this.commentRepo.findOneByHash(marketId, hash, withRelated);
        if (comment === null) {
            this.log.warn(`Comment with the marketId=${marketId} & hash=${hash} was not found!`);
            throw new NotFoundException(hash);
        }
        return comment;
    }

    /**
     * searchBy Comment using given CommentSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<Comment>>}
     */
    @validate()
    public async search(@request(CommentSearchParams) options: CommentSearchParams, withRelated: boolean = true): Promise<Bookshelf.Collection<Comment>> {
        return await this.commentRepo.search(options, withRelated);
    }

    @validate()
    public async create(@request(CommentCreateRequest) data: CommentCreateRequest): Promise<Comment> {

        const body = JSON.parse(JSON.stringify(data));
        body.hash = ObjectHash.getHash(body, HashableObjectType.COMMENT_CREATEREQUEST);
        body.createdAt = new Date().getTime();
        body.updatedAt = new Date().getTime();

        // this.log.debug('create Comment, body: ', JSON.stringify(body, null, 2));
        const comment = await this.commentRepo.create(body);

        // finally find and return the created comment
        return await this.findOne(comment.Id);
    }

    @validate()
    public async update(id: number, @request(CommentUpdateRequest) data: CommentUpdateRequest): Promise<Comment> {

        // find the existing one without related
        const comment = await this.findOne(id, false);

        const body = JSON.parse(JSON.stringify(data));
        body.hash = ObjectHash.getHash(body, HashableObjectType.COMMENT_CREATEREQUEST);

        // set new values
        comment.set('hash', body.hash);
        comment.set('sender', body.sender);
        comment.set('receiver', body.receiver);
        comment.set('target', body.target);
        comment.set('message', body.message);
        comment.set('type', body.type);

        comment.set('postedAt', body.postedAt);
        comment.set('receivedAt', body.receivedAt);
        comment.set('expiredAt', body.expiredAt);

        return await this.commentRepo.update(id, comment.toJSON());
    }

    public async destroy(id: number): Promise<void> {
        await this.commentRepo.destroy(id);
    }
}
