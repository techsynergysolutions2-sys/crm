const db = require('./MysqlConnection')
const {directSelectQuery} = require('./Shared');

const fnInitializeAndSendEmail = async (data) => {
    let connection = await db.getConnection();
    if(connection){
        let sql = `
            SELECT email,firstname,lastname FROM users 
            WHERE id = ${data.assignto};
        `

        try {
            let employee = await directSelectQuery(connection,sql);

            if (employee?.length > 0){
                SendTaskMail(data,employee[0].email,employee[0].firstname,employee[0].lastname)
            }

        } catch (error) {
            
        }
        
    }
}

module.exports.fnInitializeAndSendEmail = fnInitializeAndSendEmail

const SendTaskMail = (data,email,firstname,lastname) => {
    var transporter = nodemailer.createTransport({
        host: 'mail.ebencrm.com',
        port: 465,
        secure : true,
        auth: {
            user: 'noreply@ebencrm.com',
            pass: 'fs+W-cniRFu=W(F*'
        }
    });

    var mailOptions = {
        from: 'noreply@ebencrm.com',
        to: email,
        subject: `Task`,
        text: `Task`,
        html: `
                Good day. 

                I hope you are having a great day.

                <table style="border: 1px solid black;border-collapse: collapse;">
                    <tr>
                        <td style="border: 1px solid black;border-collapse: collapse;">Date</td>
                        <td style="border: 1px solid black;border-collapse: collapse;">${date.createddate}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid black;border-collapse: collapse;">Due date</td>
                        <td style="border: 1px solid black;border-collapse: collapse;">${data.duedate}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid black;border-collapse: collapse;">Assigned to</td>
                        <td style="border: 1px solid black;border-collapse: collapse;">${firstname} ${lastname}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid black;border-collapse: collapse;">Title</td>
                        <td style="border: 1px solid black;border-collapse: collapse;">${data.title}</td>
                    </tr>
                </table>
                
                Have a wonderfull day.
                `
    };


    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
    });
    
}



