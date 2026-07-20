const express = require('express');
const router = express.Router();
const headProfessionalController = require('../../controllers/head/headProfessionalController');

router.get('/filters', headProfessionalController.getFilterOptions);
router.get('/categories', headProfessionalController.getCategories);
router.post('/categories', headProfessionalController.createCategory);
router.put('/categories/:id', headProfessionalController.updateCategory);
router.delete('/categories/:id', headProfessionalController.deleteCategory);

router.get('/', headProfessionalController.getListings);
router.get('/:id', headProfessionalController.getListingById);
router.post('/:id/approve', headProfessionalController.approveListing);
router.post('/:id/reject', headProfessionalController.rejectListing);
router.post('/:id/verify', headProfessionalController.verifyCredentials);
router.post('/:id/suspend', headProfessionalController.suspendListing);
router.post('/:id/restore', headProfessionalController.restoreListing);

module.exports = router;
