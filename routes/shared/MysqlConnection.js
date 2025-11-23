const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: "crm-main-database.c70iuwmoi6p8.eu-north-1.rds.amazonaws.com",
    user: "admin",
    password: "CnIghOFNoFtE5ylWR0Qy",
    database: "crm"
})

module.exports = db;