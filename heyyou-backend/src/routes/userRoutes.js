
const express = require('express');
const { registerUser, getNearbyUsers } = require('../controllers/userController');

const router = express.Router();

router.post('/register', registerUser);
router.get('/nearby-users', getNearbyUsers);

module.exports = router;
