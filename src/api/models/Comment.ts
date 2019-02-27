// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';
import { Market } from './Market';

export class Comment extends Bookshelf.Model<Comment> {

    public static RELATIONS = [
        'ParentComment',
        'ChildComments',
        'Market'
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

    public static async fetchByHash(value: string, withRelated: boolean = true): Promise<Comment> {
        if (withRelated) {
            return await Comment.where<Comment>({ hash: value }).fetch({
                withRelated: this.RELATIONS
            });
        } else {
            return await Comment.where<Comment>({ hash: value }).fetch();
        }
    }

    public get tableName(): string { return 'comments'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get Sender(): string { return this.get('sender'); }
    public set Sender(value: string) { this.set('sender', value); }

    public get Receiver(): string { return this.get('receiver'); }
    public set Receiver(value: string) { this.set('receiver', value); }

    public get Target(): string { return this.get('target'); }
    public set Target(value: string) { this.set('target', value); }

    public get Message(): string { return this.get('message'); }
    public set Message(value: string) { this.set('message', value); }

    public get Type(): string { return this.get('type'); }
    public set Type(value: string) { this.set('type', value); }

    public get PostedAt(): number { return this.get('postedAt'); }
    public set PostedAt(value: number) { this.set('postedAt', value); }

    public get ReceivedAt(): number { return this.get('receivedAt'); }
    public set ReceivedAt(value: number) { this.set('receivedAt', value); }

    public get ExpiredAt(): number { return this.get('expiredAt'); }
    public set ExpiredAt(value: number) { this.set('expiredAt', value); }

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

    public Market(): Market {
        return this.belongsTo(Market, 'market_id', 'id');
    }

}
