
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const app = express();
app.use(express.json());
app.use(express.static("public"));

let db = new sqlite3.Database("./database.db");

db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)");
db.run("CREATE TABLE IF NOT EXISTS patients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER, gender TEXT, phone TEXT)");
db.run("CREATE TABLE IF NOT EXISTS admissions (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, diagnosis TEXT, admit_date DATE, discharge_date DATE, outcome TEXT)");
db.run("CREATE TABLE IF NOT EXISTS anc (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, visit_no INTEGER, visit_date DATE, bp TEXT, weight REAL)");
db.run("CREATE TABLE IF NOT EXISTS delivery (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, delivery_date DATE, delivery_type TEXT, outcome TEXT)");
db.run("CREATE TABLE IF NOT EXISTS immunization (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, vaccine TEXT, date DATE)");
db.run("CREATE TABLE IF NOT EXISTS outpatient (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, diagnosis TEXT, visit_date DATE)");
db.run("CREATE TABLE IF NOT EXISTS pharmacy (id INTEGER PRIMARY KEY AUTOINCREMENT, drug TEXT, quantity INTEGER)");
db.run("CREATE TABLE IF NOT EXISTS lab (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, test TEXT, result TEXT, date DATE)");
db.run("CREATE TABLE IF NOT EXISTS billing (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, amount REAL, status TEXT)");
db.run("CREATE TABLE IF NOT EXISTS insurance (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, provider TEXT, claim_status TEXT)");

db.run("INSERT OR IGNORE INTO users (id, username, password, role) VALUES (1, 'admin', '123', 'Admin')");

app.post("/add-patient", (req, res) => {let {name, age, gender, phone} = req.body; db.run("INSERT INTO patients (name, age, gender, phone) VALUES (?,?,?,?)", [name, age, gender, phone]); res.send({success: true});});
app.post("/add-outpatient", (req,res)=>{let {patient_id, diagnosis}=req.body; let date=new Date().toISOString().split('T')[0]; db.run("INSERT INTO outpatient (patient_id, diagnosis, visit_date) VALUES (?,?,?)",[patient_id, diagnosis, date]); res.send({success:true})})
app.get("/patients", (req, res) => {let search = req.query.search || ""; db.all("SELECT * FROM patients WHERE name LIKE?", [`%${search}%`], (err, rows) => res.json(rows));});
app.post("/admit-patient", (req, res) => {let {patient_id, diagnosis} = req.body; let date = new Date().toISOString().split('T')[0]; db.run("INSERT INTO admissions (patient_id, diagnosis, admit_date) VALUES (?,?,?)", [patient_id, diagnosis, date]); res.send({success: true});});
app.post("/add-anc", (req, res) => {let {patient_id, visit_no, bp, weight} = req.body; let date = new Date().toISOString().split('T')[0]; db.run("INSERT INTO anc (patient_id, visit_no, visit_date, bp, weight) VALUES (?,?,?,?,?)", [patient_id, visit_no, date, bp, weight]); res.send({success: true});});
app.post("/add-delivery", (req, res) => {let {patient_id, delivery_type, outcome} = req.body; let date = new Date().toISOString().split('T')[0]; db.run("INSERT INTO delivery (patient_id, delivery_date, delivery_type, outcome) VALUES (?,?,?,?)", [patient_id, date, delivery_type, outcome]); res.send({success: true});});
app.post("/add-vaccine", (req, res) => {let {patient_id, vaccine} = req.body; let date = new Date().toISOString().split('T')[0]; db.run("INSERT INTO immunization (patient_id, vaccine, date) VALUES (?,?,?)", [patient_id, vaccine, date]); res.send({success: true});});
app.post("/add-drug", (req, res) => {let {drug, quantity} = req.body; db.run("INSERT INTO pharmacy (drug, quantity) VALUES (?,?)", [drug, quantity]); res.send({success: true});});
app.get("/pharmacy", (req, res) => db.all("SELECT * FROM pharmacy", [], (err, rows) => res.json(rows)));
app.post("/add-lab", (req, res) => {let {patient_id, test, result} = req.body; let date = new Date().toISOString().split('T')[0]; db.run("INSERT INTO lab (patient_id, test, result, date) VALUES (?,?,?,?)", [patient_id, test, result, date]); res.send({success: true});});
app.get("/lab", (req, res) => db.all("SELECT * FROM lab", [], (err, rows) => res.json(rows)));
app.post("/add-bill", (req, res) => {let {patient_id, amount} = req.body; db.run("INSERT INTO billing (patient_id, amount, status) VALUES (?,?, 'Unpaid')", [patient_id, amount]); res.send({success: true});});
app.get("/billing", (req, res) => db.all("SELECT * FROM billing", [], (err, rows) => res.json(rows)));
app.post("/sha-claim", (req, res) => {let {patient_id, amount} = req.body; db.run("INSERT INTO insurance (patient_id, provider, claim_status) VALUES (?, 'SHA', 'Submitted')", [patient_id]); res.json({success: true, claim_id: "SHA" + Date.now()});});
app.post("/login", (req, res) => {let {username, password} = req.body; db.get("SELECT * FROM users WHERE username =? AND password =?", [username, password], (err, user) => {if(user) res.json({success: true, role: user.role}); else res.json({success: false});});

app.listen(3000, () => console.log("KENYA HMIS running on http://localhost:3000"));
