import { Bookshelf } from '../../config/Database';
import { Collection, Model } from 'bookshelf';

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

    public get ParentCommentId(): number { return this.get('parentCommentId'); }
    public set ParentCommentId(value: number) { this.set('parentCommentId', value); }

    public get Hash(): string { return this.get('hash'); }
    public set Hash(value: string) { this.set('hash', value); }

    public get ParentHash(): string { return this.get('parentHash'); }
    public set ParentHash(value: string) { this.set('parentHash', value); }

    public get Sender(): string { return this.get('sender'); }
    public set Sender(value: string) { this.set('sender', value); }

    public get MarketHash(): string { return this.get('marketHash'); }
    public set MarketHash(value: string) { this.set('marketHash', value); }

    public get Target(): string { return this.get('target'); }
    public set Target(value: string) { this.set('target', value); }

    public get Message(): string { return this.get('message'); }
    public set Message(value: string) { this.set('message', value); }

    public get CommentType(): string { return this.get('commentType'); }
    public set CommentType(value: string) { this.set('commentType', value); }

    public get PostedAt(): Date { return this.get('postedAt'); }
    public set PostedAt(value: Date) { this.set('postedAt', value); }

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

    // TODO: add related
    // public CommentRelated(): CommentRelated {
    //    return this.hasOne(CommentRelated);
    // }
}
