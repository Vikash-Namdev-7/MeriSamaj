const express = require('express');
const router = express.Router();
const adminProfessionalController = require('../../controllers/admin/adminProfessionalController');

router.get('/filter-options', adminProfessionalController.getFilterOptions);
router.get('/categories', adminProfessionalController.getCategories);
router.post('/categories', adminProfessionalController.createCategory);
router.put('/categories/:id', adminProfessionalController.updateCategory);
router.delete('/categories/:id', adminProfessionalController.deleteCategory);

router.get('/', adminProfessionalController.getListings);
router.get('/:id', adminProfessionalController.getListingById);
router.post('/:id/approve', adminProfessionalController.approveListing);
router.post('/:id/reject', adminProfessionalController.rejectListing);
router.post('/:id/verify', adminProfessionalController.verifyCredentials);
router.post('/:id/suspend', adminProfessionalController.suspendListing);
router.post('/:id/reactivate', adminProfessionalController.reactivateListing);

module.exports = router;
