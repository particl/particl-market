import { inject, named } from 'inversify';
import { controller, httpPost, response, requestBody } from 'inversify-express-utils';
import { app } from '../../app';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { JsonRpc2Request, JsonRpc2Response, RpcErrorCode } from '../../core/api/jsonrpc';
import { JsonRpcError } from '../../core/api/JsonRpcError';
import { EscrowService } from '../services/EscrowService';
import { ItemPriceService } from '../services/ItemPriceService';
import { PaymentInformationService } from '../services/PaymentInformationService';
import { ItemImageDataService } from '../services/ItemImageDataService';
import { ItemImageService } from '../services/ItemImageService';
import { LocationMarkerService } from '../services/LocationMarkerService';
import { ItemLocationService } from '../services/ItemLocationService';
import { ShippingDestinationService } from '../services/ShippingDestinationService';
import { ItemInformationService } from '../services/ItemInformationService';
import { MessagingInformationService } from '../services/MessagingInformationService';
import { ListingItemService } from '../services/ListingItemService';

import { RpcItemCategoryService } from '../services/rpc/RpcItemCategoryService';
import { RpcListingItemService } from '../services/rpc/RpcListingItemService';
import { RpcListingItemTemplateService } from '../services/rpc/RpcListingItemTemplateService';
import { RpcItemInformationService } from '../services/rpc/RpcItemInformationService';
import { RpcProfileService } from '../services/rpc/RpcProfileService';
import { RpcAddressService } from '../services/rpc/RpcAddressService';
import { RpcCliHelpService } from '../services/rpc/RpcCliHelpService';
import { RpcFavoriteItemService } from '../services/rpc/RpcFavoriteItemService';
import { RpcPaymentInformationService } from '../services/rpc/RpcPaymentInformationService';
import { RpcEscrowService } from '../services/rpc/RpcEscrowService';
import { RpcTestDataService } from '../services/rpc/RpcTestDataService';
import { RpcItemImageService } from '../services/rpc/RpcItemImageService';
import { RpcShippingDestinationService } from '../services/rpc/RpcShippingDestinationService';
import { RpcItemLocationService } from '../services/rpc/RpcItemLocationService';
import { RpcMessagingInformationService } from '../services/rpc/RpcMessagingInformationService';
import { RpcBidService } from '../services/rpc/RpcBidService';
import { RpcMarketService } from '../services/rpc/RpcMarketService';

// import {RpcCommand} from '../commands/RpcCommand';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';
import { RpcRequest } from '../requests/RpcRequest';

// Get middlewares
const rpc = app.IoC.getNamed<interfaces.Middleware>(Types.Middleware, Targets.Middleware.RpcMiddleware);
let rpcIdCount = 0;

@controller('/rpc', rpc.use)
export class RpcController {

    public log: LoggerType;
    private VERSION = '2.0';
    private MAX_INT32 = 2147483647;
    private exposedMethods = {};

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Service) @named(Targets.Service.ItemPriceService) private itemPriceService: ItemPriceService,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) private paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.ItemImageDataService) private imageDataService: ItemImageDataService,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.LocationMarkerService) private locationMarkerService: LocationMarkerService,
        @inject(Types.Service) @named(Targets.Service.ItemLocationService) private itemLocationService: ItemLocationService,
        @inject(Types.Service) @named(Targets.Service.ShippingDestinationService) private shippingDestinationService: ShippingDestinationService,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) private itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.MessagingInformationService) private messagingInformationService: MessagingInformationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,

        @inject(Types.Service) @named(Targets.Service.rpc.RpcCliHelpService) private rpcCliHelpService: RpcCliHelpService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcItemCategoryService) private rpcItemCategoryService: RpcItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcProfileService) private rpcProfileService: RpcProfileService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcAddressService) private rpcAddressService: RpcAddressService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcListingItemService) private rpcListingItemService: RpcListingItemService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcListingItemTemplateService) private rpcListingItemTemplateService: RpcListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcItemInformationService) private rpcItemInformationService: RpcItemInformationService,

        @inject(Types.Service) @named(Targets.Service.rpc.RpcFavoriteItemService) private rpcFavoriteItemService: RpcFavoriteItemService,

        @inject(Types.Service) @named(Targets.Service.rpc.RpcPaymentInformationService) private rpcPaymentInformationService: RpcPaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcEscrowService) private rpcEscrowService: RpcEscrowService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcTestDataService) private rpcTestDataService: RpcTestDataService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcItemImageService) private rpcItemImageService: RpcItemImageService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcShippingDestinationService) private rpcShippingDestinationService: RpcShippingDestinationService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcItemLocationService) private rpcItemLocationService: RpcItemLocationService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcMessagingInformationService) private rpcMesInfoService: RpcMessagingInformationService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcBidService) private rpcBidService: RpcBidService,
        @inject(Types.Service) @named(Targets.Service.rpc.RpcMarketService) private rpcMarketService: RpcMarketService,

        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,

        @inject(Types.Factory) @named(Targets.Factory.RpcCommandFactory) private rpcCommandFactory: RpcCommandFactory
    ) {
        this.log = new Logger(__filename);

        // expose/"route" the rpc methods here
        // rpcmethod: injectedInstanceName.function
        this.exposedMethods = {

            // todo: figure out a working way to pass for example: this.escrowService.create
            'itemcategory.create': 'rpcItemCategoryService.create', // DONE
            'itemcategory.find': 'rpcItemCategoryService.findOne', // DONE
            'itemcategory.findall': 'rpcItemCategoryService.findAll', // DONE
            'itemcategory.findroot': 'rpcItemCategoryService.findRoot', // DONE
            'itemcategory.update': 'rpcItemCategoryService.update', // DONE
            'itemcategory.destroy': 'rpcItemCategoryService.destroy', // DONE

            'escrow.create': 'escrowService.rpcCreate', // DONE
            'escrow.find': 'escrowService.rpcFindOne', // DONE
            'escrow.findall': 'escrowService.rpcFindAll', // DONE
            'escrow.update': 'escrowService.rpcUpdate', // DONE
            'escrow.destroy': 'escrowService.rpcDestroy', // DONE

            'itemprice.create': 'itemPriceService.rpcCreate', // DONE
            'itemprice.find': 'itemPriceService.rpcFindOne', // DONE
            'itemprice.findall': 'itemPriceService.rpcFindAll', // DONE
            'itemprice.update': 'itemPriceService.rpcUpdate', // DONE
            'itemprice.destroy': 'itemPriceService.rpcDestroy', // DONE

            'paymentinformation.create': 'paymentInformationService.rpcCreate', // DONE
            'paymentinformation.find': 'paymentInformationService.rpcFindOne', // DONE
            'paymentinformation.findall': 'paymentInformationService.rpcFindAll', // DONE
            'paymentinformation.update': 'paymentInformationService.rpcUpdate', // DONE
            'paymentinformation.destroy': 'paymentInformationService.rpcDestroy', // DONE

            'itemimagedata.create': 'imageDataService.rpcCreate', // DONE
            'itemimagedata.find': 'imageDataService.rpcFindOne', // DONE
            'itemimagedata.findall': 'imageDataService.rpcFindAll', // DONE
            'itemimagedata.update': 'imageDataService.rpcUpdate', // DONE
            'itemimagedata.destroy': 'imageDataService.rpcDestroy', // DONE

            'itemimage.create': 'itemImageService.rpcCreate', // DONE
            'itemimage.find': 'itemImageService.rpcFindOne', // DONE
            'itemimage.findall': 'itemImageService.rpcFindAll', // DONE
            'itemimage.update': 'itemImageService.rpcUpdate', // DONE
            'itemimage.destroy': 'itemImageService.rpcDestroy', // DONE

            'locationmarker.create': 'locationMarkerService.rpcCreate', // DONE
            'locationmarker.find': 'locationMarkerService.rpcFindOne', // DONE
            'locationmarker.findall': 'locationMarkerService.rpcFindAll', // DONE
            'locationmarker.update': 'locationMarkerService.rpcUpdate', // DONE
            'locationmarker.destroy': 'locationMarkerService.rpcDestroy', // DONE

            'itemlocation.create': 'itemLocationService.rpcCreate', // DONE
            'itemlocation.find': 'itemLocationService.rpcFindOne', // DONE
            'itemlocation.findall': 'itemLocationService.rpcFindAll', // DONE
            'itemlocation.update': 'itemLocationService.rpcUpdate', // DONE
            'itemlocation.destroy': 'itemLocationService.rpcDestroy', // DONE

            'shipping.create': 'shippingDestinationService.rpcCreate', // DONE
            'shipping.find': 'shippingDestinationService.rpcFindOne', // DONE
            'shipping.findall': 'shippingDestinationService.rpcFindAll', // DONE
            'shipping.update': 'shippingDestinationService.rpcUpdate', // DONE
            'shipping.destroy': 'shippingDestinationService.rpcDestroy', // DONE

            'iteminformation.create': 'itemInformationService.rpcCreate', // DONE
            'iteminformation.find': 'itemInformationService.rpcFindOne', // DONE
            'iteminformation.findall': 'itemInformationService.rpcFindAll', // DONE
            'iteminformation.update': 'itemInformationService.rpcUpdate', // DONE
            'iteminformation.destroy': 'itemInformationService.rpcDestroy', // DONE

            'messaginginformation.create': 'messagingInformationService.rpcCreate', // DONE
            'messaginginformation.find': 'messagingInformationService.rpcFindOne', // DONE
            'messaginginformation.findall': 'messagingInformationService.rpcFindAll', // DONE
            'messaginginformation.update': 'messagingInformationService.rpcUpdate', // DONE
            'messaginginformation.destroy': 'messagingInformationService.rpcDestroy', // DONE

            'listingitem.create': 'listingItemService.create', // DONE
            'listingitem.find': 'listingItemService.findOne', // DONE
            'listingitem.findall': 'listingItemService.findAll', // DONE
            'listingitem.findbycategory': 'listingItemService.findByCategory', // DONE
            'listingitem.update': 'listingItemService.update', // DONE
            'listingitem.destroy': 'listingItemService.destroy', // DONE

            'profile.create': 'rpcProfileService.rpcCreate', // DONE
            'profile.update': 'rpcProfileService.rpcUpdate', // DONE
            'profile.find': 'rpcProfileService.rpcFindOne', // DONE

            'address.create': 'rpcAddressService.rpcCreate', // DONE
            'address.update': 'rpcAddressService.rpcUpdate', // DONE
            // everything above is/was used for testing

            // mappings below are for the final/real rpc api
            // profile
            'help': 'rpcCliHelpService.help', // DONE/TESTED

            'createprofile': 'rpcProfileService.create', // DONE
            'updateprofile': 'rpcProfileService.update', // DONE
            'getprofile': 'rpcProfileService.findOne', // DONE

            // profile / addresses
            'createaddress': 'rpcAddressService.create', // DONE
            'updateaddress': 'rpcAddressService.update', // DONE

            // listing items
            'finditems': 'rpcListingItemService.search', // DONE
            'getitem': 'rpcListingItemService.findOne', // DONE
            'findownitems': 'rpcListingItemService.findOwnItems', // DONE

            // listing items
            'createlistingitemtemplate': 'rpcListingItemTemplateService.create', // DONE
            'getlistingitemtemplate': 'rpcListingItemTemplateService.findOne', // DONE
            'searchlistingitemtemplate': 'rpcListingItemTemplateService.search', // DONE

            // item information
            'createiteminformation': 'rpcItemInformationService.create', // DONE
            'getiteminformation': 'rpcItemInformationService.findOne', // DONE
            'updateiteminformation': 'rpcItemInformationService.update', // DONE

            // categories
            'createcategory': 'rpcItemCategoryService.create', // DONE
            'updatecategory': 'rpcItemCategoryService.update', // DONE
            'removecategory': 'rpcItemCategoryService.destroy', // DONE
            'getcategories': 'rpcItemCategoryService.findRoot', // DONE
            'getcategory': 'rpcItemCategoryService.findOne', // DONE
            'findcategory': 'rpcItemCategoryService.search', // DONE

            // favorite items
            'addfavorite': 'rpcFavoriteItemService.create', // DONE
            'removefavorite': 'rpcFavoriteItemService.destroy', // DONE

            // paymentInformation
            'updatepaymentinformation': 'rpcPaymentInformationService.update',

            // escrow
            'createescrow': 'rpcEscrowService.create',
            'updateescrow': 'rpcEscrowService.update',
            'destroyescrow': 'rpcEscrowService.destroy',

            // test data management
            'cleandb': 'rpcTestDataService.clean',
            'adddata': 'rpcTestDataService.create',
            'generatedata': 'rpcTestDataService.generate',

            // itemImage
            'additemimage': 'rpcItemImageService.create',
            'removeitemimage': 'rpcItemImageService.destroy',
            // shippingDestination
            'addshippingdestination': 'rpcShippingDestinationService.create',
            'removeshippingdestination': 'rpcShippingDestinationService.destroy',

            // item location
            'updateitemlocation': 'rpcItemLocationService.update',
            'removeitemlocation': 'rpcItemLocationService.destroy',

            // message infoprmation
            'updatemessaginginformation': 'rpcMesInfoService.update',

            // Bid
            'findbids': 'rpcBidService.search',

            // market
            'addmarket': 'rpcMarketService.create'

        };
    }

    @httpPost('/')
    public async handleRPC( @response() res: myExpress.Response, @requestBody() body: any): Promise<any> {

        const rpcRequest = this.createRequest(body.method, body.params, body.id);
        this.log.debug('controller.handleRPC() rpcRequest:', JSON.stringify(rpcRequest, null, 2));

        // My code goes here
        const result = await this.rpcCommandFactory.get(body.method).execute(rpcRequest);
        return this.createResponse(rpcRequest.id, result);

        // check that we have exposed the method
       /* if (this.exposedMethods.hasOwnProperty(body.method)) {
            const callPath = this.exposedMethods[rpcRequest.method].split('.');

            // make sure we have an instance of the service and it contains the function we want to call
            if (this.hasOwnProperty(callPath[0]) && typeof this[callPath[0]][callPath[1]] === 'function') {

                this.log.debug('controller.handleRPC(), CALL: ' + rpcRequest.method + ' -> ' + this.exposedMethods[rpcRequest.method]);
                const result = await this[callPath[0]][callPath[1]](rpcRequest);
                // todo: no error handling here yet
                // todo: return this.createResponse(rpcRequest.id, null, error);
                return this.createResponse(rpcRequest.id, result);
            } else {
                return res.failed(400, this.getErrorMessage(RpcErrorCode.InternalError), new JsonRpcError(RpcErrorCode.InternalError,
                    'method: ' + body.method + ' routing failed.'));
            }
        } else {
            // no body.method found -> invalid call
            return res.failed(400, this.getErrorMessage(RpcErrorCode.MethodNotFound), new JsonRpcError(RpcErrorCode.MethodNotFound,
                'method: ' + body.method + ' not found.'));
        }
*/
    }

    private createRequest(method: string, params?: any, id?: string | number): RpcRequest {
        if (id === null || id === undefined) {
            id = this.generateId();
        } else if (typeof (id) !== 'number') {
            id = String(id);
        }
        return new RpcRequest({ jsonrpc: this.VERSION, method: method.toLowerCase(), params, id });
    }

    private createResponse(id: string | number = '', result?: any, error?: any): JsonRpc2Response {
        if (error) {
            return { id, jsonrpc: this.VERSION, error };
        } else {
            return { id, jsonrpc: this.VERSION, result };
        }
    }

    private generateId(): number {
        if (rpcIdCount >= this.MAX_INT32) {
            rpcIdCount = 0;
        }
        return ++rpcIdCount;
    }

    private getErrorMessage(code: number): string {
        switch (code) {
            case RpcErrorCode.ParseError:
                return 'Parse error';
            case RpcErrorCode.InvalidRequest:
                return 'Invalid Request';
            case RpcErrorCode.MethodNotFound:
                return 'Method not found';
            case RpcErrorCode.InvalidParams:
                return 'Invalid params';
            case RpcErrorCode.InternalError:
                return 'Internal error';
        }
        return 'Unknown Error';
    }
}
