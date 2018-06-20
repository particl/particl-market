import { EnvConfig } from './EnvConfig';

export class AlphaEnvConfig extends EnvConfig {

    constructor() {
        super();

        process.env.SWAGGER_ENABLED = false;

    }
}
