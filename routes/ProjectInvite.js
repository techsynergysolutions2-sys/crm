const express = require('express');
const router = express.Router();

const db = require('./shared/MysqlConnection')
const {insertRecord, directSelectQuery, updateRecord } = require('./shared/Shared');


router.post('/', async (req, res) => {

    const action = req.body.action
    const data = req.body.data

    try{
        let connection = await db.getConnection();
        if(connection){
            if(action == 'select'){
                let results1 = await directSelectQuery(connection, req.body.sql);
                connection.release();
                res.send(results1)
            }else if(action == 'new'){
                data['createddate'] = new Date().toISOString().slice(0, 16)
                let results2 = await insertRecord(connection,req.body.tablename, data)
                let sql = `
                    SELECT e.id, e.email, e.phone ,CONCAT(e.firstname, ' ', e.lastname) AS full_name FROM employees e WHERE e.id = ${results2.insertId}
                `
                let userinfor = await directSelectQuery(connection, sql);
                connection.release();
                res.send(userinfor)
            }else if(action == 'update'){
                let results3 = await updateRecord(connection,req.body.tablename, data, req.body.whereCondition, req.body.whereValues)
                connection.release();
                res.send(results3)
            }
            connection.release();
        }
        
    }catch(error){
        console.log(error)
        res.send(error)
    }
})

module.exports = router;