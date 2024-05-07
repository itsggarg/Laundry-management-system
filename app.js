const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");
const path = require("path");
const { isNumberObject } = require("util/types");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.render("home");
});

/**********************************employee*********************************/
app.get("/employee", function (req, res, next) {
  try {
    var sql1 = "SELECT * FROM employee";
    db.query(sql1, (error, results, fields) => {
      if (error) {
        throw error;
      }
      const employees = results;
      res.render("employee", { employees: employees });
    });
  } catch (err) {
    next(err);
  }
});

app.post("/addEmployee", function (req, res, next) {
  try {
    var employeeCode = parseInt(req.body.employee_code);
    var name = req.body.name;
    var age = parseInt(req.body.age);
    var sex = req.body.sex;

    if (isNaN(employeeCode) || isNaN(age)) {
      console.log("Invalid employee data");
      res.redirect("/employee");
      return;
    }

    var sql =
      "INSERT INTO employee(employee_code, name, age, sex) VALUES (?, ?, ?, ?)";
    var values = [employeeCode, name, age, sex];

    db.query(sql, values, function (err, result) {
      if (err) {
        throw err;
      } else {
        console.log("Employee added successfully");
        res.redirect("/employee");
      }
    });
  } catch (err) {
    next(err);
  }
});


app.get("/searchEmployee", (req, res) => {
  const searchName = req.query.searchName;
  const query = "SELECT * FROM employee WHERE name LIKE '%" + searchName + "%'";
  db.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send("Error searching for employee");
    } else {
      res.render("employee", { employees: results });
    }
  });
});

app.get("/searchByCode", function (req, res) {
  var employeeCode = req.query.employee_code;
  db.query(
    "SELECT * FROM employee WHERE employee_code = ?",
    [employeeCode],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("Error searching for employee");
      } else {
        res.render("employee", { employees: results });
      }
    }
  );
});

app.post("/employee-details", function (req, res) {
  var employeeCode = parseInt(req.body.employeeCode);

  if (isNaN(employeeCode)) {
    console.log("Invalid employee data");
    return res.status(400).send("Invalid employee data");
  }

  var q1 =
    "SELECT * FROM employee INNER JOIN employee_contacts ON employee.employee_code = employee_contacts.employee_code INNER JOIN salary ON employee.employee_code = salary.employee_code WHERE employee.employee_code= ?; ";

  db.query(q1, [employeeCode], function (err, results) {
    if (err) {
      console.log("Error retrieving employee data: " + err.message);
      return res.status(500).send("Error retrieving employee data");
    } else if (results.length === 0) {
      console.log("Employee not found");
      return res.status(404).send("Employee not found");
    } else {
      res.render("employee-details", { results });
    }
  });
});

/*************************Add employee details*******************************************/

app.post("/add-employee-details/:employee_code", (req, res) => {
  const { employee_code } = req.params;
  const { contact } = req.body;

  const sql =
    "INSERT INTO employee_contacts (employee_code, contact_no) VALUES (?, ?)";
  db.query(sql, [employee_code, contact], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error adding contact for employee");
      return;
    }
    console.log("Contact added successfully!");
    res.redirect("/employee");
  });
});

app.post('/addsal/:employee_code', (req, res) => {
  const employee_code = req.params.employee_code;
  const amount = req.body.amount;
  const previous_sal_due = req.body.previous_sal_due;

  const sql = 'SELECT * FROM salary WHERE employee_code = ?';
  db.query(sql, [employee_code], (err, result) => {
    if (err) {
      console.error('Error selecting salary:', err);
      res.status(500).send('Error selecting salary');
      return;
    }
    if (result.length) {
      // If salary details already exist, update them
      const sql2 = 'UPDATE salary SET amount = ?, previous_sal_due = ? WHERE employee_code = ?';
      db.query(sql2, [amount, previous_sal_due, employee_code], (err, result) => {
        if (err) {
          console.error('Error updating salary:', err);
          res.status(500).send('Error updating salary');
          return;
        }
        console.log('salary updated successfully!');
        res.redirect('/employee');
      });
    } else {
      // If salary details don't exist, insert them
      const sql3 = 'INSERT INTO salary (employee_code, amount, previous_sal_due) VALUES (?, ?, ? )';
      db.query(sql3, [employee_code, amount, previous_sal_due], (err, result) => {
        if (err) {
          console.error('Error adding salary:', err);
          res.status(500).send('Error adding salary');
          return;
        }
        console.log('salary added successfully!');
        res.redirect('/employee');
      });
    }
  });
});


app.get("/add-employee-details", function (req, res) {
  const employee_code = req.query.employee_code;
  if (!employee_code) {
    return res.status(400).send("Missing employee code");
  }
  res.render("add-employee-details", { employee_code: employee_code });
});


/***********************************customer*********************************************/

app.get("/customer", function (req, res) {
  var sql2 = "SELECT * FROM customer";
  db.query(sql2, (error, results, fields) => {
    if (error) {
      console.log("Error fetching customers: " + error.message);
      res.redirect("/");
      return;
    }
    const customers = results;
    res.render("customer", { customers: customers });
  });
});

app.post("/addCustomer", function (req, res) {
  var customerCode = parseInt(req.body.customer_code);
  var name = req.body.name;
  var previous_money_dues = parseInt(req.body.previous_money_dues);

  if (isNaN(customerCode) || isNaN(previous_money_dues)) {
    console.log("Invalid customer data");
    res.redirect("/customer");
    return;
  }

  var sql3 =
    "INSERT INTO customer(customer_code, name, previous_money_dues) VALUES (?, ?, ?)";
  var cvalues = [customerCode, name, previous_money_dues];

  db.query(sql3, cvalues, function (err, result) {
    if (err) {
      console.log("Error adding customer: " + err.message);
      res.redirect("/customer");
      return;
    }
    console.log("Customer added successfully");
    res.redirect("/customer");
  });
});


app.get("/searchCustomer", (req, res) => {
  const searchName = req.query.searchName;
  const query = "SELECT * FROM customer WHERE name LIKE '%" + searchName + "%'";
  db.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send("Error searching for customer");
    } else {
      res.render("customer", { customers: results });
    }
  });
});

app.get("/searchbycustomercode", function (req, res) {
  var customerCode = req.query.customer_code;
  db.query(
    "SELECT * FROM customer WHERE customer_code = ?",
    [customerCode],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send("Error searching for customer");
      } else {
        res.render("customer", { customers: results });
      }
    }
  );
});

app.post("/customer-details", function (req, res) {
  var customerCode = parseInt(req.body.customerCode);

  if (isNaN(customerCode)) {
    console.log("Invalid customer data");
    res.redirect("/customer");
    return;
  }

  var q5 =
    "SELECT * FROM customer INNER JOIN cloth ON customer.customer_code = cloth.customer_code INNER JOIN bill ON customer.customer_code = bill.customer_code WHERE customer.customer_code= ?; ";

  db.query(q5, [customerCode], function (err, results) {
    if (err) {
      console.log("Error retrieving customer details: " + err.message);
      res.redirect("/customer");
    } else if (results.length === 0) {
      console.log("Customer not found");
      res.redirect("/customer");
    } else {
      res.render("customer-details", { results });
    }
  });
});


app.post("/bills", function (req, res) {
  var customerCode = parseInt(req.body.customerCode);

  if (isNaN(customerCode)) {
    console.log("Invalid customer data");
    res.redirect("/customer");
    return;
  }

  var q6 = "SELECT * FROM bill INNER JOIN customer ON customer.customer_code = bill.customer_code WHERE customer.customer_code= ?; ";

  db.query(q6, [customerCode], function (err, results) {
    if (err) {
      console.log("Error getting bills: " + err.message);
      res.redirect("/customer");
    } else {
      res.render("bills", { results });
    }
  });
});


/*****************************************************supplier******************************************************/
app.get("/supplier", function (req, res) {
  var sql20 = "SELECT * FROM supplier";
  db.query(sql20, (error, results, fields) => {
    if (error) {
      console.log("Error retrieving suppliers: " + error.message);
      res.status(500).send("Error retrieving suppliers");
      return;
    }
    const suppliers = results;
    res.render("supplier", { suppliers: suppliers });
  });
});

app.post("/addSupplier", function (req, res) {
  var supplierCode = parseInt(req.body.supplier_code);
  var name = req.body.name;
  var total_dues = parseInt(req.body.total_dues);

  if (isNaN(supplierCode)) {
    console.log("Invalid supplier data");
    res.redirect("/supplier");
    return;
  }

  var sql30 =
    "INSERT INTO supplier(supplier_code, name,total_dues) VALUES (?, ?, ?)";
  var hvalues = [supplierCode, name, total_dues];

  db.query(sql30, hvalues, function (err, result) {
    if (err) {
      console.log("Error adding supplier: " + err.message);
      res.status(500).send("Error adding supplier");
      return;
    }
    console.log("supplier added successfully");
    res.redirect("/supplier");
  });
});

app.get("/searchSupplier", (req, res) => {
  const sname = req.query.name;
  const sql40 = "SELECT * FROM supplier WHERE name LIKE '%" + sname + "%'";
  db.query(sql40, (error, results) => {
    if (error) {
      console.log("Error searching for supplier: " + error.message);
      res.status(500).send("Error searching for supplier");
      return;
    }
    res.render("supplier", { suppliers: results });
  });
});

app.get("/searchSupplierbycode", function (req, res) {
  var supplierCode = req.query.supplier_code;
  db.query(
    "SELECT * FROM supplier WHERE supplier_code = ?",
    [supplierCode],
    function (error, results, fields) {
      if (error) {
        console.log("Error retrieving supplier: " + error.message);
        res.status(500).send("Error retrieving supplier");
        return;
      }
      res.render("supplier", { suppliers: results });
    }
  );
});


app.post("/supplier-details", function (req, res) {
  var supplierCode = parseInt(req.body.supplierCode);

  if (isNaN(supplierCode)) {
    console.log("Invalid supplier data");
    res.redirect("/supplier");
    return;
  }

  var q1 =
    "SELECT * FROM supplier INNER JOIN supplier_contact ON supplier.supplier_code = supplier_contact.supplier_code INNER JOIN supplier_rate_list ON supplier.supplier_code =  supplier_rate_list.supplier_code WHERE supplier.supplier_code= ?; ";

  db.query(q1, [supplierCode], function (err, results) {
    if (err) {
      console.log("Error retrieving supplier details: " + err.message);
      res.status(500).send("Error retrieving supplier details");
      return;
    }
    res.render("supplier-details", { results });
  });
});

/*******************************************add supplier details******************************************/
app.post("/add-supplier-details/:supplier_code", (req, res) => {
  const { supplier_code } = req.params;
  const { contact } = req.body;

  const sql =
    "INSERT INTO supplier_contact (supplier_code, contact_no) VALUES (?, ?)";
  db.query(sql, [supplier_code, contact], (err, result) => {
    if (err) {
      console.log("Error adding contact: " + err.message);
      res.status(500).send("Error adding contact");
    } else {
      console.log("Contact added successfully!");
      res.redirect("/supplier");
    }
  });
});


app.post('/addrate/:supplier_code', (req, res) => {
  const supplier_code = req.params.supplier_code;
  const product_name = req.body.product_name;
  const rate = req.body.rate;

  const sql = 'SELECT * FROM supplier_rate_list WHERE supplier_code = ?';
  db.query(sql, [supplier_code], (err, result) => {
    if (err) {
      console.log("Error fetching supplier rate details: " + err.message);
      res.status(500).send("Error fetching supplier rate details");
    } else {
      if (result.length == 0) {
        // If salary details don't exist, insert them
        const sql14 = 'INSERT INTO supplier_rate_list(supplier_code, product_name, rate) VALUES (?, ?, ? )';
        db.query(sql14, [supplier_code, product_name, rate], (err, result) => {
          if (err) {
            console.log("Error adding supplier rate details: " + err.message);
            res.status(500).send("Error adding supplier rate details");
          } else {
            console.log('updated supplier_rate_list!');
            res.redirect('/add-supplier-details');
          }
        });
      } else {
        // If salary details already exist, update them
        const sql15 = 'UPDATE supplier_rate_list SET rate = ? WHERE supplier_code = ? AND product_name = ?';
        db.query(sql15, [rate, supplier_code, product_name], (err, result) => {
          if (err) {
            console.log("Error updating supplier rate details: " + err.message);
            res.status(500).send("Error updating supplier rate details");
          } else {
            console.log('updated supplier_rate_list!');
            res.redirect('/add-supplier-details');
          }
        });
      }
    }
  });
});


app.get("/add-supplier-details", function (req, res) {
  const supplier_code = req.query.supplier_code;

  var q2 =
    "SELECT * FROM supplier INNER JOIN supplier_contact ON supplier.supplier_code = supplier_contact.supplier_code INNER JOIN supplier_rate_list ON supplier.supplier_code = supplier_rate_list.supplier_code WHERE supplier.supplier_code= ?";

  db.query(q2, [supplier_code], function (err, results) {
    if (err) {
      console.log("Error fetching supplier details: " + err.message);
      res.status(500).send("Error fetching supplier details");
    } else {
      res.render("add-supplier-details", { results: results, supplier_code: supplier_code });
    }
  });
});


/***************************************************Depository*************************************************/

app.get("/depository", function (req, res) {
  var sql8 = "SELECT * FROM depository";
  db.query(sql8, (error, results, fields) => {
    if (error) {
      console.log("Error fetching depository data: " + error.message);
      res.status(500).send("Error fetching depository data");
      return;
    }
    const depository = results;
    res.render("depository", { depository: depository });
  });
});

/*******************************************************supplier-bills***********************************************/
app.get("/transactions", function (req, res) {
  var sql9 = "SELECT * FROM transactions";
  db.query(sql9, (error, results, fields) => {
    if (error) {
      console.log("Error fetching transactions: " + error.message);
      res.status(500).send("Error fetching transactions");
    } else {
      const transactions = results;
      res.render("transactions", { transactions: transactions });
    }
  });
});

app.get("/transactions/search", function (req, res) {
  var transactionId = req.query.transaction_id;
  var sql = "SELECT * FROM transactions WHERE transaction_id = ?";
  db.query(sql, [transactionId], (error, results, fields) => {
    if (error) {
      console.log("Error searching transaction: " + error.message);
      res.status(500).send("Error searching transaction");
    } else {
      const transactions = results;
      res.render("transactions", { transactions: transactions });
    }
  });
});

app.get("/transactions/search1", function (req, res) {
  var supplierCode = req.query.supplier_code;
  var sql22 = "SELECT * FROM transactions WHERE supplier_code = ?";
  db.query(sql22, [supplierCode], (error, results, fields) => {
    if (error) {
      console.log("Error searching transaction: " + error.message);
      res.status(500).send("Error searching transaction");
    } else {
      const transactions = results;
      res.render("transactions", { transactions: transactions });
    }
  });
});

/********************************************************customer bills*****************************************/
app.get("/bill", function (req, res) {
  var sql10 = "SELECT * FROM bill";
  db.query(sql10, (error, results, fields) => {
    if (error) {
      console.error("Error fetching bill details:", error);
      res.status(500).send("Error fetching bill details");
      return;
    }
    const bill = results;
    res.render("bill", { bill: bill });
  });
});

app.get("/bill/search", function (req, res) {
  var bill_code = req.query.bill_code;
  var sql32= "SELECT * FROM bill WHERE bill_code = ?";
  db.query(sql32, [bill_code], (error, results, fields) => {
    if (error) {
      console.error("Error fetching bill details:", error);
      res.status(500).send("Error fetching bill details");
      return;
    }
    const bill = results;
    res.render("bill", { bill: bill });
  });
});

app.get("/bill/search1", function (req, res) {
  var customer_code = req.query.customer_code;
  var sql26 = "SELECT * FROM bill WHERE customer_code = ?";
  db.query(sql26, [customer_code], (error, results, fields) => {
    if (error) {
      console.error("Error fetching bill details:", error);
      res.status(500).send("Error fetching bill details");
      return;
    }
    const bill = results;
    res.render("bill", { bill: bill });
  });
});



/***********************************************************cloth***********************************************/
app.get("/cloth", function (req, res) {
  var sql12 = "SELECT * FROM cloth";
  db.query(sql12, (error, results, fields) => {
    if (error) throw error;
    const cloth = results;
    res.render("cloth", { cloth: cloth });
  });
});

app.get("/cloth/search", function (req, res) {
  var cloth_code = req.query.cloth_code;
  var sql34= "SELECT * FROM cloth WHERE cloth_code = ?";
  db.query(sql34, [cloth_code], (error, results, fields) => {
    if (error) throw error;
    const cloth = results;
    res.render("cloth", { cloth: cloth });
  });
});


app.get("/cloth/search1", function (req, res) {
  var customer_code = req.query.customer_code;
  var sql26 = "SELECT * FROM cloth WHERE customer_code = ?";
  db.query(sql26, [customer_code], (error, results, fields) => {
    if (error) throw error;
    const cloth = results;
    res.render("cloth", { cloth: cloth });
  });
});

/*******************************************************rate_list************************************************/
app.get("/rate_list", function (req, res) {
  var sql14 = "SELECT * FROM rate_list";
  db.query(sql14, (error, results, fields) => {
    if (error) {
      console.error(error);
      return res.status(500).send("An error occurred while fetching rate list data");
    }
    const rate_list = results;
    res.render("rate_list", { rate_list: rate_list });
  });
});


/****************************************************supplier_rate_list************************************************/
app.get("/supplier_rate_list", function (req, res) {
  var sql16 = "SELECT * FROM supplier_rate_list";
  db.query(sql16, (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
      return;
    }
    const supplier_rate_list = results;
    res.render("supplier_rate_list", { supplier_rate_list: supplier_rate_list });
  });
});



/***********************************************************************************************************************/
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  database: "laundry_management",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database: " + err.stack);
    return;
  }
  console.log("database connected");
});

app.listen(3000, function () {
  console.log("server started on port 3000");
});
