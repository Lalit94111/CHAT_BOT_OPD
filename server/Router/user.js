const express = require('express');
const router = express.Router();
const { createUser ,getUserById} = require('../Controller/userController');
const {getUserScores,getUserPatientScores} = require('../Controller/pointsController')

router.post('/create_user', createUser);
router.get('/fetch_user', getUserById);
router.get('/:userId/scores', getUserScores);
router.get('/user/:userId/patient/:patientId/scores', getUserPatientScores);

module.exports = router;
