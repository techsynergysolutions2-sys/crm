const express = require('express');
const router = express.Router();

const db = require('./shared/MysqlConnection')
const {insertRecord, selectQuery, updateRecord } = require('./shared/Shared');


router.post('/', async (req, res) => {

    const action = req.body.action
    const data = req.body.data

    try{
        let connection = await db.getConnection();
        if(connection){
            if(action == 'select'){
                let results1 = await selectQuery(connection, req.body.tablename, req.body.where, req.body.columns);
                connection.release();
                res.send(results1)
            }else if(action == 'new'){
                data['createddate'] = Date.now() / 1000
                let results2 = await insertRecord(connection,req.body.tablename, data)
                connection.release();
                res.send(results2)
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