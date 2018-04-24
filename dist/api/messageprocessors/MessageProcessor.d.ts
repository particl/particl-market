/// <reference types="node" />
import { Logger as LoggerType } from '../../core/Logger';
import { EventEmitter } from '../../core/api/events';
import { SmsgMessage } from '../messages/SmsgMessage';
import { SmsgService } from '../services/SmsgService';
import { MessageProcessorInterface } from './MessageProcessorInterface';
export declare class MessageProcessor implements MessageProcessorInterface {
    private smsgService;
    Logger: typeof LoggerType;
    eventEmitter: EventEmitter;
    log: LoggerType;
    private timeout;
    private interval;
    constructor(smsgService: SmsgService, Logger: typeof LoggerType, eventEmitter: EventEmitter);
    /**
     * main messageprocessor, ...
     *
     * @param {SmsgMessage[]} messages
     * @returns {Promise<void>}
     */
    process(messages: SmsgMessage[]): Promise<void>;
    stop(): void;
    schedulePoll(): void;
    /**
     * main poller
     *
     * @returns {Promise<void>}
     */
    private poll();
    private pollMessages();
    private parseJSONSafe(json);
    private getActionEventType(message);
}
