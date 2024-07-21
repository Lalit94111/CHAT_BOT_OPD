const Patient = require('../models/Patient'); 
const Solution = require('../models/Solution');

const {createPatientSummary} = require('../utils')

const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll();
        res.status(200).json(patients);
    } catch (error) {
        console.error('Error fetching patients data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createPatientAndSolution = async (req, res) => {
    const { patient, correctTest, correctDiagnosis } = req.body;

    try {
        if (!patient || !correctTest || !correctDiagnosis) {
            return res.status(400).json({ message: 'Patient data, correctTest, and correctDiagnosis are required' });
        }

        const patientSummary = await createPatientSummary(patient)
        // console.log(patientSummary)

        const newPatient = await Patient.create({
            age: patient.age,
            gender: patient.gender,
            history: patient.history,
            symptoms: patient.symptoms,
            additionalInfo: patient.additionalInfo,
            patientSummary : patientSummary
        });

        const newSolution = await Solution.create({
            correctTest,
            correctDiagnosis,
            patientId: newPatient.id 
        });

        res.status(201).json({
            patient: newPatient,
            solution: newSolution
        });

    } catch (error) {
        console.error('Error creating patient and solution:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createPatientAndSolution,getAllPatients
};
