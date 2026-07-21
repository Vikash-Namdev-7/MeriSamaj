const express = require('express');
const router  = express.Router();

const chatCtrl = require('../../../controllers/matrimonial/matrimonialChatController');
const { checkFeature } = require('../../../middleware/subscriptionMiddleware');

// Chat is a Premium-only feature
router.get('/conversations',                            checkFeature('chat'), chatCtrl.getConversations);
router.post('/conversations',                           checkFeature('chat'), chatCtrl.openConversation);  // Open/find conversation by profileId
router.get('/conversations/:conversationId/messages',   checkFeature('chat'), chatCtrl.getMessages);
router.post('/conversations/:conversationId/messages',  checkFeature('chat'), chatCtrl.sendMessage);
router.delete('/messages/:messageId',                  checkFeature('chat'), chatCtrl.deleteMessage);

module.exports = router;
