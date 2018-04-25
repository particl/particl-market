import * as _ from 'lodash';
import { EnvConfig } from './EnvConfig';

export class DevelopmentEnvConfig extends EnvConfig {

    constructor(dataDirLocation?: string) {
        super(
            dataDirLocation || './'
        );
    }

}
