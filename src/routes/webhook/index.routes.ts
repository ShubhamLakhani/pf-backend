import express, { Router } from 'express';
import { razorpayWebhook } from '../../webhooks/razorpay.webhook';

const router = Router();

router.post(
  '/razorpay',
  express.json({ type: 'application/json' }),
  razorpayWebhook
);

export default router;
