const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    updateOrderToPaidByArtist,
    updateOrderToDelivered,
    getMyOrders,
    getArtistOrders,
    getOrders
} = require('../controllers/orderController');
const { protect, admin, artist } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/artist').get(protect, artist, getArtistOrders);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/mark-paid').put(protect, artist, updateOrderToPaidByArtist);
router.route('/:id/deliver').put(protect, artist, updateOrderToDelivered);

module.exports = router;
