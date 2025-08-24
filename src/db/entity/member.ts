import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm'
import { Message } from './message.js'

@Entity()
export class Member {
    @PrimaryColumn({ type: 'uuid' })
        id!: string

    @Index()
    @Column({ unique: true })
        username!: string

    @Column()
        display_name!: string

    @Column()
        password!: string

    @Column({ type: 'text', nullable: true })
        avatar_url!: string | null

    @Column({ type: 'text', nullable: true })
        email_address!: string | null

    @CreateDateColumn()
        created_at!: Date

    @OneToMany(() => Message, (message) => message.member)
        messages!: Message[]
}
