import * as _ from 'lodash';
import { EnvConfig } from './EnvConfig';
import {Environment} from '../../core/helpers/Environment';

export class TestEnvConfig extends EnvConfig {

    constructor(dataDirLocation?: string, envFileName?: string) {
        super(
            dataDirLocation || './',
            envFileName || '.env.test'
        );

        Environment.useExpress = false;
        Environment.useSocketIO = false;
    }

}
