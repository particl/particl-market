import { RequestBody } from '../../core/api/RequestBody';
export declare class ActionMessageUpdateRequest extends RequestBody {
    action: string;
    nonce: string;
    accepted: boolean;
}
