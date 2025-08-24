/* eslint-disable @typescript-eslint/indent */
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm'
import { Member } from './member.js'
import { Channel } from './channel.js'

@Entity()
export class Message {
    @PrimaryColumn({ type: 'uuid' })
        id!: string

    @ManyToOne(() => Channel, (channel) => channel.messages)
        channel!: Relation<Channel>

    @ManyToOne(() => Member, (member) => member.messages)
        member!: Relation<Member>

    @CreateDateColumn()
        created_at!: Date

    @Column()
        type!: string

    @Column('jsonb')
        body!: {
            text?: string
            components?: Array<{
                type: string
                data: any
            }>
        }
}
