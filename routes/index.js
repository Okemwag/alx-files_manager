const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const UserController = require('../controllers/UserController');
const FilesController = require('../controllers/FilesController');

const router = express.Router();

// App
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

// Users
router.post('/users', UsersController.postNew);
router.get('/users/me', UserController.getMe);

// Auth
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// Files
router.post('/files', FilesController.postUpload);

module.exports = router;
