export interface MessageProcessorInterface {
    process( message: ActionMessage ): void;
}
