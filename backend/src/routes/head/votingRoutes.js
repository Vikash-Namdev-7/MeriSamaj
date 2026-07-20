const express = require('express');
const router = express.Router();
const votingController = require('../../controllers/head/votingController');

router.get('/', votingController.getElections);
router.post('/', votingController.createElection);
router.delete('/:id', votingController.deleteElection);
router.put('/:id/close', votingController.closeElection);

module.exports = router;
