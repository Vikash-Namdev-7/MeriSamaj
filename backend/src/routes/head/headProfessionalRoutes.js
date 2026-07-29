const express = require('express');
const router = express.Router();
const headProfessionalController = require('../../controllers/head/headProfessionalController');
const { authorize } = require('../../middleware/authMiddleware');

const headOrAdmin = authorize('head', 'admin', 'super_admin', 'master_admin');
const headOrSubHead = authorize('head', 'sub_head', 'admin', 'super_admin', 'master_admin');

// READ: Professional Directory Listings & Categories (Head, Sub-Head, Admins)
router.get('/filters', headOrSubHead, headProfessionalController.getFilterOptions);
router.get('/categories', headOrSubHead, headProfessionalController.getCategories);
router.get('/', headOrSubHead, headProfessionalController.getListings);
router.get('/:id', headOrSubHead, headProfessionalController.getListingById);

// WRITE/MUTATING: Category & Listing Moderation (Main Head and Admins only)
router.post('/categories', headOrAdmin, headProfessionalController.createCategory);
router.put('/categories/:id', headOrAdmin, headProfessionalController.updateCategory);
router.delete('/categories/:id', headOrAdmin, headProfessionalController.deleteCategory);

router.post('/:id/approve', headOrAdmin, headProfessionalController.approveListing);
router.post('/:id/reject', headOrAdmin, headProfessionalController.rejectListing);
router.post('/:id/verify', headOrAdmin, headProfessionalController.verifyCredentials);
router.post('/:id/suspend', headOrAdmin, headProfessionalController.suspendListing);
router.post('/:id/restore', headOrAdmin, headProfessionalController.restoreListing);
router.delete('/:id', headOrAdmin, headProfessionalController.deleteListing);

module.exports = router;
