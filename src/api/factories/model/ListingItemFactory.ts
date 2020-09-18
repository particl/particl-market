// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

// tslint:disable:max-line-length
import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemCreateRequest } from '../../requests/model/ListingItemCreateRequest';
import { ItemInformationCreateRequest } from '../../requests/model/ItemInformationCreateRequest';
import { PaymentInformationCreateRequest } from '../../requests/model/PaymentInformationCreateRequest';
import { MessagingInformationCreateRequest } from '../../requests/model/MessagingInformationCreateRequest';
import { ListingItemObjectCreateRequest } from '../../requests/model/ListingItemObjectCreateRequest';
import { ListingItemObjectDataCreateRequest } from '../../requests/model/ListingItemObjectDataCreateRequest';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { ItemObject } from 'omp-lib/dist/interfaces/omp';
import { MessagingProtocol } from 'omp-lib/dist/interfaces/omp-enums';
import { ModelFactoryInterface } from '../ModelFactoryInterface';
import { ListingItemCreateParams } from '../ModelCreateParams';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableListingItemTemplateCreateRequestConfig } from '../hashableconfig/createrequest/HashableListingItemTemplateCreateRequestConfig';
import { HashMismatchException } from '../../exceptions/HashMismatchException';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { ItemInformationFactory } from './ItemInformationFactory';
import { PaymentInformationFactory } from './PaymentInformationFactory';
// tslint:enable:max-line-length


export class ListingItemFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.model.PaymentInformationFactory) private paymentInformationFactory: PaymentInformationFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.ItemInformationFactory) private itemInformationFactory: ItemInformationFactory
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a ListingItemCreateRequest
     *
     * @param params
     */
    public async get(params: ListingItemCreateParams): Promise<ListingItemCreateRequest> {
        const actionMessage = params.actionMessage as ListingItemAddMessage;
        const smsgMessage = params.smsgMessage;

        if (_.isNil(smsgMessage)) {
            throw new MissingParamException('smsgMessage');
        }

        const itemInformation: ItemInformationCreateRequest = await this.itemInformationFactory.get(params);
        const paymentInformation: PaymentInformationCreateRequest = await this.paymentInformationFactory.get(params);
        const messagingInformations: MessagingInformationCreateRequest[] = [];

        for (const options of actionMessage.item.messaging.options) {
            messagingInformations.push({
                protocol: MessagingProtocol[options.protocol],
                publicKey: options.publicKey
            } as MessagingInformationCreateRequest);
        }

        let listingItemObjects;
        if (actionMessage.item.objects) {
            listingItemObjects = await this.getModelListingItemObjects(params);
        }

        const createRequest = {
            seller: actionMessage.item.seller.address,
            signature: actionMessage.item.seller.signature,
            itemInformation,
            paymentInformation,
            messagingInformation: messagingInformations,
            listingItemObjects,
            market: smsgMessage.to,
            msgid: smsgMessage.msgid,
            expiryTime: smsgMessage.daysretention,
            postedAt: smsgMessage.sent,
            expiredAt: smsgMessage.expiration,
            receivedAt: smsgMessage.received,
            generatedAt: actionMessage.generated,
            hash: 'recalculateandvalidate'
        } as ListingItemCreateRequest;

        createRequest.hash = ConfigurableHasher.hash(createRequest, new HashableListingItemTemplateCreateRequestConfig());

        // the createRequest.hash should have a matching hash with the incoming message
        if (actionMessage.hash !== createRequest.hash) {
            const exception = new HashMismatchException('ListingItemCreateRequest', actionMessage.hash, createRequest.hash);
            this.log.error(exception.getMessage());
            throw exception;
        }

        return createRequest;
    }

    private async getModelListingItemObjects(params: ListingItemCreateParams): Promise<ListingItemObjectCreateRequest[]> {

        const listingItemAddMessage = params.actionMessage as ListingItemAddMessage;
        const objects: ItemObject[] = listingItemAddMessage.item.objects || [];

        const objectArray: ListingItemObjectCreateRequest[] = [];
        for (const object of objects) {
            let objectData;
            if (object.table && 'TABLE' === object.type) {
                objectData = await this.getModelObjectDatas(object.table);
            } else if (object.options && 'DROPDOWN' === object.type) {
                objectData = await this.getModelObjectDatas(object.options);
            }
            objectArray.push({
                type: object.type,
                description: object.description,
                listingItemObjectDatas: objectData
            } as ListingItemObjectCreateRequest);
        }
        return objectArray;
    }

    private async getModelObjectDatas(objectDatas: KVS[]): Promise<ListingItemObjectDataCreateRequest[]> {
        const objectDataArray: ListingItemObjectDataCreateRequest[] = [];
        for (const objectData of objectDatas) {
            objectDataArray.push({
                key: objectData.key,
                value: objectData.value
            } as ListingItemObjectDataCreateRequest);
        }
        return objectDataArray;
    }
}
