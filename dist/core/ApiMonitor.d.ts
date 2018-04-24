/// <reference types="express" />
import * as express from 'express';
export declare class ApiMonitor {
    static getRoute(): string;
    setup(app: express.Application): void;
}
