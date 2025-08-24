export default (plop) => {
    plop.setHelper('lowercase', text => text.toLowerCase())

    plop.setGenerator('action', {
        description: 'Create a new action class',
        prompts: [
            {
                type: 'list',
                name: 'type',
                message: 'Action type: ',
                choices: ["incoming", "outgoing"]
            },
            {
                type: 'input',
                name: 'name',
                message: 'Action name (PascalCase): ',
            },
        ],
        actions: (data) => {
            if (data.type === 'incoming') {
                return [{
                    type: 'add',
                    path: 'src/actions/incoming/{{ lowercase name }}.ts',
                    templateFile: 'plop-templates/incoming-action.hbs',
                }]
            }
            if (data.type === 'outgoing') {
                return [{
                    type: 'add',
                    path: 'src/actions/outgoing/{{ lowercase name }}.ts',
                    templateFile: 'plop-templates/outgoing-action.hbs',
                }]
            }
        }
    })
}
