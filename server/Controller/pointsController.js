// controllers/pointsController.js
const UserResults = require('../models/UserResults'); // Import the UserResults model

const getUserScores = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Calsulating score of that question where testAnswered and diagnosisAnswered is set to True
        const results = await UserResults.findAll({
            where: {
                userId: userId,
                testAnswered: true,
                diagnosisAnswered: true
            }
        });

        const totalScore = results.reduce((sum, result) => sum + result.testPoint + result.diagnosisPoint, 0);

        res.status(200).json({ totalScore });
    } catch (error) {
        console.error('Error fetching user scores:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getUserPatientScores = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const patientId = parseInt(req.params.patientId, 10);

        if (isNaN(userId) || isNaN(patientId)) {
            return res.status(400).json({ message: 'Invalid user ID or patient ID' });
        }

        const result = await UserResults.findOne({
            where: {
                userId: userId,
                patientId: patientId
            }
        });

        if (!result) {
            return res.status(404).json({ message: 'User or Patient not found' });
        }

        res.status(200).json({
            testScore: result.testPoint,
            diagnosisScore: result.diagnosisPoint
        });
    } catch (error) {
        console.error('Error fetching user patient scores:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getUserScores,
    getUserPatientScores
};
