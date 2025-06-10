import React, { useEffect, useState } from 'react';
import ProgressBar from '../common/ProgressBar';
import LoadingSpinner from '../common/LoadingSpinner';
import { PACKAGE_TIERS, LEADER_RANKS } from '../../contracts';

const EarningsOverview = ({ wallet, contract }) => {
	const [earnings, setEarnings] = useState(null);
	const [investment, setInvestment] = useState(null);
	const [cap, setCap] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchEarnings = async () => {
			if (!wallet?.account || !contract) return;
			setLoading(true);
			setError(null);
			try {
				const info = await contract.getUserInfo(wallet.account);
				setEarnings(Number(info.totalEarnings) / 1e18);
				setInvestment(Number(info.totalInvested) / 1e18);
				setCap(Number(info.totalInvested) * 4 / 1e18);
			} catch (err) {
				setError('Failed to fetch earnings');
			}
			setLoading(false);
		};
		fetchEarnings();
	}, [wallet?.account, contract]);

	const compensationPools = [
		{ name: 'Sponsor Commission', percentage: 40, color: '#2E86AB' },
		{ name: 'Level Bonus', percentage: 10, color: '#3FA7D6' },
		{ name: 'Global Upline Bonus', percentage: 10, color: '#59CD90' },
		{ name: 'Leader Bonus Pool', percentage: 10, color: '#7ED321' },
		{ name: 'Global Help Pool', percentage: 30, color: '#A23B72' }
	];

	const capPercent = earnings && cap ? Math.min((earnings / cap) * 100, 100) : 0;

	return (
		<div className="earnings-overview card">
			<h2>Earnings Overview</h2>
			{loading ? (
				<LoadingSpinner size={32} />
			) : error ? (
				<div style={{ color: 'red' }}>{error}</div>
			) : (
				<>
					<div className="cap-tracker">
						<div>4x Cap: ${cap ? cap.toLocaleString() : '--'}</div>
						<ProgressBar value={capPercent} max={100} color="#00D4FF" />
						<div
							style={{
								fontSize: 14,
								color: capPercent >= 100 ? 'red' : '#00D4FF'
							}}
						>
							{earnings && cap
								? earnings >= cap
									? 'Cap reached!'
									: `${earnings.toLocaleString()} / ${cap.toLocaleString()} (${capPercent.toFixed(
											1
									  )}%)`
								: '--'}
						</div>
					</div>
					<div className="pools-breakdown">
						{compensationPools.map(pool => (
							<div key={pool.name} className="pool-row">
								<div style={{ width: 160 }}>{pool.name}</div>
								<div style={{ width: 40, textAlign: 'right' }}>
									{pool.percentage}%
								</div>
								<div style={{ flex: 1, marginLeft: 12 }}>
									<ProgressBar
										value={pool.percentage}
										max={100}
										color={pool.color}
									/>
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
};

export default EarningsOverview;
