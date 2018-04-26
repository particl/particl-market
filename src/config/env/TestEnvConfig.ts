import * as _ from 'lodash';
import { EnvConfig } from './EnvConfig';

export class TestEnvConfig extends EnvConfig {

    constructor(dataDirLocation?: string, envFileName?: string) {
        super(
            dataDirLocation || './',
            envFileName || '.env.test'
        );

        this.useExpress = false;
        this.useSocketIO = false;
    }

}
