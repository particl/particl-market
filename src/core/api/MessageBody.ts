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
import { validate } from 'class-validator';
import { ValidationException } from '../../api/exceptions/ValidationException';


export class MessageBody extends RequestBody {
  /**
   * Validates the body on the basis of the validator-annotations
   */
  public async validate(skipMissingProperties: boolean = false): Promise<void> {
      const errors = await validate(this, { skipMissingProperties });
      if (errors && errors.length > 0) {
        throw new ValidationException('Message body is not valid', errors);
      }
      return;
  }
}
