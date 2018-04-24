"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const ItemCategoryFactory_1 = require("./ItemCategoryFactory");
const ShippingAvailability_1 = require("../enums/ShippingAvailability");
const ImageVersionEnumType_1 = require("../../core/helpers/ImageVersionEnumType");
const MessagingProtocolType_1 = require("../enums/MessagingProtocolType");
let ListingItemFactory = class ListingItemFactory {
    constructor(Logger, itemCategoryFactory) {
        this.Logger = Logger;
        this.itemCategoryFactory = itemCategoryFactory;
        this.log = new Logger(__filename);
    }
    /**
     * Creates a ListingItemMessage from given data
     *
     * @param {'resources'.ListingItemTemplate} listingItemTemplate
     * @param {'resources'.ItemCategory} listingItemCategory
     * @returns {Promise<ListingItemMessage>}
     */
    getMessage(listingItemTemplate) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const information = yield this.getMessageInformation(listingItemTemplate.ItemInformation);
            const payment = yield this.getMessagePayment(listingItemTemplate.PaymentInformation);
            const messaging = yield this.getMessageMessaging(listingItemTemplate.MessagingInformation);
            const objects = yield this.getMessageObjects(listingItemTemplate.ListingItemObjects);
            const message = {
                hash: listingItemTemplate.hash,
                information,
                payment,
                messaging,
                objects
            };
            return message;
        });
    }
    /**
     *
     * @param {ListingItemMessage} listingItemMessage
     * @param {number} marketId
     * @param {string} seller
     * @param {"resources".ItemCategory} rootCategory
     * @returns {Promise<ListingItemCreateRequest>}
     */
    getModel(listingItemMessage, marketId, seller, rootCategory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemInformation = yield this.getModelItemInformation(listingItemMessage.information, rootCategory);
            const paymentInformation = yield this.getModelPaymentInformation(listingItemMessage.payment);
            const messagingInformation = yield this.getModelMessagingInformation(listingItemMessage.messaging);
            const listingItemObjects = yield this.getModelListingItemObjects(listingItemMessage.objects);
            return {
                seller,
                hash: listingItemMessage.hash,
                market_id: marketId,
                itemInformation,
                paymentInformation,
                messagingInformation,
                listingItemObjects
            };
        });
    }
    // ---------------
    // MODEL
    // ---------------
    getModelListingItemObjects(objects) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const objectArray = [];
            for (const object of objects) {
                let objectData;
                if (object.type === 'TABLE') {
                    objectData = yield this.getModelObjectDataForTypeTable(object['table']);
                }
                else if (object.type === 'DROPDOWN') {
                    objectData = yield this.getModelObjectDataForTypeDropDown(object['options']);
                }
                objectArray.push({
                    type: object.type,
                    description: object.title,
                    listingItemObjectDatas: objectData
                });
            }
            return objectArray;
        });
    }
    getModelObjectDataForTypeTable(objectDatas) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const objectDataArray = [];
            for (const objectData of objectDatas) {
                objectDataArray.push({
                    key: objectData.key,
                    value: objectData.value
                });
            }
            return objectDataArray;
        });
    }
    getModelObjectDataForTypeDropDown(objectDatas) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const objectDataArray = [];
            for (const objectData of objectDatas) {
                objectDataArray.push({
                    key: objectData.name,
                    value: objectData.value
                });
            }
            return objectDataArray;
        });
    }
    getModelMessagingInformation(messaging) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messagingArray = [];
            for (const messagingData of messaging) {
                messagingArray.push({
                    protocol: MessagingProtocolType_1.MessagingProtocolType[messagingData.protocol],
                    publicKey: messagingData.public_key
                });
            }
            return messagingArray;
        });
    }
    getModelPaymentInformation(payment) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const escrow = yield this.getModelEscrow(payment.escrow);
            const itemPrice = yield this.getModelItemPrice(payment.cryptocurrency);
            return {
                type: payment.type,
                escrow,
                itemPrice
            };
        });
    }
    getModelItemPrice(cryptocurrency) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shippingPrice = yield this.getModelShippingPrice(cryptocurrency[0].shipping_price);
            const cryptocurrencyAddress = yield this.getModelCryptocurrencyAddress(cryptocurrency[0].address);
            return {
                currency: cryptocurrency[0].currency,
                basePrice: cryptocurrency[0].base_price,
                shippingPrice,
                cryptocurrencyAddress
            };
        });
    }
    getModelShippingPrice(shippingPrice) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return {
                domestic: shippingPrice.domestic,
                international: shippingPrice.international
            };
        });
    }
    getModelCryptocurrencyAddress(cryptocurrencyAddress) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return {
                type: cryptocurrencyAddress.type,
                address: cryptocurrencyAddress.address
            };
        });
    }
    getModelEscrow(escrow) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const ratio = yield this.getModelEscrowRatio(escrow.ratio);
            return {
                type: escrow.type,
                ratio
            };
        });
    }
    getModelEscrowRatio(ratio) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return {
                buyer: ratio.buyer,
                seller: ratio.seller
            };
        });
    }
    getModelItemInformation(information, rootCategory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemCategory = yield this.itemCategoryFactory.getModel(information.category, rootCategory);
            const itemLocation = yield this.getModelLocation(information.location);
            const shippingDestinations = yield this.getModelShippingDestinations(information.shipping_destinations);
            const itemImages = yield this.getModelImages(information.images);
            return {
                title: information.title,
                shortDescription: information.short_description,
                longDescription: information.long_description,
                itemCategory,
                itemLocation,
                shippingDestinations,
                itemImages
            };
        });
    }
    getModelLocation(location) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const locationObject = {};
            const region = location.country;
            const address = location.address;
            if (region) {
                locationObject.region = region;
            }
            if (address) {
                locationObject.address = address;
            }
            if (location.gps) {
                const locationMarker = yield this.getModelLocationMarker(location.gps);
                locationObject.locationMarker = locationMarker;
            }
            return locationObject;
        });
    }
    getModelLocationMarker(gps) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const lat = gps.lat;
            const lng = gps.lng;
            const locationMarker = {
                lat,
                lng
            };
            if (gps.marker_title) {
                locationMarker.markerTitle = gps.marker_title;
            }
            if (gps.marker_text) {
                locationMarker.markerText = gps.marker_text;
            }
            return locationMarker;
        });
    }
    getModelShippingDestinations(shippingDestinations) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const destinations = [];
            for (const destination of shippingDestinations) {
                let shippingAvailability = ShippingAvailability_1.ShippingAvailability.SHIPS;
                let country = destination;
                if (destination.charAt(0) === '-') {
                    shippingAvailability = ShippingAvailability_1.ShippingAvailability.DOES_NOT_SHIP;
                    country = destination.substring(1);
                }
                destinations.push({
                    country,
                    shippingAvailability
                });
            }
            return destinations;
        });
    }
    getModelImages(images) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const imageCreateRequests = [];
            for (const image of images) {
                const data = yield this.getModelImageData(image.data);
                imageCreateRequests.push({
                    hash: image.hash,
                    data
                });
            }
            return imageCreateRequests;
        });
    }
    getModelImageData(imageDatas) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const imageDataCreateRequests = [];
            for (const imageData of imageDatas) {
                imageDataCreateRequests.push({
                    dataId: imageData.id,
                    protocol: imageData.protocol,
                    imageVersion: ImageVersionEnumType_1.ImageVersions.ORIGINAL.propName,
                    encoding: imageData.encoding,
                    data: imageData.data
                });
            }
            return imageDataCreateRequests;
        });
    }
    // ---------------
    // MESSAGE
    // ---------------
    getMessageInformation(itemInformation) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const category = yield this.itemCategoryFactory.getArray(itemInformation.ItemCategory);
            const location = yield this.getMessageInformationLocation(itemInformation.ItemLocation);
            const shippingDestinations = yield this.getMessageInformationShippingDestinations(itemInformation.ShippingDestinations);
            const images = yield this.getMessageInformationImages(itemInformation.ItemImages);
            return {
                title: itemInformation.title,
                short_description: itemInformation.shortDescription,
                long_description: itemInformation.longDescription,
                category,
                location,
                shipping_destinations: shippingDestinations,
                images
            };
        });
    }
    getMessageInformationLocation(itemLocation) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const locationMarker = itemLocation.LocationMarker;
            const informationLocation = {};
            if (itemLocation.region) {
                informationLocation.country = itemLocation.region;
            }
            if (itemLocation.address) {
                informationLocation.address = itemLocation.address;
            }
            if (locationMarker) {
                informationLocation.gps = {
                    lng: locationMarker.lng,
                    lat: locationMarker.lat
                };
                if (locationMarker.markerTitle) {
                    informationLocation.gps.marker_title = locationMarker.markerTitle;
                }
                if (locationMarker.markerText) {
                    informationLocation.gps.marker_text = locationMarker.markerText;
                }
            }
            return informationLocation;
        });
    }
    getMessageInformationShippingDestinations(shippingDestinations) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shippingDesArray = [];
            shippingDestinations.forEach((value) => {
                switch (value.shippingAvailability) {
                    case ShippingAvailability_1.ShippingAvailability.SHIPS:
                        shippingDesArray.push(value.country);
                        break;
                    case ShippingAvailability_1.ShippingAvailability.DOES_NOT_SHIP:
                        shippingDesArray.push('-' + value.country);
                        break;
                }
            });
            return shippingDesArray;
        });
    }
    getMessageInformationImages(images) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const imagesArray = [];
            for (const image of images) {
                const imageData = yield this.getMessageInformationImageData(image.ItemImageDatas);
                imagesArray.push({
                    hash: image.hash,
                    data: imageData
                });
            }
            return imagesArray;
        });
    }
    getMessageInformationImageData(itemImageDatas) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const imageDataArray = [];
            for (const imageData of itemImageDatas) {
                // we only want the original
                if (imageData.imageVersion === ImageVersionEnumType_1.ImageVersions.ORIGINAL.propName) {
                    imageDataArray.push({
                        protocol: imageData.protocol,
                        encoding: imageData.encoding,
                        data: imageData.data,
                        id: imageData.dataId
                    });
                }
            }
            return imageDataArray;
        });
    }
    getMessagePayment(paymentInformation) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const escrow = yield this.getMessageEscrow(paymentInformation.Escrow);
            const cryptocurrency = yield this.getMessageCryptoCurrency(paymentInformation.ItemPrice);
            return {
                type: paymentInformation.type,
                escrow,
                cryptocurrency
            };
        });
    }
    getMessageEscrow(escrow) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return {
                type: escrow.type,
                ratio: {
                    buyer: escrow.Ratio.buyer,
                    seller: escrow.Ratio.seller
                }
            };
        });
    }
    getMessageCryptoCurrency(itemPrice) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return [
                {
                    currency: itemPrice.currency,
                    base_price: itemPrice.basePrice,
                    shipping_price: {
                        domestic: itemPrice.ShippingPrice.domestic,
                        international: itemPrice.ShippingPrice.international
                    },
                    address: {
                        type: itemPrice.CryptocurrencyAddress.type,
                        address: itemPrice.CryptocurrencyAddress.address
                    }
                }
            ];
        });
    }
    getMessageMessaging(messagingInformation) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const messageArray = [];
            messagingInformation.forEach((value) => {
                messageArray.push({
                    protocol: value.protocol,
                    public_key: value.publicKey
                });
            });
            return messageArray;
        });
    }
    // objects fields
    getMessageObjects(listingItemObjects) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const objectArray = [];
            listingItemObjects.forEach((value) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const objectValue = yield this.getObjectArray(value);
                objectArray.push(objectValue);
            }));
            return objectArray;
        });
    }
    getObjectArray(value) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // check Table and Dropdown
            if (value.type === 'TABLE') {
                return {
                    type: 'TABLE',
                    title: value.description,
                    table: yield this.getObjectDataTable(value.ListingItemObjectDatas)
                };
            }
            else if (value.type === 'DROPDOWN') {
                return {
                    type: 'DROPDOWN',
                    id: value.objectId,
                    title: value.description,
                    force_input: value.forceInput,
                    options: yield this.getObjectDataOptions(value.ListingItemObjectDatas)
                };
            }
        });
    }
    getObjectDataTable(objectDatas) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const objectDataArray = [];
            objectDatas.forEach((objectValue) => {
                objectDataArray.push({
                    key: objectValue.key,
                    value: objectValue.value
                });
            });
            return objectDataArray;
        });
    }
    getObjectDataOptions(objectDatas) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const objectDataArray = [];
            objectDatas.forEach((objectValue) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                objectDataArray.push({
                    name: objectValue.key,
                    value: objectValue.value
                    // todo
                    // add_to_price: [
                    //     50000000,
                    //     300000000
                    // ]
                });
            }));
            return objectDataArray;
        });
    }
};
ListingItemFactory = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Factory.ItemCategoryFactory)),
    tslib_1.__metadata("design:paramtypes", [Object, ItemCategoryFactory_1.ItemCategoryFactory])
], ListingItemFactory);
exports.ListingItemFactory = ListingItemFactory;
//# sourceMappingURL=ListingItemFactory.js.map