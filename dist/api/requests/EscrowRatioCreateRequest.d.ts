import { RequestBody } from '../../core/api/RequestBody';
export declare class EscrowRatioCreateRequest extends RequestBody {
    escrow_id: number;
    buyer: number;
    seller: number;
}
