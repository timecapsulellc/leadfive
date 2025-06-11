// OrphiChain Push Notification Server
// Integrates with web-push library for server-side push notifications
// Compatible with NotificationService.js frontend implementation

const webpush = require('web-push');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

class OrphiChainPushServer {
  constructor() {
    this.app = express();
    this.subscriptions = new Map(); // Store user subscriptions
    this.vapidKeys = null;
    
    this.setupVapidKeys();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupVapidKeys() {
    // Generate VAPID keys if they don't exist
    const vapidKeysPath = path.join(__dirname, '../.vapid-keys.json');
    
    try {
      if (fs.existsSync(vapidKeysPath)) {
        this.vapidKeys = JSON.parse(fs.readFileSync(vapidKeysPath, 'utf8'));
        console.log('🔑 Loaded existing VAPID keys');
      } else {
        this.vapidKeys = webpush.generateVAPIDKeys();
        fs.writeFileSync(vapidKeysPath, JSON.stringify(this.vapidKeys, null, 2));
        console.log('🔑 Generated new VAPID keys');
      }

      // Update public key file for frontend
      const publicKeyPath = path.join(__dirname, '../public/vapid-public-key.txt');
      fs.writeFileSync(publicKeyPath, this.vapidKeys.publicKey);

      // Set VAPID details for web-push
      webpush.setVapidDetails(
        'mailto:admin@orphichain.com',
        this.vapidKeys.publicKey,
        this.vapidKeys.privateKey
      );

      console.log('✅ VAPID configuration complete');
    } catch (error) {
      console.error('❌ VAPID setup failed:', error);
    }
  }

  setupMiddleware() {
    this.app.use(cors({
      origin: ['http://localhost:5175', 'http://localhost:3000', 'https://orphichain.com'],
      credentials: true
    }));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Log requests
    this.app.use((req, res, next) => {
      console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'OrphiChain Push Notification Server',
        timestamp: new Date().toISOString(),
        subscriptions: this.subscriptions.size
      });
    });

    // Get VAPID public key
    this.app.get('/vapid-public-key', (req, res) => {
      res.json({ 
        publicKey: this.vapidKeys?.publicKey || null,
        success: !!this.vapidKeys?.publicKey
      });
    });

    // Subscribe to push notifications
    this.app.post('/subscribe', async (req, res) => {
      try {
        const { subscription, userId, walletAddress } = req.body;

        if (!subscription || !subscription.endpoint) {
          return res.status(400).json({ 
            error: 'Invalid subscription object' 
          });
        }

        // Store subscription with user info
        const subscriptionKey = userId || walletAddress || subscription.endpoint;
        this.subscriptions.set(subscriptionKey, {
          subscription,
          userId,
          walletAddress,
          subscribedAt: new Date().toISOString(),
          lastNotification: null
        });

        console.log(`✅ New subscription added for: ${subscriptionKey}`);

        // Send welcome notification
        await this.sendNotification(subscription, {
          title: '🎉 OrphiChain Notifications Active',
          body: 'You\'ll receive real-time updates about your Web3 activities',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'welcome',
          data: {
            type: 'welcome',
            timestamp: Date.now(),
            source: 'OrphiChain'
          }
        });

        res.json({ 
          success: true, 
          message: 'Subscription successful',
          subscriptionId: subscriptionKey
        });

      } catch (error) {
        console.error('❌ Subscription failed:', error);
        res.status(500).json({ 
          error: 'Subscription failed',
          details: error.message 
        });
      }
    });

    // Unsubscribe from push notifications
    this.app.post('/unsubscribe', (req, res) => {
      try {
        const { subscriptionId, userId, walletAddress } = req.body;
        const key = subscriptionId || userId || walletAddress;

        if (this.subscriptions.has(key)) {
          this.subscriptions.delete(key);
          console.log(`🔕 Subscription removed for: ${key}`);
          res.json({ success: true, message: 'Unsubscribed successfully' });
        } else {
          res.status(404).json({ error: 'Subscription not found' });
        }
      } catch (error) {
        console.error('❌ Unsubscribe failed:', error);
        res.status(500).json({ error: 'Unsubscribe failed' });
      }
    });

    // Send notification to specific user
    this.app.post('/notify-user', async (req, res) => {
      try {
        const { userId, walletAddress, notification } = req.body;
        const key = userId || walletAddress;

        if (!this.subscriptions.has(key)) {
          return res.status(404).json({ error: 'User subscription not found' });
        }

        const userSub = this.subscriptions.get(key);
        const result = await this.sendNotification(userSub.subscription, notification);

        if (result.success) {
          userSub.lastNotification = new Date().toISOString();
          res.json({ success: true, message: 'Notification sent' });
        } else {
          res.status(500).json({ error: 'Failed to send notification' });
        }

      } catch (error) {
        console.error('❌ User notification failed:', error);
        res.status(500).json({ error: 'Notification failed' });
      }
    });

    // Broadcast notification to all users
    this.app.post('/broadcast', async (req, res) => {
      try {
        const { notification } = req.body;
        const results = await this.broadcastNotification(notification);

        res.json({
          success: true,
          message: 'Broadcast completed',
          sent: results.sent,
          failed: results.failed,
          total: this.subscriptions.size
        });

      } catch (error) {
        console.error('❌ Broadcast failed:', error);
        res.status(500).json({ error: 'Broadcast failed' });
      }
    });

    // Send Web3-specific notifications
    this.app.post('/notify-web3', async (req, res) => {
      try {
        const { type, data, targetUsers } = req.body;

        const web3Notifications = {
          'user-registered': {
            title: '🎉 New User Registered',
            body: `User ID ${data.userId} joined the network${data.sponsor ? ` via ${data.sponsor.slice(0, 8)}...` : ''}`,
            tag: 'user-activity'
          },
          'withdrawal-made': {
            title: '💰 Withdrawal Processed',
            body: `${data.amount || 'Amount'} withdrawn ${data.user ? `by ${data.user.slice(0, 8)}...` : ''}`,
            tag: 'withdrawal'
          },
          'pool-distribution': {
            title: '🎯 Pool Distribution',
            body: `${data.amount || 'Funds'} distributed to ${data.participants || 'participants'} participants`,
            tag: 'distribution'
          },
          'system-alert': {
            title: '⚠️ System Alert',
            body: data.message || 'System status update',
            tag: 'system-alert'
          }
        };

        const notificationConfig = web3Notifications[type];
        if (!notificationConfig) {
          return res.status(400).json({ error: `Unknown notification type: ${type}` });
        }

        const notification = {
          ...notificationConfig,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          data: {
            type,
            timestamp: Date.now(),
            source: 'OrphiChain',
            ...data
          }
        };

        let results;
        if (targetUsers && targetUsers.length > 0) {
          // Send to specific users
          results = await this.sendToUsers(targetUsers, notification);
        } else {
          // Broadcast to all users
          results = await this.broadcastNotification(notification);
        }

        res.json({
          success: true,
          type,
          sent: results.sent,
          failed: results.failed
        });

      } catch (error) {
        console.error('❌ Web3 notification failed:', error);
        res.status(500).json({ error: 'Web3 notification failed' });
      }
    });

    // Get subscription stats
    this.app.get('/stats', (req, res) => {
      const stats = {
        totalSubscriptions: this.subscriptions.size,
        activeUsers: Array.from(this.subscriptions.values()).filter(
          sub => sub.lastNotification && 
          new Date() - new Date(sub.lastNotification) < 24 * 60 * 60 * 1000
        ).length,
        subscriptions: Array.from(this.subscriptions.entries()).map(([key, sub]) => ({
          id: key,
          userId: sub.userId,
          walletAddress: sub.walletAddress,
          subscribedAt: sub.subscribedAt,
          lastNotification: sub.lastNotification
        }))
      };

      res.json(stats);
    });
  }

  async sendNotification(subscription, payload) {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
      return { success: true };
    } catch (error) {
      console.error('❌ Send notification failed:', error);
      
      // Remove invalid subscriptions
      if (error.statusCode === 410 || error.statusCode === 404) {
        console.log('🧹 Removing invalid subscription');
        // Could implement cleanup logic here
      }
      
      return { success: false, error: error.message };
    }
  }

  async broadcastNotification(notification) {
    const results = { sent: 0, failed: 0 };
    const promises = [];

    for (const [key, userSub] of this.subscriptions) {
      const promise = this.sendNotification(userSub.subscription, notification)
        .then(result => {
          if (result.success) {
            results.sent++;
            userSub.lastNotification = new Date().toISOString();
          } else {
            results.failed++;
          }
        })
        .catch(() => {
          results.failed++;
        });
      
      promises.push(promise);
    }

    await Promise.allSettled(promises);
    return results;
  }

  async sendToUsers(userIds, notification) {
    const results = { sent: 0, failed: 0 };
    const promises = [];

    for (const userId of userIds) {
      if (this.subscriptions.has(userId)) {
        const userSub = this.subscriptions.get(userId);
        const promise = this.sendNotification(userSub.subscription, notification)
          .then(result => {
            if (result.success) {
              results.sent++;
              userSub.lastNotification = new Date().toISOString();
            } else {
              results.failed++;
            }
          })
          .catch(() => {
            results.failed++;
          });
        
        promises.push(promise);
      } else {
        results.failed++;
      }
    }

    await Promise.allSettled(promises);
    return results;
  }

  start(port = 3002) {
    this.app.listen(port, () => {
      console.log('🚀 OrphiChain Push Notification Server started');
      console.log(`📡 Server listening on port ${port}`);
      console.log(`🔗 Health check: http://localhost:${port}/health`);
      console.log(`🔑 VAPID public key: http://localhost:${port}/vapid-public-key`);
      console.log(`📊 Stats: http://localhost:${port}/stats`);
    });
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new OrphiChainPushServer();
  server.start();
}

module.exports = OrphiChainPushServer;
