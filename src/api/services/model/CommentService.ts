// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { validate, request } from '../../../core/api/Validate';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { CommentRepository } from '../../repositories/CommentRepository';
import { Comment } from '../../models/Comment';
import { CommentCreateRequest } from '../../requests/model/CommentCreateRequest';
import { CommentUpdateRequest } from '../../requests/model/CommentUpdateRequest';
import { CommentSearchParams } from '../../requests/search/CommentSearchParams';


export class CommentService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.CommentRepository) public commentRepo: CommentRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Comment>> {
        return this.commentRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Comment> {
        const comment = await this.commentRepo.findOne(id, withRelated);
        if (comment === null) {
            this.log.warn(`Comment with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return comment;
    }

    public async findAllByTypeTarget(type: string, target: string): Promise<Bookshelf.Collection<Comment>> {
        return this.commentRepo.findAllByTypeTarget(type, target);
    }

    public async findAllByCommentorsAndCommentHash(addresses: string[], hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Comment>> {
        return await this.commentRepo.findAllByCommentorsAndCommentHash(addresses, hash, withRelated);
    }

    public async findOneByHash(hash: string, withRelated: boolean = true): Promise<Comment> {
        const comment = await this.commentRepo.findOneByHash(hash, withRelated);
        if (comment === null) {
            this.log.warn(`Comment with the hash=${hash} was not found!`);
            throw new NotFoundException(hash);
        }
        return comment;
    }

    /**
     * searchBy Comments using given CommentSearchParams
     *
     * @param {CommentSearchParams} options
     * @param {boolean} withRelated
     * @returns {Promise<Bookshelf.Collection<Comment>>}
     */
    @validate()
    public async search(@request(CommentSearchParams) options: CommentSearchParams,
                        withRelated: boolean = true): Promise<Bookshelf.Collection<Comment>> {
        this.log.debug('searchBy(), options: ', JSON.stringify(options, null, 2));
        return await this.commentRepo.search(options, withRelated);
    }

    @validate()
    public async count(@request(CommentSearchParams) options: CommentSearchParams): Promise<number> {
        this.log.debug('count(), options: ', JSON.stringify(options, null, 2));
        return await this.commentRepo.count(options);
    }

    @validate()
    public async create( @request(CommentCreateRequest) data: CommentCreateRequest): Promise<Comment> {

        const body = JSON.parse(JSON.stringify(data));
        // this.log.debug('create Comment, body: ', JSON.stringify(body, null, 2));

        // If the request body was valid we will create the comment
        const comment = await this.commentRepo.create(body);

        // finally find and return the created comment
        const newComment = await this.findOne(comment.id);
        return newComment;
    }

    @validate()
    public async update(id: number, @request(CommentUpdateRequest) body: CommentUpdateRequest): Promise<Comment> {

        // find the existing one without related
        const comment = await this.findOne(id, false);

        // set new values
        // comment.ParentCommentId = body.parentCommentId;
        comment.Hash = body.hash;
        comment.Sender = body.sender;
        comment.Receiver = body.receiver;
        comment.Type = body.type;
        comment.Target = body.target;
        comment.Message = body.message;
        comment.PostedAt = body.postedAt;
        comment.ExpiredAt = body.expiredAt;
        comment.ReceivedAt = body.receivedAt;

        // update comment record
        const updatedComment = await this.commentRepo.update(id, comment.toJSON());

        return updatedComment;
    }

    public async destroy(id: number): Promise<void> {
        await this.commentRepo.destroy(id);
    }

    public async updateMsgId(hash: string, msgid: string): Promise<Comment> {
        let comment = await this.findOneByHash(hash, false);
        comment.Msgid = msgid;
        comment =  await this.commentRepo.update(comment.Id, comment.toJSON());

        // finally find and return the created comment
        return await this.findOne(comment.Id, true);
    }

    public async updateTimes(id: number, postedAt: number, receivedAt: number, expiredAt: number): Promise<Comment> {
        const comment = await this.findOne(id, false);
        comment.set('postedAt', postedAt);
        comment.set('receivedAt', receivedAt);
        comment.set('expiredAt', expiredAt);
        await this.commentRepo.update(id, comment.toJSON());
        return await this.findOne(id);
    }

}
