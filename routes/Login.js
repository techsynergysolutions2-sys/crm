const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')

const db = require('./shared/MysqlConnection')
const { selectQuery,directSelectQuery } = require('./shared/Shared');

// aa192rhyiiM36x4NP5VxczwqsJ92
router.post('/', async (req, res) => {

    let connection = await db.getConnection()

    if(connection){
        console.log(req.body.where.email)
         try{
            let email = req.body.where.email
            let password = req.body.where.password
            let sql = `SELECT * FROM employees WHERE email = '${email}' AND isactive = 1`

            let rows = await directSelectQuery(connection, sql);
            
            if (rows.length === 0) {
                let obj = {code:1, error: "Invalid email or password" }
                res.send(obj)
            }

            const user = rows[0];

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                let obj = {code:1, error: "Invalid email or password" }
                res.send(obj)
            }else{
                let obj = {code:200, error: "", userid: user.id }
                res.send(obj)
            }
        }catch(error){
            res.send(error)
        }

        connection.release();

    }else{
        let err = {
            code: 100,
            description: 'Something went wrong when trying to get db connection'
        }
        res.send(err)
    }

})

module.exports = router;
