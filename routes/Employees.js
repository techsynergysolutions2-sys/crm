const express = require('express');
const router = express.Router();

const db = require('./shared/MysqlConnection')
const {insertRecord, directSelectQuery, updateRecord,fnHashPassword } = require('./shared/Shared');


router.post('/', async (req, res) => {

    const action = req.body.action
    const data = req.body.data

    try{
        let connection = await db.getConnection();
        if(connection){
            if(action == 'select'){
                let results1 = await directSelectQuery(connection, req.body.sql);
                res.send(results1)
            }else if(action == 'new'){
                const hashedPassword = await fnHashPassword(data['password'])
                data['createddate'] = new Date().toISOString().slice(0, 16)
                data['photourl'] = 'https://firebasestorage.googleapis.com/v0/b/crm-solutions-34e5f.firebasestorage.app/o/images.png?alt=media&token=bccf245d-fdf2-41b1-8369-41ef443900b2'
                data['password'] = hashedPassword
                let results2 = await insertRecord(connection,req.body.tablename, data)
                res.send(results2)
            }else if(action == 'update'){
                let results3
                if(data['password'] == undefined ){
                    if(data['status'] == 5){
                        data['isactive'] = 0 
                    }
                    results3 = await updateRecord(connection,req.body.tablename, data, req.body.whereCondition, req.body.whereValues)
                }else{
                    const hashedPassword = await fnHashPassword(data['password'])
                    data['password'] = hashedPassword
                    results3 = await updateRecord(connection,req.body.tablename, data, req.body.whereCondition, req.body.whereValues)
                   
                }
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