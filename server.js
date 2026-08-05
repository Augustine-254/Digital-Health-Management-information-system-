const express = require("express");
const Database = require('better-sqlite3');
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

let db = new Database('./database.db');

db.serialize(() => {
run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)");
run("CREATE TABLE IF NOT EXISTS patients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER, gender TEXT, phone TEXT)");
run("CREATE TABLE IF NOT EXISTS admissions (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, diagnosis TEXT, admit_date DATE, discharge_date DATE, outcome TEXT)");
run("CREATE TABLE IF NOT EXISTS anc (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, visit_no INTEGER, visit_date DATE, bp TEXT, weight REAL)");
run("CREATE TABLE IF NOT EXISTS delivery (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, delivery_date DATE, delivery_type TEXT, outcome TEXT)");
run("CREATE TABLE IF NOT EXISTS immunization (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, vaccine TEXT, date DATE)");
run("CREATE TABLE IF NOT EXISTS outpatient (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, diagnosis TEXT, visit_date DATE)");
run("CREATE TABLE IF NOT EXISTS pharmacy (id INTEGER PRIMARY KEY AUTOINCREMENT, drug TEXT, quantity INTEGER)");
run("CREATE TABLE IF NOT EXISTS lab (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, test TEXT, result TEXT, date DATE)");
run("CREATE TABLE IF NOT EXISTS billing (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, amount REAL, status TEXT)");
run("CREATE TABLE IF NOT EXISTS insurance (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, provider TEXT, claim_status TEXT)");
run("INSERT OR IGNORE INTO users (id, username, password, role) VALUES (1, 'admin', '123', 'Admin')");
});

// APIs
app.post("/add-patient", (req, res) => {let {name, age, gender, phone} = req.body; run("INSERT INTO patients (name, age, gender, phone) VALUES (?,?,?,?)", [name, age, gender, phone]); res.send({success: true});});
app.post("/add-outpatient", (req,res)=>{let {patient_id, diagnosis}=req.body; let date=new Date().toISOString().split('T')[0]; run("INSERT INTO outpatient (patient_id, diagnosis, visit_date) VALUES (?,?,?)",[patient_id, diagnosis, date]); res.send({success:true})})
app.get("/patients", (req, res) => {let search = req.query.search || ""; all("SELECT * FROM patients WHERE name LIKE?", [`%${search}%`], (err, rows) => res.json(rows));});
app.post("/admit-patient", (req, res) => {let {patient_id, diagnosis} = req.body; let date = new Date().toISOString().split('T')[0]; run("INSERT INTO admissions (patient_id, diagnosis, admit_date) VALUES (?,?,?)", [patient_id, diagnosis, date]); res.send({success: true});});
app.post("/discharge-patient", (req, res) => {let {id, outcome} = req.body; let date = new Date().toISOString().split('T')[0]; run("UPDATE admissions SET discharge_date=?, outcome=? WHERE id=?", [date, outcome, id]); res.send({success: true});});
app.post("/add-anc", (req, res) => {let {patient_id, visit_no, bp, weight} = req.body; let date = new Date().toISOString().split('T')[0]; run("INSERT INTO anc (patient_id, visit_no, visit_date, bp, weight) VALUES (?,?,?,?,?)", [patient_id, visit_no, date, bp, weight]); res.send({success: true});});
app.post("/add-delivery", (req, res) => {let {patient_id, delivery_type, outcome} = req.body; let date = new Date().toISOString().split('T')[0]; run("INSERT INTO delivery (patient_id, delivery_date, delivery_type, outcome) VALUES (?,?,?,?)", [patient_id, date, delivery_type, outcome]); res.send({success: true});});
app.post("/add-vaccine", (req, res) => {let {patient_id, vaccine} = req.body; let date = new Date().toISOString().split('T')[0]; run("INSERT INTO immunization (patient_id, vaccine, date) VALUES (?,?,?)", [patient_id, vaccine, date]); res.send({success: true});});
app.post("/add-drug", (req, res) => {let {drug, quantity} = req.body; db.run("INSERT INTO pharmacy (drug, quantity) VALUES (?,?)", [drug, quantity]); res.send({success: true});});
app.get("/pharmacy", (req, res) => db.all("SELECT * FROM pharmacy", [], (err, rows) => res.json(rows)));
app.post("/add-lab", (req, res) => {let {patient_id, test, result} = req.body; let date = new Date().toISOString().split('T')[0]; db.run("INSERT INTO lab (patient_id, test, result, date) VALUES (?,?,?,?)", [patient_id, test, result, date]); res.send({success: true});});
app.get("/lab", (req, res) => db.all("SELECT * FROM lab", [], (err, rows) => res.json(rows)));
app.post("/add-bill", (req, res) => {let {patient_id, amount} = req.body; db.run("INSERT INTO billing (patient_id, amount, status) VALUES (?,?, 'Unpaid')", [patient_id, amount]); res.send({success: true});});
app.get("/billing", (req, res) => db.all("SELECT * FROM billing", [], (err, rows) => res.json(rows)));
app.post("/sha-claim", (req, res) => {let {patient_id, amount} = req.body; db.run("INSERT INTO insurance (patient_id, provider, claim_status) VALUES (?, 'SHA', 'Submitted')", [patient_id]); res.json({success: true, message: "SHA Claim Submitted"});});
app.post("/login", (req, res) => {let {username, password} = req.body; db.get("SELECT * FROM users WHERE username =? AND password =?", [username, password], (err, user) => {if(user) res.json({success: true, role: user.role}); else res.json({success: false});})});
app.get("/moh-report/:form", (req, res) => res.json({form: req.params.form, month: req.query.month, data: []}));
app.get("/chart-data", (req, res) => db.all("SELECT diagnosis, COUNT(*) as total FROM outpatient GROUP BY diagnosis", [], (err, rows) => res.json(rows)));

app.listen(PORT, () => console.log("Digital Health HMIS running on port " + PORT));
