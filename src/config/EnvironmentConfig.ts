import { Environment } from '../core/helpers/Environment';
import { EnvConfig } from './env/EnvConfig';
import { ProductionEnvConfig } from './env/ProductionEnvConfig';
import { DevelopmentEnvConfig } from './env/DevelopmentEnvConfig';
import { TestEnvConfig } from './env/TestEnvConfig';

let config;

export const envConfig = (): EnvConfig => {
    if (config) {
        console.log('envConfig allready created...');
        return config;
    }

    if (Environment.isProduction() || Environment.isAlpha()) {
        config = new ProductionEnvConfig();
    } else if (Environment.isDevelopment()) {
        config = new DevelopmentEnvConfig();
    } else if (Environment.isTest()) {
        config = new TestEnvConfig(process.env.MP_DATA_FOLDER || './data/tests', process.env.MP_DOTENV_FILE || '.env.test');
    } else if (Environment.isBlackBoxTest()) {
        config = new TestEnvConfig(process.env.MP_DATA_FOLDER || './data', process.env.MP_DOTENV_FILE || '.env.blackbox');
    } else {
        config = new EnvConfig(process.env.MP_DATA_FOLDER || './data', process.env.MP_DOTENV_FILE || '.env');
    }
    return config;
};

