import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';

import { NotFoundException } from '../exceptions/NotFoundException';
import { ValidationException } from '../exceptions/ValidationException';

import { CommentRepository } from '../repositories/CommentRepository';

import { Comment } from '../models/Comment';

import { CommentCreateRequest } from '../requests/CommentCreateRequest';

export class CommentService {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Repository) @named(Targets.Repository.CommentRepository) public commentRepo: CommentRepository,
        @inject(Types.Service) @named(Targets.Service.CommentDataService) public commentDataService: CommentDataService
    ) {
        this.log = new Logger(__filename);
    }


    @validate()
    public async create(@request(CommentCreateRequest) data: BidCreateRequest): Promise<Bid> {
        const body = JSON.parse(JSON.stringify(data));
        const comment = await this.commentRepo.create(body);

        // TODO: validation

        const newComment = await this.findOne(comment.Id);
        return newComment;
    }
}
