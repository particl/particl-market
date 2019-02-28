declare module 'resources' {

    interface Comment {
        id: number;
        parentCommentId: number;
        hash: string;
        parentHash: string;
        sender: string;
        marketHash: string;
        target: string;
        message: string;
        commentType: string;
        postedAt: Date;
        updatedAt: Date;
        createdAt: Date;
    }

}
