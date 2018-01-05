/**
 * core.api.MessageBody
 * ------------------------------------------------
 *
 * This class is used to verify a valid payload and prepare
 * it for further actions in the services. To validate we
 * use the module 'class-validator'.
 *
 * If you want to skip missing properties just override the
 * validate method in your extended request class.
 */

import 'reflect-metadata';
import { RequestBody } from './RequestBody';

export class MessageBody extends RequestBody {
}
