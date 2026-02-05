const express = require('express');
const router = express.Router();
const pteroController = require('../controllers/pteroController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/servers', authenticate, authorize(['reseller', 'admin']), pteroController.getServers);
router.post('/servers', authenticate, authorize(['reseller', 'admin']), pteroController.createResellerServer);
router.delete('/servers/:id', authenticate, authorize(['reseller', 'admin']), pteroController.deleteResellerServer);

module.exports = router;
