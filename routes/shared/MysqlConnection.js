const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "Junior980417",
    database: "crm"
})

module.exports = db;