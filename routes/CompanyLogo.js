const express = require('express');
const router = express.Router();

const db = require('./shared/MysqlConnection')
const { updateRecord } = require('./shared/Shared');


router.post('/', async (req, res) => {

    const action = req.body.action
    const data = req.body.data

    try{
        let connection = await db.getConnection();
        if(connection){
            if(action == 'update'){
                let results3 = await updateRecord(connection,req.body.tablename, data, req.body.whereCondition, req.body.whereValues)
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