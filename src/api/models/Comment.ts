// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { SearchOrder } from '../enums/SearchOrder';
import { CommentType } from '../enums/CommentType';
import { CommentSearchParams } from '../requests/search/CommentSearchParams';
import { CommentSearchOrderField } from '../enums/SearchOrderField';

export class Comment extends Bookshelf.Model<Comment> {

    public static RELATIONS = [
        'ParentComment',
        'ChildComments',
        'ChildComments.ChildComments'
    ];

    public static async fetchById(value: number, withRelated: boolean = true): Promise<Comment> {
        return Comment.where<Comment>({ id: value }).fetch({
            withRelated: withRelated ? this.RELATIONS : undefined
        });
    }

    public static async fetchByHash(hash: string, withRelated: boolean = true): Promise<Comment> {
        return Comment.where<Comment>({ hash }).fetch({
            withRelated: withRelated ? this.RELATIONS : undefined
        });
    }

    public static async fetchByMsgId(msgId: string, withRelated: boolean = true): Promise<Comment> {
        return Comment.where<Comment>({ msgid: msgId }).fetch({
            withRelated: withRelated ? this.RELATIONS : undefined
        });
    }

    public static async fetchAllByTypeAndTarget(type: string, target: string): Promise<Collection<Comment>> {
      const commentResultCollection = Comment.forge<Model<Comment>>()
            .query(qb => {
                qb.where('comments.type', '=', type);
                qb.andWhere('comments.target', '=', target);
            });
      return commentResultCollection.fetchAll();
    }

    public static async fetchAllByCommentorsAndCommentHash(addresses: string[], hash: string, withRelated: boolean = true): Promise<Collection<Comment>> {
        const collection = Comment.forge<Model<Comment>>()
            .query(qb => {
                qb.where('comments.hash', '=', hash);
                qb.whereIn('comments.sender', addresses);
            })
            .orderBy('id', SearchOrder.DESC);
        return collection.fetchAll({
            withRelated: withRelated ? this.RELATIONS : undefined
        });
    }

    public static async countBy(options: CommentSearchParams): Promise<number> {
        return Comment.forge<Model<Comment>>()
            .query( qb => {
                if (options.type) {
                    qb.where('type', '=', options.type);
                }

                if (options.target) {
                    qb.where('target', '=', options.target);
                }

                if (_.isNil(options.parentCommentId)) {
                    qb.whereNull('parent_comment_id');
                } else {
                    qb.where('parent_comment_id', '=', options.parentCommentId);
                }
            })
            .count();
    }

    public static async searchBy(options: CommentSearchParams, withRelated: boolean = true): Promise<Collection<Comment>> {

        options.page = options.page || 0;
        options.pageLimit = options.pageLimit || 10;
        options.order = options.order || SearchOrder.ASC;
        options.orderField = options.orderField || CommentSearchOrderField.POSTED_AT;

        const collection = Comment.forge<Model<Comment>>()
            .query( qb => {

                if (CommentType[options.type]) {
                    qb.andWhere('comments.type', '=', options.type);
                }

                if (options.sender) {
                    qb.andWhere('comments.sender', '=', options.sender);
                }

                if (options.ignoreSenders) {
                    qb.whereNotIn('comments.sender', options.ignoreSenders);
                }

                if (options.receiver) {
                    qb.andWhere('comments.receiver', '=', options.receiver);
                }

                if (options.target) {
                    qb.andWhere('comments.target', '=', options.target);
                }

                if (_.isNil(options.parentCommentId)) {
                    qb.whereNull('parent_comment_id');
                } else {
                    qb.andWhere('parent_comment_id', '=', options.parentCommentId);
                }

            })
            .orderBy('comments.' + options.orderField, options.order)
            .query({
                limit: options.pageLimit,
                offset: options.page * options.pageLimit
            });

        return collection.fetchAll({
            withRelated: withRelated ? this.RELATIONS : undefined
        });
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

    public get GeneratedAt(): number { return this.get('generatedAt'); }
    public set GeneratedAt(value: number) { this.set('generatedAt', value); }

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
