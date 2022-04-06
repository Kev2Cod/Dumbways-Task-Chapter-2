
const {Pool} = require('pg')

const dbPool = new Pool({
    database: 'task_web_b33',
    port: 5432,
    user: 'postgres',
    password: 'root'
})

module.exports = dbPool