"use strict";
/**
 * IOC - CONTAINER
 * ----------------------------------------
 *
 * Bind every controller and service to the ioc container. All controllers
 * will then be bonded to the express structure with their defined routes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const constants_1 = require("../constants");
const request = require("request");
class IocConfig {
    configure(ioc) {
        /**
         * Here you can bind all your third-party libraries like
         * request, lodash and so on. Those will be bound before
         * everything else.
         */
        ioc.configureLib((container) => {
            inversify_1.decorate(inversify_1.injectable(), request);
            container
                .bind(constants_1.Types.Lib)
                .toConstantValue(request)
                .whenTargetNamed('request');
            return container;
        });
        /**
         * Bind custom classes here. This will be bound at the end
         */
        ioc.configure((container) => {
            // Add your custom class here
            return container;
        });
    }
}
exports.IocConfig = IocConfig;
//# sourceMappingURL=IocConfig.js.map