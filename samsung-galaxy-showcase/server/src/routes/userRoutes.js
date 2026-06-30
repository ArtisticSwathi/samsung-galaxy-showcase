const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  updateUserPassword,
  deleteUserAccount
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes under this router
router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

router.route('/addresses')
  .post(addUserAddress);

router.route('/addresses/:addressId')
  .put(updateUserAddress)
  .delete(deleteUserAddress);

router.put('/addresses/:addressId/default', setDefaultAddress);

router.put('/password', updateUserPassword);

router.delete('/account', deleteUserAccount);

module.exports = router;
