// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Comment } from '../models/Comment';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';
import { CommentSearchParams } from '../requests/search/CommentSearchParams';

export class CommentRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Comment) public CommentModel: typeof Comment,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Comment>> {
        const list = await this.CommentModel.fetchAll();
        return list as Bookshelf.Collection<Comment>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Comment> {
        return this.CommentModel.fetchById(id, withRelated);
    }

    public async findOneByHash(hash: string, withRelated: boolean = true): Promise<Comment> {
        return this.CommentModel.fetchByHash(hash, withRelated);
    }

    public async findAllByTypeAndTarget(type: string, target: string): Promise<Bookshelf.Collection<Comment>> {
        return this.CommentModel.fetchAllByTypeAndTarget(type, target);
    }

    public async findAllByCommentorsAndCommentHash(addresses: string[], hash: string, withRelated: boolean = true): Promise<Bookshelf.Collection<Comment>> {
        return this.CommentModel.fetchAllByCommentorsAndCommentHash(addresses, hash, withRelated);
    }

    /**
     * @param {CommentSearchParams} options
     * @param {boolean} withRelated
     * @returns {Promise<Bookshelf.Collection<Comment>>}
     */
    public async search(options: CommentSearchParams, withRelated: boolean): Promise<Bookshelf.Collection<Comment>> {
        return this.CommentModel.searchBy(options, withRelated);
    }

    public async count(options: CommentSearchParams): Promise<number> {
        return this.CommentModel.countBy(options);
    }

    public async create(data: any): Promise<Comment> {
        const comment = this.CommentModel.forge<Comment>(data);
        try {
            const commentCreated = await comment.save();
            return this.CommentModel.fetchById(commentCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the comment!', error);
        }
    }

    public async update(id: number, data: any): Promise<Comment> {
        const comment = this.CommentModel.forge<Comment>({ id });
        try {
            const commentUpdated = await comment.save(data, { patch: true });
            return this.CommentModel.fetchById(commentUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the comment!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let comment = this.CommentModel.forge<Comment>({ id });
        try {
            comment = await comment.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await comment.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the comment!', error);
        }
    }

}
