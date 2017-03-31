import C from './constants'
import {organizations} from './initialState'

console.log(`
            organizations
            ---------------
${organizations.map((organization) =>    {
        return '\t' + organization.link+ '\n'
    }
)
}

    `);

    // {return '\t' + organization.desc+ '\n'}
