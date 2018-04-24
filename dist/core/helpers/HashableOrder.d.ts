/**
 * core.api.HashableOrder
 *
 */
import { OrderCreateRequest } from '../../api/requests/OrderCreateRequest';
export declare class HashableOrder {
    buyer: string;
    seller: string;
    itemHashes: string[];
    constructor(hashThis: OrderCreateRequest);
}
