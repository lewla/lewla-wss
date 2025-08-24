import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm'
import { Message } from './message.js'

@Entity()
export class Channel {
    @PrimaryColumn({ type: 'uuid' })
        id!: string

    @Column()
        type!: string

    @Column()
        name!: string

    @Column()
        order!: number

    @OneToMany(() => Message, (message) => message.channel)
        messages!: Message[]
}
