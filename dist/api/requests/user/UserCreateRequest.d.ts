import { RequestBody } from '../../../core/api/RequestBody';
/**
 * This class is used for create request. Create a new instance
 * with the json body and than call .validate() to check if
 * all criteria are given
 *
 * @export
 * @class UserCreateRequest
 * @extends {RequestBody}
 */
export declare class UserCreateRequest extends RequestBody {
    firstName: string;
    lastName: string;
    email: string;
    picture: string;
    auth0UserId: string;
}
