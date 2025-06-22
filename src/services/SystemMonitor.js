/**
 * LEADFIVE SYSTEM MONITOR
 * Real-time monitoring and alerting for AI agent performance
 */

class SystemMonitor {
    constructor() {
        this.metrics = {};
        this.alerts = [];
        this.alertThresholds = {
            api_response_time: 2000, // ms
            contract_gas_usage: 500000, // gas units
            error_rate: 0.05, // 5%
            memory_usage: 0.85, // 85%
            cpu_usage: 0.80 // 80%
        };
        this.alertHandlers = [];
        this.isMonitoring = false;
        this.monitoringInterval = null;
    }

    /**
     * Start system monitoring
     */
    startMonitoring(intervalMs = 30000) { // 30 seconds default
        if (this.isMonitoring) {
            console.log('⚠️  Monitoring already active');
            return;
        }

        console.log('🔍 Starting system monitoring...');
        this.isMonitoring = true;
        
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
        }, intervalMs);

        console.log(`✅ System monitoring started (interval: ${intervalMs}ms)`);
    }

    /**
     * Stop system monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) {
            console.log('ℹ️  Monitoring not active');
            return;
        }

        clearInterval(this.monitoringInterval);
        this.isMonitoring = false;
        console.log('🛑 System monitoring stopped');
    }

    /**
     * Track a specific metric
     */
    async trackMetric(metricName, value, metadata = {}) {
        if (!this.metrics[metricName]) {
            this.metrics[metricName] = [];
        }

        const metricData = {
            value: value,
            timestamp: new Date().toISOString(),
            metadata: metadata
        };

        this.metrics[metricName].push(metricData);

        // Keep only last 1000 entries per metric
        if (this.metrics[metricName].length > 1000) {
            this.metrics[metricName] = this.metrics[metricName].slice(-1000);
        }

        // Check thresholds
        await this.checkThresholds(metricName, value, metadata);

        console.log(`📊 Tracked metric: ${metricName} = ${value}`);
    }

    /**
     * Check if metric exceeds thresholds
     */
    async checkThresholds(metricName, value, metadata) {
        const threshold = this.alertThresholds[metricName];
        
        if (threshold && value > threshold) {
            await this.sendAlert(metricName, value, threshold, metadata);
        }
    }

    /**
     * Send alert for threshold breach
     */
    async sendAlert(metricName, value, threshold, metadata) {
        const alert = {
            id: Date.now().toString(),
            metric: metricName,
            value: value,
            threshold: threshold,
            severity: this.getAlertSeverity(metricName, value, threshold),
            message: `ALERT: ${metricName} exceeded threshold. Value: ${value}, Threshold: ${threshold}`,
            timestamp: new Date().toISOString(),
            metadata: metadata,
            resolved: false
        };

        this.alerts.push(alert);

        // Keep only last 100 alerts
        if (this.alerts.length > 100) {
            this.alerts = this.alerts.slice(-100);
        }

        console.error(`🚨 ${alert.message}`);

        // Notify alert handlers
        for (const handler of this.alertHandlers) {
            try {
                await handler(alert);
            } catch (error) {
                console.error('❌ Alert handler failed:', error);
            }
        }
    }

    /**
     * Get alert severity level
     */
    getAlertSeverity(metricName, value, threshold) {
        const ratio = value / threshold;
        
        if (ratio >= 2.0) return 'critical';
        if (ratio >= 1.5) return 'high';
        if (ratio >= 1.2) return 'medium';
        return 'low';
    }

    /**
     * Add alert handler
     */
    addAlertHandler(handler) {
        this.alertHandlers.push(handler);
        console.log('✅ Alert handler added');
    }

    /**
     * Collect system metrics automatically
     */
    async collectMetrics() {
        try {
            // Browser-based metrics
            if (typeof window !== 'undefined') {
                // Performance metrics
                if (window.performance) {
                    const navigation = window.performance.getEntriesByType('navigation')[0];
                    if (navigation) {
                        await this.trackMetric('page_load_time', navigation.loadEventEnd - navigation.fetchStart);
                        await this.trackMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
                    }

                    // Memory usage (if available)
                    if (window.performance.memory) {
                        const memory = window.performance.memory;
                        const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
                        await this.trackMetric('memory_usage', memoryUsage);
                    }
                }

                // Connection quality
                if (navigator.connection) {
                    await this.trackMetric('connection_downlink', navigator.connection.downlink);
                    await this.trackMetric('connection_rtt', navigator.connection.rtt);
                }
            }

            // Application-specific metrics
            await this.collectApplicationMetrics();

        } catch (error) {
            console.error('❌ Error collecting metrics:', error);
        }
    }

    /**
     * Collect application-specific metrics
     */
    async collectApplicationMetrics() {
        try {
            // Check contract connectivity
            const contractStart = Date.now();
            try {
                // This would be a simple contract call to test connectivity
                const response = await fetch('https://bsc-dataseed.binance.org/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: 1,
                        jsonrpc: '2.0',
                        method: 'eth_blockNumber',
                        params: []
                    })
                });
                
                const contractTime = Date.now() - contractStart;
                await this.trackMetric('contract_response_time', contractTime);
                
                if (response.ok) {
                    await this.trackMetric('contract_connectivity', 1); // Connected
                } else {
                    await this.trackMetric('contract_connectivity', 0); // Disconnected
                }
            } catch (error) {
                await this.trackMetric('contract_connectivity', 0);
                await this.trackMetric('contract_errors', 1);
            }

            // Check local storage usage
            if (typeof localStorage !== 'undefined') {
                const storageUsed = JSON.stringify(localStorage).length;
                await this.trackMetric('local_storage_usage', storageUsed);
            }

            // Count active components (in a real app, this would be more sophisticated)
            const activeComponents = document.querySelectorAll('[data-component]').length;
            await this.trackMetric('active_components', activeComponents);

        } catch (error) {
            console.error('❌ Error collecting application metrics:', error);
        }
    }

    /**
     * Get metric statistics
     */
    getMetricStats(metricName, timeframeMs = 3600000) { // 1 hour default
        const metric = this.metrics[metricName];
        if (!metric || metric.length === 0) {
            return null;
        }

        const cutoffTime = new Date(Date.now() - timeframeMs).toISOString();
        const recentData = metric.filter(entry => entry.timestamp >= cutoffTime);

        if (recentData.length === 0) {
            return null;
        }

        const values = recentData.map(entry => entry.value);
        const sum = values.reduce((a, b) => a + b, 0);
        const sortedValues = [...values].sort((a, b) => a - b);

        return {
            metricName: metricName,
            count: recentData.length,
            average: sum / recentData.length,
            min: Math.min(...values),
            max: Math.max(...values),
            median: sortedValues[Math.floor(sortedValues.length / 2)],
            latest: recentData[recentData.length - 1].value,
            timeframe: timeframeMs,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get system health summary
     */
    getSystemHealth() {
        const now = Date.now();
        const oneHour = 3600000;
        const health = {
            status: 'healthy',
            issues: [],
            metrics: {},
            alerts: {
                total: this.alerts.length,
                unresolved: this.alerts.filter(a => !a.resolved).length,
                critical: this.alerts.filter(a => a.severity === 'critical' && !a.resolved).length
            },
            timestamp: new Date().toISOString()
        };

        // Check key metrics
        const keyMetrics = ['api_response_time', 'contract_response_time', 'memory_usage', 'error_rate'];
        
        for (const metricName of keyMetrics) {
            const stats = this.getMetricStats(metricName, oneHour);
            if (stats) {
                health.metrics[metricName] = stats;
                
                // Check if metric indicates issues
                const threshold = this.alertThresholds[metricName];
                if (threshold && stats.average > threshold) {
                    health.issues.push(`${metricName} average (${stats.average}) exceeds threshold (${threshold})`);
                    health.status = 'degraded';
                }
            }
        }

        // Check for critical alerts
        if (health.alerts.critical > 0) {
            health.status = 'critical';
        } else if (health.alerts.unresolved > 5) {
            health.status = 'warning';
        }

        return health;
    }

    /**
     * Get recent alerts
     */
    getRecentAlerts(timeframeMs = 3600000) { // 1 hour default
        const cutoffTime = new Date(Date.now() - timeframeMs).toISOString();
        return this.alerts.filter(alert => alert.timestamp >= cutoffTime);
    }

    /**
     * Mark alert as resolved
     */
    resolveAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.resolved = true;
            alert.resolvedAt = new Date().toISOString();
            console.log(`✅ Alert ${alertId} marked as resolved`);
            return true;
        }
        return false;
    }

    /**
     * Export monitoring data
     */
    exportData(timeframeMs = 86400000) { // 24 hours default
        const cutoffTime = new Date(Date.now() - timeframeMs).toISOString();
        
        const exportData = {
            exportTimestamp: new Date().toISOString(),
            timeframeMs: timeframeMs,
            metrics: {},
            alerts: this.alerts.filter(alert => alert.timestamp >= cutoffTime),
            systemHealth: this.getSystemHealth(),
            thresholds: this.alertThresholds
        };

        // Export metrics within timeframe
        for (const [metricName, metricData] of Object.entries(this.metrics)) {
            const recentData = metricData.filter(entry => entry.timestamp >= cutoffTime);
            if (recentData.length > 0) {
                exportData.metrics[metricName] = {
                    data: recentData,
                    stats: this.getMetricStats(metricName, timeframeMs)
                };
            }
        }

        return exportData;
    }

    /**
     * Clear old data
     */
    clearOldData(ageMs = 604800000) { // 7 days default
        const cutoffTime = new Date(Date.now() - ageMs).toISOString();
        let totalRemoved = 0;

        // Clean metrics
        for (const [metricName, metricData] of Object.entries(this.metrics)) {
            const originalLength = metricData.length;
            this.metrics[metricName] = metricData.filter(entry => entry.timestamp >= cutoffTime);
            totalRemoved += originalLength - this.metrics[metricName].length;
        }

        // Clean alerts
        const originalAlertCount = this.alerts.length;
        this.alerts = this.alerts.filter(alert => alert.timestamp >= cutoffTime);
        totalRemoved += originalAlertCount - this.alerts.length;

        console.log(`🧹 Cleared ${totalRemoved} old data points`);
        return totalRemoved;
    }

    /**
     * Update alert thresholds
     */
    updateThresholds(newThresholds) {
        this.alertThresholds = { ...this.alertThresholds, ...newThresholds };
        console.log('✅ Alert thresholds updated:', newThresholds);
    }
}

export default SystemMonitor;
