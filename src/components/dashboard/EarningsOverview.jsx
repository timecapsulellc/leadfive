import React, { useEffect, useState } from 'react';
import ProgressBar from '../common/ProgressBar';
import LoadingSpinner from '../common/LoadingSpinner';
import { COMPENSATION_POOLS } from '../../utils/constants';

const EarningsOverview = ({ wallet, contract }) => {
	const [earnings, setEarnings] = useState(null);
	const [investment, setInvestment] = useState(null);
	const [cap, setCap] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchEarnings = async () => {
			if (!wallet?.account || !contract) {
				// Set demo data when wallet is not connected
				setEarnings(0);
				setInvestment(0);
				setCap(0);
				return;
			}
			
			setLoading(true);
			setError(null);
			try {
				const info = await contract.getUserInfo(wallet.account);
				setEarnings(Number(info.totalEarnings) / 1e18);
				setInvestment(Number(info.totalInvested) / 1e18);
				setCap(Number(info.totalInvested) * 4 / 1e18);
			} catch (err) {
				console.error('Error fetching earnings:', err);
				setError('Failed to fetch earnings');
				// Set demo data on error
				setEarnings(0);
				setInvestment(0);
				setCap(0);
			}
			setLoading(false);
		};
		fetchEarnings();
	}, [wallet?.account, contract]);

	// Use compensation pools from constants with calculated earnings
	const compensationPools = COMPENSATION_POOLS.map(pool => ({
		...pool,
		earnings: earnings ? (earnings * pool.percentage / 100) : 0
	}));

	const capPercent = earnings && cap ? Math.min((earnings / cap) * 100, 100) : 0;

	return (
		<div className="earnings-overview card">
			<h2>💰 Earnings Overview</h2>
			{loading ? (
				<LoadingSpinner size={32} />
			) : error ? (
				<div className="error-message" style={{ color: 'var(--error-color)', padding: '12px', background: 'var(--accent-bg)', borderRadius: '8px' }}>
					{error}
				</div>
			) : (
				<>
					<div className="cap-tracker">
						<div className="cap-info">
							<div className="cap-label">Current Earnings</div>
							<div className="cap-value">${earnings ? earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</div>
						</div>
						<div className="cap-info">
							<div className="cap-label">4x Earnings Cap</div>
							<div className="cap-value">${cap ? cap.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</div>
						</div>
						<ProgressBar 
							progress={capPercent} 
							color="var(--success-color)"
							height={8}
							showPercentage={true}
						/>
						<div className="cap-progress-text">
							{capPercent.toFixed(1)}% of earnings cap reached
						</div>
					</div>

					<div className="compensation-pools">
						<h3>💎 Compensation Breakdown</h3>
						{compensationPools.map((pool, index) => (
							<div key={index} className={`pool-item ${pool.name.toLowerCase().replace(/\s+/g, '-')}`}>
								<div className="pool-info">
									<div className="pool-name">{pool.name}</div>
									<div className="pool-percentage">{pool.percentage}%</div>
								</div>
								<div className="pool-earnings">
									${pool.earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
								</div>
							</div>
						))}
					</div>

					<div className="earnings-summary">
						<div className="summary-item">
							<span className="summary-label">Total Investment:</span>
							<span className="summary-value">${investment ? investment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}</span>
						</div>
						<div className="summary-item">
							<span className="summary-label">ROI:</span>
							<span className="summary-value">{investment > 0 ? ((earnings / investment) * 100).toFixed(1) : '0.0'}%</span>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default EarningsOverview;
