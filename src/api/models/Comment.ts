// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { SearchOrder } from '../enums/SearchOrder';
import { CommentType } from '../enums/CommentType';
import { CommentSearchParams } from '../requests/search/CommentSearchParams';

export class Comment extends Bookshelf.Model<Comment> {

    public static RELATIONS = [
        'ParentComment',
        'ChildComments'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Comment> {
        if (withRelated) {
            return await Comment.where<Comment>({ id: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Comment.where<Comment>({ id: value }).fetch();
        }
    }

    public static async fetchByHash(hash: string, withRelated: boolean = true): Promise<Comment> {
        if (withRelated) {
            return await Comment.where<Comment>({ hash }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Comment.where<Comment>({ hash }).fetch();
        }
    }

    public static async fetchAllByTypeAndTarget(type: string, target: string): Promise<Collection<Comment>> {
      const commentResultCollection = Comment.forge<Model<Comment>>()
            .query(qb => {
                qb.where('comments.type', '=', type);
                qb.where('comments.target', '=', target);
            });
      return await commentResultCollection.fetchAll();
    }

    public static async fetchAllByCommentorsAndCommentHash(addresses: string[], hash: string, withRelated: boolean = true): Promise<Collection<Comment>> {
        const commentResultCollection = Comment.forge<Model<Comment>>()
            .query(qb => {
                qb.where('comments.hash', '=', hash);
                qb.whereIn('comments.sender', addresses);
            })
            .orderBy('id', SearchOrder.DESC);
        if (withRelated) {
            return await commentResultCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await commentResultCollection.fetchAll();
        }
    }

    public static async countBy(options: CommentSearchParams): Promise<number> {
        return Comment.forge<Model<Comment>>()
            .query( qb => {
                qb.where('comments.type', '=', options.type);
                qb.where('comments.target', '=', options.target);

                if (options.parentCommentId === undefined) {
                    qb.whereNull('comments.parent_comment_id');
                }

                if (options.parentCommentId) {
                    qb.where('comments.parent_comment_id', '=', options.parentCommentId);
                }
            })
            .count();
    }

    public static async searchBy(options: CommentSearchParams, withRelated: boolean = true): Promise<Collection<Comment>> {
        if (!options.order) {
            options.order = SearchOrder.ASC;
        }

        if (!options.orderField
            || !(options.orderField === 'id'
            || options.orderField === 'hash'
            || options.orderField === 'sender'
            || options.orderField === 'receiver'
            || options.orderField === 'target'
            || options.orderField === 'message'
            || options.orderField === 'type'
            || options.orderField === 'posted_at'
            || options.orderField === 'received_at'
            || options.orderField === 'expired_at'
            || options.orderField === 'updated_at'
            || options.orderField === 'created_at'
            || options.orderField === 'parent_comment_id')) {
            options.orderField = 'posted_at';
        }
        options.page = options.page || 0;
        options.pageLimit = options.pageLimit || 10;

        const commentCollection = Comment.forge<Model<Comment>>()
            .query( qb => {

                if (CommentType[options.type]) {
                    qb.where('comments.type', '=', options.type);
                }

                if (options.target) {
                    qb.where('comments.target', '=', options.target);
                }

                if (options.parentCommentId === undefined) {
                    qb.whereNull('comments.parent_comment_id');
                }

                if (options.parentCommentId) {
                    qb.where('comments.parent_comment_id', '=', options.parentCommentId);
                }
            })
            .orderBy(`${options.orderField}`, options.order)
            .query({
                limit: options.pageLimit,
                offset: options.page * options.pageLimit
            });
        if (withRelated) {
            return await commentCollection.fetchAll({
                withRelated: this.RELATIONS
            });
        } else {
            return await commentCollection.fetchAll();
        }
    }

    public get tableName(): string { return 'comments'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Msgid(): string { return this.get('msgid'); }
    public set Msgid(value: string) { this.set('msgid', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get Sender(): string { return this.get('sender'); }
    public set Sender(value: string) { this.set('sender', value); }

    public get Receiver(): string { return this.get('receiver'); }
    public set Receiver(value: string) { this.set('receiver', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get Target(): string { return this.get('target'); }
    public set Target(value: string) { this.set('target', value); }

    public get Message(): string { return this.get('message'); }
    public set Message(value: string) { this.set('message', value); }

    public get PostedAt(): number { return this.get('postedAt'); }
    public set PostedAt(value: number) { this.set('postedAt', value); }

    public get ExpiredAt(): number { return this.get('expiredAt'); }
    public set ExpiredAt(value: number) { this.set('expiredAt', value); }

    public get ReceivedAt(): number { return this.get('receivedAt'); }
    public set ReceivedAt(value: number) { this.set('receivedAt', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }


    public ParentComment(): Comment {
        return this.belongsTo(Comment, 'parent_comment_id', 'id');
    }

    public ChildComments(): Collection<Comment> {
        return this.hasMany(Comment, 'parent_comment_id', 'id');
    }
}
