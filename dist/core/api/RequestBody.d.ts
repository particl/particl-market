/**
 * core.api.RequestBody
 * ------------------------------------------------
 *
 * This class is used to verify a valid payload an prepare
 * it for further actions in the services. To validate we
 * use the module 'class-validator'.
 *
 * If you want to skip missing properties just override the
 * validate method in your extended request class.
 */
import 'reflect-metadata';
export declare class RequestBody {
    /**
     * Creates an instance of RequestBody and if a input is given
     * we store the values into the correct property
     */
    constructor(input?: any);
    /**
     * Validates the body on the basis of the validator-annotations
     */
    validate(skipMissingProperties?: boolean): Promise<void>;
}
