import { Bookshelf } from '../../config/Database';
import { CommentMessageType } from '../enums/CommentMessageType';

export class Comment extends Bookshelf.Model<Comment> {

    public static RELATIONS = [
        // TODO:
        // 'ommentRelated',
        // 'CommentRelated.Related'
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

    public get tableName(): string { return 'item_comments'; }
    public get hasTimestamps(): boolean { return true; }

    public get Id(): number { return this.get('id'); }
    public set Id(value: number) { this.set('id', value); }

    public get ParentCommentId(): number { return this.get('parentCommentId'); }
    public set ParentCommentId(value: number) { this.set('parentCommentId', value); }

    public get Hash(): number { return this.get('hash'); }
    public set Hash(value: number) { this.set('hash', value); }

    public get ParentHash(): number { return this.get('parentHash'); }
    public set ParentHash(value: number) { this.set('parentHash', value); }

    public get Sender(): number { return this.get('sender'); }
    public set Sender(value: number) { this.set('sender', value); }

    public get Target(): number { return this.get('target'); }
    public set Target(value: number) { this.set('target', value); }

    public get Message(): number { return this.get('message'); }
    public set Message(value: number) { this.set('message', value); }

    public get CommentType(): number { return this.get('commentType'); }
    public set CommentType(value: number) { this.set('commentType', value); }

    public get CreatedAt(): Date { return this.get('createdAt'); }
    public set CreatedAt(value: Date) { this.set('createdAt', value); }

    public get UpdatedAt(): Date { return this.get('updatedAt'); }
    public set UpdatedAt(value: Date) { this.set('updatedAt', value); }

    public get ReceivedAt(): Date { return this.get('receivedAt'); }
    public set ReceivedAt(value: Date) { this.set('receivedAt', value); }

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
