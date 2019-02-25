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

import { MarketplaceMessage } from '../messages/MarketplaceMessage';

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

    public async findOneByHash(hash: string, withRelated: boolean = true): Promise<Comment> {
        const comment = await this.commentRepo.findOneByHash(hash, withRelated);
        if (comment === null) {
            this.log.warn(`Comment with the hash=${hash} was not found!`);
            throw new NotFoundException(hash);
        }
        return comment;
    }


    @validate()
    public async create(@request(CommentCreateRequest) data: CommentCreateRequest): Promise<Comment> {
        const body = JSON.parse(JSON.stringify(data));
        body.hash = ObjectHash.getHash(body, HashableObjectType.COMMENT_CREATEREQUEST);

        const comment = await this.commentRepo.create(body);

        // TODO: Filter out html from message

        // TODO: validation

        const newComment = await this.findOne(comment.Id);
        return newComment;
    }
}
