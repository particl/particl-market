import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../constants';
import { Setting } from '../models/Setting';
import { DatabaseException } from '../exceptions/DatabaseException';
import { NotFoundException } from '../exceptions/NotFoundException';
import { Logger as LoggerType } from '../../core/Logger';

export class SettingRepository {

    public log: LoggerType;

    constructor(
        @inject(Types.Model) @named(Targets.Model.Setting) public SettingModel: typeof Setting,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async findAll(): Promise<Bookshelf.Collection<Setting>> {
        const list = await this.SettingModel.fetchAll();
        return list as Bookshelf.Collection<Setting>;
    }

    public async findOne(id: number, withRelated: boolean = true): Promise<Setting> {
        return this.SettingModel.fetchById(id, withRelated);
    }

    public async create(data: any): Promise<Setting> {
        const setting = this.SettingModel.forge<Setting>(data);
        try {
            const settingCreated = await setting.save();
            return this.SettingModel.fetchById(settingCreated.id);
        } catch (error) {
            throw new DatabaseException('Could not create the setting!', error);
        }
    }

    public async update(id: number, data: any): Promise<Setting> {
        const setting = this.SettingModel.forge<Setting>({ id });
        try {
            const settingUpdated = await setting.save(data, { patch: true });
            return this.SettingModel.fetchById(settingUpdated.id);
        } catch (error) {
            throw new DatabaseException('Could not update the setting!', error);
        }
    }

    public async destroy(id: number): Promise<void> {
        let setting = this.SettingModel.forge<Setting>({ id });
        try {
            setting = await setting.fetch({ require: true });
        } catch (error) {
            throw new NotFoundException(id);
        }

        try {
            await setting.destroy();
            return;
        } catch (error) {
            throw new DatabaseException('Could not delete the setting!', error);
        }
    }

}
