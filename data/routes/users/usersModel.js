const bcrypt = require('bcryptjs')
const db = require('../../config/dbConfig')

const get = () => {
    return db('users')
        .select('id', 'username')
    }
    
const getBy = (filter) => {
    return db('users')
    .where(filter)
    .select(['id', 'username', 'password'])
    .first()
}

const getById = async (id) => {
    const user = await db('users')
        .where({ id })
        .first('id', 'username', 'password')

    const projects = await db('projects')
        .where('user_id', id)
        .select('*')

    projects.map((project) => {
        return {...project, funding_completed: project.funding_completed === 1 ? true : false }
    })
    return {...user, projects}
}

//Apparently this is how I would need to set it up for postgres?
const add = async (user) => {
    user.password =  bcrypt.hashSync(user.password, 10)
    const [id] = await db('users')
        .insert(user, process.env.NODE_ENV === 'production' ? 'id' : null)
        .returning('*')
        console.log('new user id', id.id)
    return getById(process.env.NODE_ENV === 'production'? id.id : id)
}

//this is how I would need it to migrate to postgres
const update = async (id, changes) => {
    await db('users')
        .where({ id })
        .update(changes)
        .returning('*')
}

const remove = (id) => {
    return db('users')
        .where({ id })
        .del()
}

module.exports = {
    get,
    getBy,
    getById,
    add,
    update,
    remove
}