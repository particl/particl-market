/// <reference types="node" />
/// <reference types="express" />
/**
 * core.Server
 * ------------------------------------
 *
 * The Server class is responsible to listen to http server
 * events and to react to it.
 */
import * as http from 'http';
import * as express from 'express';
export declare class Server {
    httpServer: http.Server;
    /**
     * Normalize port for the express application
     *
     * @param {string} port
     * @returns {(number | string | boolean)}
     *
     * @memberof Server
     */
    static normalizePort(port: string): number | string | boolean;
    private log;
    constructor(httpServer: http.Server);
    /**
     * Listen to the given http server
     *
     * @param {http.Server} httpServer
     * @param {express.Application} app
     *
     * @memberof Server
     */
    use(app: express.Application): void;
    /**
     * This is called when the server has started and is ready.
     *
     *
     * @memberof Server
     */
    onStartUp(app: express.Application): void;
    /**
     * This is called when the server throws an error like the given
     * port is already used
     *
     * @param {*} error
     *
     * @memberof Server
     */
    onError(error: any): void;
}
