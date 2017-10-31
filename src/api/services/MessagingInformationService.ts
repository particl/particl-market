import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessagingInformationRepository } from '../repositories/MessagingInformationRepository';
import { MessagingInformation } from '../models/MessagingInformation';
import { MessagingInformationCreateRequest } from '../requests/MessagingInformationCreateRequest';
import { MessagingInformationUpdateRequest } from '../requests/MessagingInformationUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';


export class MessagingInformationService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.MessagingInformationRepository) public messagingInformationRepo: MessagingInformationRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<MessagingInformation>> {
        return this.findAll();
    }

    public async findAll(): Promise<Bookshelf.Collection<MessagingInformation>> {
        return this.messagingInformationRepo.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<MessagingInformation> {
        return this.findOne(data.params[0]);
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<MessagingInformation> {
        const messagingInformation = await this.messagingInformationRepo.findOne(id, withRelated);
        if (messagingInformation === null) {
            this.log.warn(`MessagingInformation with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return messagingInformation;
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<MessagingInformation> {
        return this.create({
            data: data.params[0] // TODO: convert your params to MessagingInformationCreateRequest
        });
    }

    @validate()
    public async create( @request(MessagingInformationCreateRequest) body: any): Promise<MessagingInformation> {

        // TODO: extract and remove related models from request
        // const messagingInformationRelated = body.related;
        // delete body.related;

        // If the request body was valid we will create the messagingInformation
        const messagingInformation = await this.messagingInformationRepo.create(body);

        // TODO: create related models
        // messagingInformationRelated._id = messagingInformation.Id;
        // await this.messagingInformationRelatedService.create(messagingInformationRelated);

        // finally find and return the created messagingInformation
        const newMessagingInformation = await this.findOne(messagingInformation.id);
        return newMessagingInformation;
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<MessagingInformation> {
        return this.update(data.params[0], {
            data: data.params[1] // TODO: convert your params to MessagingInformationUpdateRequest
        });
    }

    @validate()
    public async update(id: number, @request(MessagingInformationUpdateRequest) body: any): Promise<MessagingInformation> {

        // find the existing one without related
        const messagingInformation = await this.findOne(id, false);

        // set new values
        messagingInformation.Protocol = body.protocol;
        messagingInformation.PublicKey = body.publicKey;

        // update messagingInformation record
        const updatedMessagingInformation = await this.messagingInformationRepo.update(id, messagingInformation.toJSON());

        // TODO: yes, this is stupid
        // TODO: find related record and delete it
        // let messagingInformationRelated = updatedMessagingInformation.related('MessagingInformationRelated').toJSON();
        // await this.messagingInformationService.destroy(messagingInformationRelated.id);

        // TODO: recreate related data
        // messagingInformationRelated = body.messagingInformationRelated;
        // messagingInformationRelated._id = messagingInformation.Id;
        // const createdMessagingInformation = await this.messagingInformationService.create(messagingInformationRelated);

        // TODO: finally find and return the updated messagingInformation
        // const newMessagingInformation = await this.findOne(id);
        // return newMessagingInformation;

        return updatedMessagingInformation;
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

    public async destroy(id: number): Promise<void> {
        await this.messagingInformationRepo.destroy(id);
    }

}
