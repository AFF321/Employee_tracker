const inquirer = require('inquirer');
const mysql = require('mysql')
require('dotenv').config();
const cTable = require('console.table');
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER,
    password:     process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  




function start(){
    inquirer
    .prompt([
        {
            type:'list',
            name: 'list',
            message:'do you want to add a employee,view the departments and employees, or update a employee?',
            choices:['add','view','update','exit']        
        },
        ])
        .then((answers) =>{
        if (answers.list == 'add'){
        addquestions();
        } else if (answers.list == 'view'){
            view();
      
        }
        else if (answers.list == 'update'){
            updateemp();
        }
        else{
            console.log("have a nice day!")
            connection.end();
        }
    })
};

function addquestions(){
inquirer
.prompt([
    {
        type:'list',
        name:'addq',
        message:'what do you want to add',
        choices:['department','roles','employee']
    }
])
.then((answers) => {
    if(answers.addq == 'department'){
        addde();
    }
    else if(answers.addq == 'roles'){
        addr();
    }
    else if(answers.addq == 'employee'){
        addemp();
    }
   else{
       console.log('please enter a value');
       
   }
    });
};

function addde(){
inquirer
.prompt([
    {
        type:'imput',
        name:'id',
        message:'what id should it have'
    },
    {
        type:'input',
        name:'dename',
        message:'name of the department?'
    }
])
.then((answers) =>{
    console.log('creating...\n');
const query =connection.query(`INSERT INTO department SET ?`,
{
    id:answers.id,
    name:answers.dename
},
(err, res) => {
    if (err) throw err;
    console.log(`Department made!\n`);
    start()
})})
}

function addr(){
inquirer
.prompt([
    {
        type:'imput',
        name:'rid',
        message:'what id should it have?',
    },
    {
        type:'imput',
        name:'title',
        message:`what is the role's name?`
    },
    {
        type:'imput',
        name:'salary',
        message:'how much does it pay?'
    },
    {
        type:'imput',
        name:'derole',
        message:'what depertment id does it have'
    }
])
.then((answers)=>{
    console.log('creating...\n');
    const query =connection.query(`INSERT INTO role SET ?`,
    {
        id:answers.rid,
        title:answers.title,
        salary:answers.salary,
        department_id:answers.derole
    },
    (err, res) => {
        if (err) throw err;
        console.log(`Role made!\n`);
        start()
    }
)})}

function addemp(){
    connection.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        // Log all results of the SELECT statement
      
    
inquirer
.prompt([
    {
        type:'imput',
        name:'eid',
        message:'what id should it have?',
    },
    {
        type:'imput',
        name:'efname',
        message:`what is the employee's first name?`
    },
    {
        type:'imput',
        name:'elname',
        message:`what is the employee's last name?`
    },
    {
        type:'list',
        name:'emrole',
        choices(){
            const choiceArray =[];
            res.forEach(({id,title})=> {
                choiceArray.push(id,title)
            });
            return choiceArray
        },
        message:'what is their role'
    },
    {
        type:'input',
        name:'emmanager',
        message:'what is their manager?(you can leave it empty)'
    },
    
])

.then((answers) =>{
    const query = connection.query(`INSERT INTO employee SET ?`,{
        id:answers.eid,
        first_name:answers.efname,
        last_name:answers.elname,
        role_id:answers.emrole,
        manager_id:answers.emanager
    })
    console.log(` employee added!\n`);
    start()
})
})
}



function view(){
const query= connection.query(`SELECT * FROM employee LEFT JOIN role ON employee. role_id = role. id LEFT JOIN department ON role. department_id = department. id;`,
(err, res) => {
    console.log(`---------------------------------------------------------`)
    console.log(`| Id | First Name | Last Name | role | pay | department |`)
    console.log(`|-------------------------------------------------------|`)
    if (err) throw err;
    res.forEach(({ id,first_name, last_name, title,salary,name }) => {
    console.log(`| ${id} | ${first_name} | ${last_name} | ${title}| ${salary} | ${name} |`);
    console.log(`|-------------------------------------------------------|`)
    })
    console.log(`|  I probably spent more time on this than I should've  |`)
    console.log(`---------------------------------------------------------\n`)

    start()
    })
}

function updateemp(){
    connection.query(`SELECT * FROM employee`,(err, res) =>{
        if (err) throw err
    
    inquirer
    .prompt([
        {
            type: 'rawlist',
            name: 'employee',
            choices(){
                const choiceArray =[];
                res.forEach(({first_name})=> {
                    choiceArray.push(first_name)
                });
                return choiceArray
            },
            message:'who would you like to change?'
        }

    ]).then((answers) =>{
        updateem(answers)
    })
    })
}
function updateem(answers){
const item = answers.employee
connection.query(`SELECT * FROM employee WHERE first_name=?`,
                [item],
(err, res) =>{
    if (err) throw err;
    console.log(`-----------------------------------------`)
    console.log(`| Id | First Name | Last Name | role id |`)
    console.log(`|---------------------------------------|`)
    res.forEach(({id, first_name, last_name, role_id,manager_id})=>{
        console.log(`| ${id} | ${first_name} | ${last_name} | ${role_id}                   |`)
    })
    console.log(`-----------------------------------------\n`)

inquirer
.prompt([
    {
        type: 'input',
        name: 'newrole',
        message:'please enter a new role id number'
    },
])
.then((answers) =>{
    connection.query(`UPDATE employee SET ? WHERE ?`,
    [
        {
            role_id:answers.newrole
        },
        {
            first_name:item
        }
    ],
    (err,res) => {
        if(err) throw err;
        console.log(`role changed! \n`)
        start()
    }
    )
})

}
)
}


connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    start();
  });
