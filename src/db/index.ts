import 'reflect-metadata'
import 'dotenv/config'
import { DataSource } from 'typeorm'
import { Member } from './entity/member.js'
import { Message } from './entity/message.js'
import { Channel } from './entity/channel.js'

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    username: process.env.DB_USER ?? 'lewla',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'lewla',
    port: Number(process.env.DB_PORT) ?? 5432,
    entities: [Member, Message, Channel],
    synchronize: true,
    logging: false,
    migrations: ['dist/db/migrations/*.js'],
})

export default AppDataSource
