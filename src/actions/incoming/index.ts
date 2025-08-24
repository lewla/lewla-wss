import { readdirSync } from 'fs'
import { type BaseAction } from '../base.js'
import path from 'path'

export const actions = new Map<string, typeof BaseAction>()

const dir = path.resolve(process.cwd(), './dist/actions/incoming')
const actionFiles = readdirSync(dir).filter((file) => file !== 'index.js' && file.endsWith('.js'))

const loadClasses = async (): Promise<void> => {
    for (const file of actionFiles) {
        const classModule: Record<string, typeof BaseAction> = await import('./' + file)
        const className: string = Object.keys(classModule)[0]
        const actionClass = classModule[className]

        actions.set(actionClass.identifier, actionClass)
    }
}

loadClasses().catch((error) => { console.error(error) })
