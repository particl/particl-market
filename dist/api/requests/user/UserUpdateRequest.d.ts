import { RequestBody } from '../../../core/api/RequestBody';
/**
 * This class is used for update request. Create a new instance
 * with the json body and than call .validate() to check if
 * all criteria are given
 *
 * @export
 * @class UserUpdateRequest
 * @extends {RequestBody}
 */
export declare class UserUpdateRequest extends RequestBody {
    firstName: string;
    lastName: string;
    email: string;
    picture: string;
    auth0UserId: string;
    /**
     * We override the validate method so we can skip the missing
     * properties.
     */
    validate(): Promise<void>;
}
