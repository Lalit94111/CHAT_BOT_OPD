// routes/patientRoutes.js
const express = require('express');
const router = express.Router();
const { createPatientAndSolution,getAllPatients } = require('../Controller/patientController');

// Route to create a new patient and solution
router.post('/create_patient', createPatientAndSolution);

router.get('/get_patients',getAllPatients)

module.exports = router;
