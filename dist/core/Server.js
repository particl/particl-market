"use strict";
/**
 * core.Server
 * ------------------------------------
 *
 * The Server class is responsible to listen to http server
 * events and to react to it.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("./Logger");
const Environment_1 = require("./helpers/Environment");
const SwaggerUI_1 = require("./SwaggerUI");
const ApiMonitor_1 = require("./ApiMonitor");
const ApiInfo_1 = require("./ApiInfo");
const CliIndex_1 = require("./CliIndex");
class Server {
    constructor(httpServer) {
        this.httpServer = httpServer;
        this.log = new Logger_1.Logger(__filename);
    }
    /**
     * Normalize port for the express application
     *
     * @param {string} port
     * @returns {(number | string | boolean)}
     *
     * @memberof Server
     */
    static normalizePort(port) {
        const parsedPort = parseInt(port, 10);
        if (isNaN(parsedPort)) {
            return port;
        }
        if (parsedPort >= 0) {
            return parsedPort;
        }
        return false;
    }
    /**
     * Listen to the given http server
     *
     * @param {http.Server} httpServer
     * @param {express.Application} app
     *
     * @memberof Server
     */
    use(app) {
        this.httpServer.on('listening', () => {
            this.onStartUp(app);
        });
        this.httpServer.on('error', (error) => {
            this.onError(error);
        });
    }
    /**
     * This is called when the server has started and is ready.
     *
     *
     * @memberof Server
     */
    onStartUp(app) {
        this.log.debug(``);
        this.log.debug(`Aloha, your app is ready on ${app.get('host')}:${app.get('port')}${process.env.APP_URL_PREFIX}`);
        this.log.debug(`To shut it down, press <CTRL> + C at any time.`);
        this.log.debug(``);
        this.log.debug('-------------------------------------------------------');
        this.log.debug(`Environment  : ${Environment_1.Environment.getNodeEnv()}`);
        // this.log.debug(`Version      : ${Environment.getPkg().version}`);
        this.log.debug(``);
        if (Environment_1.Environment.isTruthy(process.env.API_INFO_ENABLED)) {
            this.log.debug(`API Info     : ${app.get('host')}:${app.get('port')}${ApiInfo_1.ApiInfo.getRoute()}`);
        }
        if (Environment_1.Environment.isTruthy(process.env.SWAGGER_ENABLED)) {
            this.log.debug(`Swagger      : ${app.get('host')}:${app.get('port')}${SwaggerUI_1.SwaggerUI.getRoute()}`);
        }
        if (Environment_1.Environment.isTruthy(process.env.CLI_ENABLED)) {
            this.log.debug(`CLI          : ${app.get('host')}:${app.get('port')}${CliIndex_1.CliIndex.getRoute()}`);
        }
        if (Environment_1.Environment.isTruthy(process.env.MONITOR_ENABLED)) {
            this.log.debug(`Monitor      : ${app.get('host')}:${app.get('port')}${ApiMonitor_1.ApiMonitor.getRoute()}`);
        }
        this.log.debug(`RPCServer    : ${app.get('host')}:${app.get('port')}/api/rpc`);
        this.log.debug('-------------------------------------------------------');
        this.log.debug('');
    }
    /**
     * This is called when the server throws an error like the given
     * port is already used
     *
     * @param {*} error
     *
     * @memberof Server
     */
    onError(error) {
        if (error.syscall !== 'listen') {
            throw error;
        }
        switch (error.code) {
            case 'EACCES':
                this.log.error(`The Server requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                this.log.error(`Port is already in use or blocked by the os`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }
}
exports.Server = Server;
//# sourceMappingURL=Server.js.map