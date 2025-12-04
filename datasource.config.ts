import { DataSource, DataSourceOptions } from 'typeorm';

const ormConfig: DataSourceOptions = {
  type: 'postgres',
  database: 'bullcrux',
  entities: [],
  migrations: ['dist/migrations/*.ts'],
  synchronize: false,
  username:'postgres',
  password: '1234'
};

export const dataSource = new DataSource(ormConfig)
export default ormConfig;