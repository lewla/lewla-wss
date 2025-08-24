import { In, MigrationInterface, QueryRunner } from "typeorm";
import { Channel } from "../entity/channel.js";

export class CreateDefaults1755984147183 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager.getRepository(Channel).insert([
            {
                id: '645f447b-4158-4c34-a4bd-689adc182420',
                type: 'text',
                name: 'general',
                order: 1
            },
            {
                id: '126acff9-624a-402b-accd-e392eb01389d',
                type: 'text',
                name: 'spam',
                order: 2
            },
            {
                id: 'e65de169-9d32-425b-afc6-ede57e8b0302',
                type: 'voice',
                name: 'voice-1',
                order: 3
            },
            {
                id: 'aca06e01-2fb7-45db-8a18-6bd96e4d3c65',
                type: 'voice',
                name: 'voice-2',
                order: 4
            },
            {
                id: '5daa2a09-b911-4367-93f9-0e195750b173',
                type: 'voice',
                name: 'voice-3',
                order: 5
            },
        ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.manager.getRepository(Channel).delete({
            id: In([
                '645f447b-4158-4c34-a4bd-689adc182420',
                '126acff9-624a-402b-accd-e392eb01389d',
                'e65de169-9d32-425b-afc6-ede57e8b0302',
                'aca06e01-2fb7-45db-8a18-6bd96e4d3c65',
                '5daa2a09-b911-4367-93f9-0e195750b173',
            ])
        })
    }

}
