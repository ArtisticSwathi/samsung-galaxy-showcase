import express from 'express';
import { createOrder, getOrderById } from '../controllers/orderController.js';

const router = express.Router();

router.route('/')
  .post(createOrder);

router.route('/:id')
  .get(getOrderById);

export default router;
