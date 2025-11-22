const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000


app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(bodyParser.urlencoded({extended: true}))

const login = require('./routes/Login')
const employees = require('./routes/Employees')
const clients = require('./routes/Clients')
const departments = require('./routes/Departments')
const projects = require('./routes/Projects')
const projectinvites = require('./routes/ProjectInvite')
const tasks = require('./routes/Tasks')
const tasknotes = require('./routes/TaskNotes')
const products = require('./routes/Products')
const orders = require('./routes/Orders')
const groups = require('./routes/Groups')
const company = require('./routes/Company')
const leaves = require('./routes/Leaves')
const tickets = require('./routes/Tickets')
const ticketnotes = require('./routes/TicketNotes')
const ticketcategory = require('./routes/TicketCategory')
const dashboard = require('./routes/Dashboard')
const dashboardlinechart = require('./routes/DashboardLineChart')
const payments = require('./routes/Payments')
const space = require('./routes/Space')
const companylogo = require('./routes/CompanyLogo')
const attachments = require('./routes/Attachments')
const skills = require('./routes/Skills')

const inventory = require('./routes/publicapi/Inventory')
const comporders = require('./routes/publicapi/CompOrders')

app.use('/login', login)
app.use('/employees', employees)
app.use('/clients', clients)
app.use('/departments', departments) 
app.use('/projects', projects)
app.use('/projectinvites', projectinvites)
app.use('/tasks', tasks)
app.use('/tasknotes', tasknotes)
app.use('/products', products)
app.use('/orders', orders)
app.use('/groups', groups)
app.use('/company', company)
app.use('/leaves', leaves)
app.use('/tickets', tickets)
app.use('/ticketnotes', ticketnotes)
app.use('/ticketcategory', ticketcategory)
app.use('/dashboard', dashboard)
app.use('/dashboardlinechart', dashboardlinechart)
app.use('/comporders', comporders)
app.use('/payments', payments)
app.use('/space', space)
app.use('/companylogo', companylogo)
app.use('/attachments', attachments)
app.use('/skills', skills)

app.use('/inventory', inventory)


app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))