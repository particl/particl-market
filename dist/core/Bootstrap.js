"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_express_utils_1 = require("inversify-express-utils");
const Server_1 = require("./Server");
const Logger_1 = require("./Logger");
const ApiInfo_1 = require("./ApiInfo");
const ApiMonitor_1 = require("./ApiMonitor");
const exceptionHandler_1 = require("./api/exceptionHandler");
const extendExpressResponse_1 = require("./api/extendExpressResponse");
const SwaggerUI_1 = require("./SwaggerUI");
const CliIndex_1 = require("./CliIndex");
const SocketIoServer_1 = require("./SocketIoServer");
class Bootstrap {
    constructor() {
        this.log = new Logger_1.Logger(__filename);
    }
    defineExpressApp(app) {
        app.set('host', process.env.APP_HOST);
        app.set('port', Server_1.Server.normalizePort(process.env.PORT || process.env.APP_PORT || '3000'));
        return app;
    }
    setupMonitor(app) {
        const apiMonitor = new ApiMonitor_1.ApiMonitor();
        apiMonitor.setup(app);
    }
    setupCoreTools(app) {
        const apiInfo = new ApiInfo_1.ApiInfo();
        apiInfo.setup(app);
        const cliIndex = new CliIndex_1.CliIndex();
        cliIndex.setup(app);
        const swaggerUI = new SwaggerUI_1.SwaggerUI();
        swaggerUI.setup(app);
    }
    startServer(app) {
        return app.listen(app.get('port'));
    }
    setupInversifyExpressServer(app, ioc) {
        const inversifyExpressServer = new inversify_express_utils_1.InversifyExpressServer(ioc.container, undefined, {
            rootPath: process.env.APP_URL_PREFIX
        }, app);
        inversifyExpressServer.setConfig((a) => a.use(extendExpressResponse_1.extendExpressResponse));
        inversifyExpressServer.setErrorConfig((a) => a.use(exceptionHandler_1.exceptionHandler));
        return inversifyExpressServer;
    }
    bindInversifyExpressServer(app, inversifyExpressServer) {
        try {
            app = inversifyExpressServer.build();
        }
        catch (e) {
            this.log.error(e.message);
            process.exit(1);
        }
        return app;
    }
    createSocketIoServer(server, ioc) {
        return new SocketIoServer_1.SocketIoServer(server.httpServer, ioc);
    }
}
exports.Bootstrap = Bootstrap;
//# sourceMappingURL=Bootstrap.js.map