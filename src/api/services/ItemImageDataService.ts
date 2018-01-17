import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { validate, request } from '../../core/api/Validate';
import { NotFoundException } from '../exceptions/NotFoundException';
import { ValidationException } from '../exceptions/ValidationException';
import { ItemImageDataRepository } from '../repositories/ItemImageDataRepository';
import { ItemImageData } from '../models/ItemImageData';
import { ItemImageDataCreateRequest } from '../requests/ItemImageDataCreateRequest';
import { ItemImageDataUpdateRequest } from '../requests/ItemImageDataUpdateRequest';
import { RpcRequest } from '../requests/RpcRequest';
import { ImageProcessing } from '../../core/helpers/ImageProcessing';
import { ImageTriplet } from '../../core/helpers/ImageTriplet';

export class ItemImageDataService {

    public log: LoggerType;

    constructor(
        @inject(Types.Repository) @named(Targets.Repository.ItemImageDataRepository) public itemImageDataRepo: ItemImageDataRepository,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<ItemImageData>> {
        return this.itemImageDataRepo.findAll();
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<ItemImageData> {
        const itemImageData = await this.itemImageDataRepo.findOne(id, withRelated);
        if (itemImageData === null) {
            this.log.warn(`ItemImageData with the id=${id} was not found!`);
            throw new NotFoundException(id);
        }
        return itemImageData;
    }

    @validate()
    public async create( @request(ItemImageDataCreateRequest) body: ItemImageDataCreateRequest): Promise<ItemImageData> {
        // todo: could this be annotated in ItemImageDataCreateRequest?
        // todo: improve validation
        if (body.dataId == null && body.protocol == null && body.encoding == null && body.data == null ) {
            throw new ValidationException('Request body is not valid', ['dataId, protocol, encoding and data cannot all be null']);
        }

        // Convert, scale, and remove metadata from item image.
        const newBody: any = body;
        if (body.encoding === 'BASE64' && newBody.data) {
            const dataProcessed: ImageTriplet = await ImageProcessing.prepareImageForSaving(newBody.data);
            newBody.dataBig = dataProcessed.big;
            newBody.dataMedium = dataProcessed.medium;
            newBody.dataThumbnail = dataProcessed.thumbnail;
        } else {
            if (body.encoding !== 'BASE64') {
                this.log.warn('Unsupported image encoding. Only supports BASE64.');
            }
            newBody.dataBig = null;
            newBody.dataMedium = null;
            newBody.dataThumbnail = null;
        }
        delete newBody.data;

        // If the request newBody was valid we will create the itemImageData
        const itemImageData = await this.itemImageDataRepo.create(newBody);

        // finally find and return the created itemImageData
        const newItemImageData = await this.findOne(itemImageData.Id);
        return newItemImageData;
    }

    @validate()
    public async update(id: number, @request(ItemImageDataUpdateRequest) body: ItemImageDataCreateRequest): Promise<ItemImageData> {

        // todo: could this be annotated in ItemImageDataUpdateRequest?
        // todo: improve validation
        if (body.dataId == null && body.protocol == null && body.encoding == null && body.data == null ) {
            throw new ValidationException('Request body is not valid', ['dataId, protocol, encoding and data cannot all be null']);
        }

        // Convert, scale, and remove metadata from item image.
        const newBody: any = body;
        if (body.encoding === 'BASE64' && newBody.data) {
            const dataProcessed: ImageTriplet = await ImageProcessing.prepareImageForSaving(newBody.data);
            newBody.dataBig = dataProcessed.big;
            newBody.dataMedium = dataProcessed.medium;
            newBody.dataThumbnail = dataProcessed.thumbnail;
        } else {
            if (body.encoding !== 'BASE64') {
                this.log.warn('Unsupported image encoding. Only supports BASE64.');
            }
            newBody.dataBig = null;
            newBody.dataMedium = null;
            newBody.dataThumbnail = null;
        }
        delete newBody.data;

        // find the existing one without related
        const itemImageData = await this.findOne(id, false);

        // set new values
        itemImageData.DataId = newBody.dataId;
        itemImageData.Protocol = newBody.protocol;
        itemImageData.Encoding = newBody.encoding;
        itemImageData.DataBig = newBody.dataBig;
        itemImageData.DataMedium = newBody.dataMedium;
        itemImageData.DataThumbnail = newBody.dataThumbnail;

        // update itemImageData record
        const updatedItemImageData = await this.itemImageDataRepo.update(id, itemImageData.toJSON());
        return updatedItemImageData;
    }

    public async destroy(id: number): Promise<void> {
        await this.itemImageDataRepo.destroy(id);
    }

    // TODO: REMOVE
    @validate()
    public async rpcFindAll( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<ItemImageData>> {
        return this.findAll();
    }

    @validate()
    public async rpcFindOne( @request(RpcRequest) data: any): Promise<ItemImageData> {
        return this.findOne(data.params[0]);
    }

    @validate()
    public async rpcCreate( @request(RpcRequest) data: any): Promise<ItemImageData> {
        return this.create({
            dataId: data.params[0] || '',
            protocol: data.params[1] || '',
            encoding: data.params[2] || '',
            data: data.params[3] || ''
        } as ItemImageDataCreateRequest);
    }

    @validate()
    public async rpcUpdate( @request(RpcRequest) data: any): Promise<ItemImageData> {
        return this.update(data.params[0], {
            dataId: data.params[1] || '',
            protocol: data.params[2] || '',
            encoding: data.params[3] || '',
            data: data.params[4] || ''
        } as ItemImageDataUpdateRequest);
    }

    @validate()
    public async rpcDestroy( @request(RpcRequest) data: any): Promise<void> {
        return this.destroy(data.params[0]);
    }

}
