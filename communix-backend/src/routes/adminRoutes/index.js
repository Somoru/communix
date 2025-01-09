const express = require('express');

const authRoutes = require('./auth');
const communityRoutes = require('./communities');
const userRoutes = require('./users');
const joinRequestRoutes = require('./joinRequests');
const dashboardRoutes = require('./dashboard');
const groupRoutes = require('./groups');
const moderationRoutes = require('./moderation');
const settingsRoutes = require('./settings');
const analyticsRoutes = require('./analytics');
const activityRoutes = require('./activity');

const router = express.Router();

// Mounting the admin routes
router.use('/auth', authRoutes);
router.use('/communities', communityRoutes);
router.use('/users', userRoutes);
router.use('/join-requests', joinRequestRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/groups', groupRoutes);
router.use('/moderation', moderationRoutes);
router.use('/settings', settingsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/activity', activityRoutes);

module.exports = router;
