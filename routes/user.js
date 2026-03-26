const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { requireLogin } = require('../middleware/auth');
const upload = require('../config/multer');

router.use(requireLogin);

router.get('/', ctrl.getProfile);
router.put('/', upload.single('avatar'), ctrl.updateProfile);
router.put('/password', ctrl.changePassword);
router.post('/address', ctrl.addAddress);
router.delete('/address/:idx', ctrl.deleteAddress);

module.exports = router;
