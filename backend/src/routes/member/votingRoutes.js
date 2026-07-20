const express = require('express');
const router = express.Router();
const votingController = require('../../controllers/member/votingController');

router.get('/', votingController.getVotings);
router.get('/:id', votingController.getVotingById);
router.post('/:id/vote', votingController.castVote);

module.exports = router;
