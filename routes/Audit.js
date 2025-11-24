const express = require('express');
const router = express.Router();

const db = require('./shared/MysqlConnection')
const {directSelectQuery } = require('./shared/Shared');


router.post('/', async (req, res) => {

    const action = req.body.action

    try{
        let connection = await db.getConnection();
        if(connection){
            if(action == 'select'){
                let results1 = await directSelectQuery(connection, req.body.sql);
                res.send(results1)
            }
            connection.release();
        }
        
    }catch(error){
        connection.release();
        res.send(error)
    }
})

module.exports = router;