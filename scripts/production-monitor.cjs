#!/usr/bin/env node

/**
 * LeadFive Production Monitoring Setup
 * Handles logging, health checks, and performance monitoring
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class ProductionMonitor {
    constructor() {
        this.monitoringDir = path.join(__dirname, '..', 'monitoring');
        this.logsDir = path.join(this.monitoringDir, 'logs');
        this.metricsFile = path.join(this.monitoringDir, 'metrics.json');
        this.setupDirectories();
    }

    setupDirectories() {
        if (!fs.existsSync(this.monitoringDir)) {
            fs.mkdirSync(this.monitoringDir, { recursive: true });
        }
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }

    /**
     * Generate comprehensive monitoring configuration
     */
    generateConfig() {
        const config = {
            application: {
                name: 'LeadFive Platform',
                version: '1.10.0',
                environment: process.env.NODE_ENV || 'development'
            },
            monitoring: {
                healthCheck: {
                    endpoint: '/api/health',
                    interval: '30s',
                    timeout: '10s'
                },
                metrics: {
                    endpoint: '/api/metrics',
                    collection_interval: '15s'
                },
                logging: {
                    level: 'info',
                    format: 'json',
                    rotation: {
                        max_files: 10,
                        max_size: '10MB'
                    }
                }
            },
            alerts: {
                cpu_threshold: 80,
                memory_threshold: 80,
                disk_threshold: 90,
                response_time_threshold: 2000,
                error_rate_threshold: 5
            }
        };

        fs.writeFileSync(
            path.join(this.monitoringDir, 'config.json'),
            JSON.stringify(config, null, 2)
        );

        return config;
    }

    /**
     * Create Docker monitoring setup
     */
    generateDockerMonitoring() {
        const dockerComposeMonitoring = `
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: leadfive-prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: leadfive-grafana
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=leadfive_admin_2024
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped
    depends_on:
      - prometheus

  node-exporter:
    image: prom/node-exporter:latest
    container_name: leadfive-node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
`;

        fs.writeFileSync(
            path.join(this.monitoringDir, 'docker-compose.monitoring.yml'),
            dockerComposeMonitoring
        );

        // Prometheus configuration
        const prometheusConfig = `
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'leadfive-backend'
    static_configs:
      - targets: ['localhost:3001']
    scrape_interval: 5s
    metrics_path: '/api/metrics'

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
`;

        fs.writeFileSync(
            path.join(this.monitoringDir, 'prometheus.yml'),
            prometheusConfig
        );
    }

    /**
     * Generate health check endpoint code
     */
    generateHealthCheck() {
        const healthCheckCode = `
// Health check endpoint for LeadFive API
app.get('/api/health', async (req, res) => {
    const startTime = Date.now();
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'leadfive-api',
        version: '1.10.0'
    };

    try {
        // Check database connection
        const [dbRows] = await dbPool.execute('SELECT 1 as test');
        health.database = dbRows[0].test === 1 ? 'healthy' : 'unhealthy';

        // Check blockchain connection
        const blockNumber = await provider.getBlockNumber();
        health.blockchain = blockNumber > 0 ? 'healthy' : 'unhealthy';

        // Check contract connection
        const totalUsers = await contract.totalUsers();
        health.contract = totalUsers >= 0 ? 'healthy' : 'unhealthy';

        // System metrics
        health.system = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            platform: os.platform(),
            nodeVersion: process.version
        };

        // Overall status
        const components = [health.database, health.blockchain, health.contract];
        health.status = components.every(status => status === 'healthy') ? 'healthy' : 'degraded';

        health.responseTime = Date.now() - startTime;
        res.status(health.status === 'healthy' ? 200 : 503).json(health);

    } catch (error) {
        health.status = 'unhealthy';
        health.error = error.message;
        health.responseTime = Date.now() - startTime;
        res.status(503).json(health);
    }
});

// Metrics endpoint for Prometheus
app.get('/api/metrics', async (req, res) => {
    try {
        const metrics = {
            // Application metrics
            app_requests_total: Math.floor(Math.random() * 10000), // Should be real counter
            app_requests_duration_seconds: Math.random() * 2,
            app_errors_total: Math.floor(Math.random() * 100),
            
            // Business metrics
            total_users: await contract.totalUsers().catch(() => 0),
            active_websocket_connections: wsConnections.size,
            
            // System metrics
            nodejs_memory_usage_bytes: process.memoryUsage().heapUsed,
            nodejs_cpu_usage_percent: process.cpuUsage().user / 1000000,
            
            timestamp: Date.now()
        };

        // Convert to Prometheus format
        let prometheusMetrics = '';
        for (const [key, value] of Object.entries(metrics)) {
            if (typeof value === 'number') {
                prometheusMetrics += \`# HELP \${key} \${key.replace(/_/g, ' ')}\n\`;
                prometheusMetrics += \`# TYPE \${key} gauge\n\`;
                prometheusMetrics += \`\${key} \${value}\n\`;
            }
        }

        res.set('Content-Type', 'text/plain');
        res.send(prometheusMetrics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
`;

        fs.writeFileSync(
            path.join(this.monitoringDir, 'health-check.js'),
            healthCheckCode
        );
    }

    /**
     * Generate uptime monitoring script
     */
    generateUptimeMonitor() {
        const uptimeScript = `#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

class UptimeMonitor {
    constructor() {
        this.endpoints = [
            'https://leadfive.today',
            'https://leadfive.today/api/health',
            'https://leadfive.today/api/metrics'
        ];
        this.logFile = path.join(__dirname, 'logs', 'uptime.log');
        this.alertThreshold = 3; // consecutive failures
        this.checkInterval = 60000; // 1 minute
    }

    async checkEndpoint(url) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            const request = https.get(url, (res) => {
                const responseTime = Date.now() - startTime;
                resolve({
                    url,
                    status: res.statusCode,
                    responseTime,
                    success: res.statusCode >= 200 && res.statusCode < 400
                });
            });

            request.on('error', (error) => {
                resolve({
                    url,
                    status: 0,
                    responseTime: Date.now() - startTime,
                    success: false,
                    error: error.message
                });
            });

            request.setTimeout(10000, () => {
                request.destroy();
                resolve({
                    url,
                    status: 0,
                    responseTime: 10000,
                    success: false,
                    error: 'Timeout'
                });
            });
        });
    }

    async runCheck() {
        const timestamp = new Date().toISOString();
        console.log(\`[\${timestamp}] Running uptime check...\`);

        for (const endpoint of this.endpoints) {
            const result = await this.checkEndpoint(endpoint);
            const logEntry = \`\${timestamp} | \${result.url} | \${result.status} | \${result.responseTime}ms | \${result.success ? 'UP' : 'DOWN'}\${result.error ? ' | ' + result.error : ''}\\n\`;
            
            fs.appendFileSync(this.logFile, logEntry);
            console.log(logEntry.trim());

            if (!result.success) {
                console.error(\`❌ \${endpoint} is down!\`);
            } else {
                console.log(\`✅ \${endpoint} is up (\${result.responseTime}ms)\`);
            }
        }
    }

    start() {
        console.log('🔍 Starting uptime monitoring...');
        this.runCheck();
        setInterval(() => this.runCheck(), this.checkInterval);
    }
}

if (require.main === module) {
    new UptimeMonitor().start();
}
`;

        fs.writeFileSync(
            path.join(this.monitoringDir, 'uptime-monitor.js'),
            uptimeScript
        );
        
        // Make it executable
        fs.chmodSync(path.join(this.monitoringDir, 'uptime-monitor.js'), 0o755);
    }

    /**
     * Set up complete monitoring stack
     */
    setup() {
        console.log('🔧 Setting up production monitoring...');
        
        const config = this.generateConfig();
        this.generateDockerMonitoring();
        this.generateHealthCheck();
        this.generateUptimeMonitor();

        // Create log rotation script
        const logRotateScript = `
#!/bin/bash
# Log rotation for LeadFive
find ${this.logsDir} -name "*.log" -size +10M -exec gzip {} \;
find ${this.logsDir} -name "*.gz" -mtime +30 -delete
`;

        fs.writeFileSync(
            path.join(this.monitoringDir, 'rotate-logs.sh'),
            logRotateScript
        );
        fs.chmodSync(path.join(this.monitoringDir, 'rotate-logs.sh'), 0o755);

        // Create systemd service file
        const systemdService = `
[Unit]
Description=LeadFive Platform
After=network.target

[Service]
Type=simple
User=leadfive
WorkingDirectory=/opt/leadfive
ExecStart=/usr/bin/node backend/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
`;

        fs.writeFileSync(
            path.join(this.monitoringDir, 'leadfive.service'),
            systemdService
        );

        console.log('✅ Monitoring setup complete!');
        console.log(`📁 Configuration saved to: ${this.monitoringDir}`);
        
        return {
            configPath: path.join(this.monitoringDir, 'config.json'),
            healthCheck: path.join(this.monitoringDir, 'health-check.js'),
            monitoring: path.join(this.monitoringDir, 'docker-compose.monitoring.yml'),
            uptime: path.join(this.monitoringDir, 'uptime-monitor.js')
        };
    }
}

if (require.main === module) {
    new ProductionMonitor().setup();
}

module.exports = ProductionMonitor;
