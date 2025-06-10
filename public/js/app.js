// OrphiChain Ultimate Dashboard for Vercel Deployment
// Complete React-based Dashboard with All Advanced Features

const { useState, useEffect, useCallback } = React;

// Notification System Component
const NotificationSystem = ({ notifications, removeNotification }) => {
    return React.createElement('div', {
        className: 'notification-container',
        style: {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            maxWidth: '400px'
        }
    }, notifications.map(notification => 
        React.createElement('div', {
            key: notification.id,
            className: `notification notification-${notification.type}`,
            style: {
                background: notification.type === 'success' ? '#00C851' : 
                           notification.type === 'error' ? '#FF4444' : 
                           notification.type === 'warning' ? '#FFBB33' : 
                           '#00D4FF',
                color: 'white',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                animation: 'slideIn 0.3s ease-out',
                cursor: 'pointer'
            },
            onClick: () => removeNotification(notification.id)
        }, [
            React.createElement('div', { 
                key: 'title',
                style: { fontWeight: 'bold', marginBottom: '0.5rem' } 
            }, notification.title),
            React.createElement('div', { 
                key: 'message',
                style: { fontSize: '0.9rem' } 
            }, notification.message)
        ])
    ));
};

// OrphiChain Logo Component
const OrphiChainLogo = ({ size = 'medium', variant = 'orbital', autoRotate = false }) => {
    return React.createElement('div', {
        className: `orphi-logo ${size} ${variant} ${autoRotate ? 'auto-rotate' : ''}`,
        style: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size === 'small' ? '40px' : size === 'large' ? '80px' : '60px',
            height: size === 'small' ? '40px' : size === 'large' ? '80px' : '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7B2CBF 0%, #00D4FF 100%)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: size === 'small' ? '16px' : size === 'large' ? '32px' : '24px',
            animation: autoRotate ? 'spin 3s linear infinite' : 'none'
        }
    }, '🚀');
};

// Advanced PieChart Component
const PieChart = ({ data, size = 120, strokeWidth = 18 }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let cumulative = 0;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;

    const polarToCartesian = (cx, cy, r, angle) => {
        const rad = ((angle - 90) * Math.PI) / 180.0;
        const safeRadius = (r > 0 && isFinite(r)) ? r : 0;
        return {
            x: cx + safeRadius * Math.cos(rad),
            y: cy + safeRadius * Math.sin(rad)
        };
    };

    return React.createElement('svg', {
        width: size,
        height: size,
        viewBox: `0 0 ${size} ${size}`
    }, [
        total > 0 && data.map((d, i) => {
            const value = d.value;
            const angle = total > 0 ? (value / total) * 360 : 0;
            if (value === 0) return null;

            const startAngle = cumulative;
            const endAngle = cumulative + angle;
            cumulative += angle;
            const largeArc = angle > 180 ? 1 : 0;
            const start = polarToCartesian(center, center, radius, startAngle);
            const end = polarToCartesian(center, center, radius, endAngle);
            
            if (isNaN(start.x) || isNaN(start.y) || isNaN(end.x) || isNaN(end.y)) {
                return null;
            }

            const pathData = [
                `M ${start.x} ${start.y}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`
            ].join(' ');

            return React.createElement('path', {
                key: d.label,
                d: pathData,
                fill: 'none',
                stroke: d.color,
                strokeWidth: strokeWidth,
                strokeLinecap: 'round'
            });
        }),
        React.createElement('circle', {
            key: 'inner-circle',
            cx: center,
            cy: center,
            r: radius - strokeWidth / 2,
            fill: '#181a20'
        }),
        React.createElement('text', {
            key: 'center-text',
            x: center,
            y: center,
            textAnchor: 'middle',
            dy: '0.3em',
            fill: '#fff',
            fontSize: '1.1em',
            fontWeight: 'bold'
        }, total > 0 ? 'Total' : 'No Data')
    ]);
};

// Advanced Compensation Dashboard Component
const AdvancedCompensationDashboard = ({ compensationData, selectedPackage, deviceInfo }) => {
    const [showLevelBreakdown, setShowLevelBreakdown] = useState(false);
    
    compensationData = compensationData || {
        sponsorCommissions: 847.32,
        levelBonuses: { 1: 200, 2: 150, 3: 100, 4: 75, 5: 50, 6: 25, 7: 15, 8: 10, 9: 8, 10: 5 },
        uplineBonuses: 125.50,
        leaderBonuses: 89.75,
        globalHelpPool: 156.25,
        totalEarnings: 1847.32,
        earningsCap: 5000,
        isNearCap: false
    };

    const getLevelBonusRate = (level) => {
        if (level === 1) return 3;
        if (level >= 2 && level <= 6) return 1;
        if (level >= 7 && level <= 10) return 0.5;
        return 0;
    };

    const maxLevel = Object.entries(compensationData.levelBonuses).reduce((max, [level, bonus]) => 
        bonus > (compensationData.levelBonuses[max] || 0) ? level : max, 1);

    const pieData = [
        { label: 'Sponsor', value: compensationData.sponsorCommissions, color: '#00ff88' },
        { label: 'Level', value: Object.values(compensationData.levelBonuses).reduce((a, b) => a + b, 0), color: '#00d4ff' },
        { label: 'Upline', value: compensationData.uplineBonuses, color: '#ffd700' },
        { label: 'Leader', value: compensationData.leaderBonuses, color: '#7b2cbf' },
        { label: 'Pool', value: compensationData.globalHelpPool, color: '#ff6b35' },
    ];

    const earningsPercent = Math.min(100, (compensationData.totalEarnings / (compensationData.earningsCap || 1)) * 100);

    const handleExport = () => {
        const data = {
            compensationData,
            selectedPackage,
            exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'compensation-report.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return React.createElement('div', {
        style: {
            maxWidth: '600px',
            margin: '0 auto',
            padding: deviceInfo?.isMobile ? '10px' : '24px'
        }
    }, [
        React.createElement('h3', {
            key: 'title',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: deviceInfo?.isMobile ? '1.2em' : '1.5em',
                marginBottom: '1rem',
                color: '#00D4FF'
            }
        }, ['💸 Advanced Compensation Plan']),

        React.createElement('div', {
            key: 'summary',
            style: {
                borderRadius: '12px',
                background: '#23263a',
                padding: deviceInfo?.isMobile ? '0.7rem' : '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                marginBottom: '1rem'
            }
        }, [
            // Sponsor Commissions
            React.createElement('div', {
                key: 'sponsor',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                }
            }, [
                React.createElement('span', { key: 'label' }, '🤝 Sponsor Commissions:'),
                React.createElement('span', {
                    key: 'value',
                    style: { color: '#00ff88', fontWeight: '600' }
                }, `$${compensationData.sponsorCommissions.toLocaleString()}`)
            ]),

            React.createElement('hr', {
                key: 'divider1',
                style: { border: 'none', borderTop: '1px solid #333', margin: '8px 0' }
            }),

            // Level Bonuses with breakdown
            React.createElement('div', {
                key: 'level-section',
                style: { marginBottom: '8px' }
            }, [
                React.createElement('div', {
                    key: 'level-header',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                    }
                }, [
                    React.createElement('span', { key: 'label' }, '🏆 Level Bonuses:'),
                    React.createElement('span', {
                        key: 'value',
                        style: { color: '#00d4ff', fontWeight: '600' }
                    }, `$${Object.values(compensationData.levelBonuses).reduce((a, b) => a + b, 0).toLocaleString()}`),
                    React.createElement('button', {
                        key: 'toggle',
                        onClick: () => setShowLevelBreakdown(!showLevelBreakdown),
                        style: {
                            marginLeft: '8px',
                            background: '#181a20',
                            color: '#fff',
                            border: '1px solid #333',
                            borderRadius: '6px',
                            padding: '2px 10px',
                            cursor: 'pointer'
                        }
                    }, showLevelBreakdown ? 'Hide' : 'Show')
                ]),

                showLevelBreakdown && React.createElement('div', {
                    key: 'breakdown',
                    style: {
                        margin: '8px 0',
                        padding: '8px',
                        background: '#181a20',
                        borderRadius: '8px'
                    }
                }, [...Array(10)].map((_, i) => {
                    const level = i + 1;
                    const bonus = compensationData.levelBonuses[level] || 0;
                    const rate = getLevelBonusRate(level);
                    const isMax = String(level) === String(maxLevel);
                    const totalLevelBonuses = Object.values(compensationData.levelBonuses).reduce((a, b) => a + b, 0);
                    const percent = Math.max(2, (bonus / (totalLevelBonuses || 1)) * 100);

                    return React.createElement('div', {
                        key: level,
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            margin: '4px 0'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'level-label',
                            style: { minWidth: '90px' }
                        }, `${level <= 3 ? '🥇' : level <= 6 ? '🥈' : '🥉'} Level ${level} (${rate}%):`),
                        React.createElement('div', {
                            key: 'progress-bar',
                            style: {
                                flex: 1,
                                background: '#23263a',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                height: '12px',
                                marginRight: '8px'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'progress-fill',
                                style: {
                                    width: `${percent}%`,
                                    background: isMax ? '#00ff88' : '#00d4ff',
                                    height: '100%',
                                    transition: 'width 0.7s'
                                }
                            })
                        ]),
                        React.createElement('span', {
                            key: 'amount',
                            style: {
                                fontWeight: isMax ? '700' : '500',
                                color: isMax ? '#00ff88' : '#fff',
                                minWidth: '70px',
                                textAlign: 'right'
                            }
                        }, `$${bonus.toLocaleString()}`)
                    ]);
                }))
            ]),

            React.createElement('hr', {
                key: 'divider2',
                style: { border: 'none', borderTop: '1px solid #333', margin: '8px 0' }
            }),

            // Other bonuses
            React.createElement('div', {
                key: 'upline',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                }
            }, [
                React.createElement('span', { key: 'label' }, '🧑‍🤝‍🧑 Upline Bonuses:'),
                React.createElement('span', {
                    key: 'value',
                    style: { color: '#ffd700', fontWeight: '600' }
                }, `$${compensationData.uplineBonuses.toLocaleString()}`)
            ]),

            React.createElement('div', {
                key: 'leader',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                }
            }, [
                React.createElement('span', { key: 'label' }, '⭐ Leader Bonuses:'),
                React.createElement('span', {
                    key: 'value',
                    style: { color: '#7b2cbf', fontWeight: '600' }
                }, `$${compensationData.leaderBonuses.toLocaleString()}`)
            ]),

            React.createElement('div', {
                key: 'pool',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                }
            }, [
                React.createElement('span', { key: 'label' }, '🌐 Global Help Pool:'),
                React.createElement('span', {
                    key: 'value',
                    style: { color: '#ff6b35', fontWeight: '600' }
                }, `$${compensationData.globalHelpPool.toLocaleString()}`)
            ]),

            React.createElement('hr', {
                key: 'divider3',
                style: { border: 'none', borderTop: '1px solid #333', margin: '8px 0' }
            }),

            // Totals
            React.createElement('div', {
                key: 'total',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px'
                }
            }, [
                React.createElement('span', { key: 'label' }, '💰 Total Earnings:'),
                React.createElement('span', {
                    key: 'value',
                    style: { color: '#00ff88', fontWeight: '700', fontSize: '1.1em' }
                }, `$${compensationData.totalEarnings.toLocaleString()}`)
            ]),

            React.createElement('div', {
                key: 'cap',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }
            }, [
                React.createElement('span', { key: 'label' }, '🔒 Earnings Cap:'),
                React.createElement('span', {
                    key: 'value',
                    style: { color: '#ffd700', fontWeight: '700' }
                }, `$${compensationData.earningsCap.toLocaleString()}`)
            ])
        ]),

        // Progress and Pie Chart
        React.createElement('div', {
            key: 'charts',
            style: {
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                flexWrap: 'wrap',
                margin: '18px 0'
            }
        }, [
            // Progress Bar
            React.createElement('div', {
                key: 'progress-section',
                style: { flex: '1 1 220px', minWidth: '220px' }
            }, [
                React.createElement('div', {
                    key: 'progress-title',
                    style: { fontWeight: '600', marginBottom: '4px' }
                }, 'Earnings Progress'),
                React.createElement('div', {
                    key: 'progress-container',
                    style: {
                        background: '#23263a',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        height: '22px',
                        position: 'relative'
                    }
                }, [
                    React.createElement('div', {
                        key: 'progress-fill',
                        style: {
                            width: `${earningsPercent}%`,
                            background: 'linear-gradient(90deg, #00ff88, #00d4ff)',
                            height: '100%',
                            transition: 'width 0.7s',
                            borderRadius: '8px'
                        }
                    }),
                    React.createElement('div', {
                        key: 'progress-text',
                        style: {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            color: '#fff',
                            fontSize: '0.98em',
                            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                        }
                    }, `${earningsPercent.toFixed(1)}% of Cap`)
                ])
            ]),

            // Pie Chart
            React.createElement('div', {
                key: 'pie-section',
                style: {
                    flex: '0 0 140px',
                    minWidth: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }
            }, [
                React.createElement(PieChart, {
                    key: 'pie-chart',
                    data: pieData,
                    size: 120,
                    strokeWidth: 18
                }),
                React.createElement('div', {
                    key: 'pie-title',
                    style: {
                        marginTop: '8px',
                        fontSize: '0.95em',
                        color: '#aaa',
                        textAlign: 'center'
                    }
                }, 'Earnings Breakdown'),
                React.createElement('div', {
                    key: 'pie-legend',
                    style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                        justifyContent: 'center',
                        marginTop: '4px'
                    }
                }, pieData.map(d => 
                    React.createElement('span', {
                        key: d.label,
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.92em'
                        }
                    }, [
                        React.createElement('span', {
                            key: 'color',
                            style: {
                                display: 'inline-block',
                                width: '12px',
                                height: '12px',
                                background: d.color,
                                borderRadius: '2px',
                                marginRight: '2px'
                            }
                        }),
                        React.createElement('span', { key: 'label' }, d.label)
                    ])
                ))
            ])
        ]),

        // Export button
        React.createElement('div', {
            key: 'actions',
            style: {
                display: 'flex',
                gap: '12px',
                marginTop: '18px',
                flexWrap: 'wrap'
            }
        }, [
            React.createElement('button', {
                key: 'export',
                onClick: handleExport,
                style: {
                    background: '#00d4ff',
                    color: '#181a20',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minWidth: '120px'
                }
            }, 'Export JSON')
        ])
    ]);
};

// Simple Genealogy Tree Component
const SimpleGenealogyTree = () => {
    const treeData = {
        user: { name: 'You', level: 1, earnings: 1847.32 },
        level1: [
            { name: 'Alice', level: 2, earnings: 523.45 },
            { name: 'Bob', level: 2, earnings: 678.90 }
        ],
        level2: [
            { name: 'Charlie', level: 3, earnings: 234.56 },
            { name: 'Diana', level: 3, earnings: 345.67 },
            { name: 'Eve', level: 3, earnings: 456.78 },
            { name: 'Frank', level: 3, earnings: 567.89 }
        ]
    };

    return React.createElement('div', {
        className: 'genealogy-tree',
        style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            padding: '2rem',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '15px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
        }
    }, [
        // Root User
        React.createElement('div', {
            key: 'root',
            className: 'tree-node root',
            style: {
                background: 'linear-gradient(135deg, #7B2CBF 0%, #00D4FF 100%)',
                color: 'white',
                padding: '1rem',
                borderRadius: '10px',
                textAlign: 'center',
                minWidth: '150px'
            }
        }, [
            React.createElement('div', { key: 'name', style: { fontWeight: 'bold' } }, treeData.user.name),
            React.createElement('div', { key: 'level', style: { fontSize: '0.8rem', opacity: 0.8 } }, `Level ${treeData.user.level}`),
            React.createElement('div', { key: 'earnings', style: { fontSize: '0.9rem' } }, `$${treeData.user.earnings}`)
        ]),

        // Level 1
        React.createElement('div', {
            key: 'level1',
            className: 'tree-level',
            style: {
                display: 'flex',
                gap: '2rem',
                justifyContent: 'center'
            }
        }, treeData.level1.map((node, index) => 
            React.createElement('div', {
                key: `l1-${index}`,
                className: 'tree-node',
                style: {
                    background: 'rgba(0, 200, 81, 0.2)',
                    border: '1px solid rgba(0, 200, 81, 0.5)',
                    color: 'white',
                    padding: '0.8rem',
                    borderRadius: '8px',
                    textAlign: 'center',
                    minWidth: '120px'
                }
            }, [
                React.createElement('div', { key: 'name', style: { fontWeight: 'bold', fontSize: '0.9rem' } }, node.name),
                React.createElement('div', { key: 'level', style: { fontSize: '0.7rem', opacity: 0.8 } }, `Level ${node.level}`),
                React.createElement('div', { key: 'earnings', style: { fontSize: '0.8rem' } }, `$${node.earnings}`)
            ])
        )),

        // Level 2
        React.createElement('div', {
            key: 'level2',
            className: 'tree-level',
            style: {
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap'
            }
        }, treeData.level2.map((node, index) => 
            React.createElement('div', {
                key: `l2-${index}`,
                className: 'tree-node',
                style: {
                    background: 'rgba(255, 107, 53, 0.2)',
                    border: '1px solid rgba(255, 107, 53, 0.5)',
                    color: 'white',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    textAlign: 'center',
                    minWidth: '100px'
                }
            }, [
                React.createElement('div', { key: 'name', style: { fontWeight: 'bold', fontSize: '0.8rem' } }, node.name),
                React.createElement('div', { key: 'level', style: { fontSize: '0.6rem', opacity: 0.8 } }, `Level ${node.level}`),
                React.createElement('div', { key: 'earnings', style: { fontSize: '0.7rem' } }, `$${node.earnings}`)
            ])
        ))
    ]);
};

// User Profile Section Component
const UserProfileSection = ({ userInfo, onProfileUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(userInfo);

    const handleSave = () => {
        onProfileUpdate(editData);
        setIsEditing(false);
    };

    return React.createElement('div', {
        className: 'user-profile-section',
        style: {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '15px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '2rem'
        }
    }, [
        React.createElement('div', {
            key: 'profile-header',
            style: {
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem'
            }
        }, [
            React.createElement('div', {
                key: 'avatar',
                style: {
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7B2CBF 0%, #00D4FF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.5rem'
                }
            }, userInfo.avatar),
            React.createElement('div', { key: 'info' }, [
                React.createElement('h3', { key: 'name', style: { margin: 0, color: 'white' } }, userInfo.name),
                React.createElement('p', { key: 'level', style: { margin: 0, color: '#00D4FF' } }, `${userInfo.level} Level`),
                React.createElement('p', { key: 'id', style: { margin: 0, fontSize: '0.8rem', opacity: 0.7 } }, `ID: ${userInfo.id}`)
            ]),
            React.createElement('button', {
                key: 'edit-btn',
                onClick: () => setIsEditing(!isEditing),
                style: {
                    marginLeft: 'auto',
                    background: '#00D4FF',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }
            }, isEditing ? 'Cancel' : 'Edit')
        ]),

        isEditing ? React.createElement('div', {
            key: 'edit-form',
            style: { display: 'flex', flexDirection: 'column', gap: '1rem' }
        }, [
            React.createElement('input', {
                key: 'name-input',
                type: 'text',
                value: editData.name,
                onChange: (e) => setEditData({...editData, name: e.target.value}),
                placeholder: 'Name',
                style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '5px',
                    padding: '0.5rem',
                    color: 'white'
                }
            }),
            React.createElement('button', {
                key: 'save-btn',
                onClick: handleSave,
                style: {
                    background: '#00C851',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }
            }, 'Save Changes')
        ]) : null
    ]);
};

// Quick Actions Panel Component
const QuickActionsPanel = ({ userInfo, onAction }) => {
    const actions = [
        { id: 'claim', label: 'Claim Rewards', icon: '💰', amount: 47.32 },
        { id: 'invite', label: 'Invite Friends', icon: '👥' },
        { id: 'upgrade', label: 'Upgrade Package', icon: '⬆️' },
        { id: 'genealogy', label: 'View Matrix', icon: '🌐' },
        { id: 'analytics', label: 'Analytics', icon: '📊' },
        { id: 'history', label: 'History', icon: '📋' }
    ];

    return React.createElement('div', {
        className: 'quick-actions-panel',
        style: {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '15px',
            padding: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '2rem'
        }
    }, [
        React.createElement('h4', {
            key: 'title',
            style: { margin: '0 0 1rem 0', color: '#00D4FF' }
        }, '⚡ Quick Actions'),
        React.createElement('div', {
            key: 'actions-grid',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
            }
        }, actions.map(action => 
            React.createElement('button', {
                key: action.id,
                onClick: () => onAction(action.id, action),
                style: {
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    padding: '1rem',
                    color: 'white',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                },
                onMouseEnter: (e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    e.target.style.transform = 'translateY(-2px)';
                },
                onMouseLeave: (e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                }
            }, [
                React.createElement('div', { key: 'icon', style: { fontSize: '1.5rem', marginBottom: '0.5rem' } }, action.icon),
                React.createElement('div', { key: 'label', style: { fontSize: '0.9rem', fontWeight: 'bold' } }, action.label),
                action.amount ? React.createElement('div', { key: 'amount', style: { fontSize: '0.8rem', color: '#00C851' } }, `$${action.amount}`) : null
            ])
        ))
    ]);
};

// Main Ultimate Dashboard Component
const UltimateDashboard = () => {
    // Main dashboard state
    const [dashboardData, setDashboardData] = useState({
        totalEarnings: 1847.32,
        teamSize: 47,
        rank: "Silver Star",
        package: "$100 Package",
        isConnected: false,
        userAddress: null,
        contractInfo: {
            address: window.ORPHI_CROWDFUND_CONFIG?.address || "0x8F826B18096Dcf7AF4515B06Cb563475d189ab50",
            network: "BSC Mainnet",
            status: "Live"
        }
    });

    const [activeSubTab, setActiveSubTab] = useState('compensation');
    const [notifications, setNotifications] = useState([]);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showProfile, setShowProfile] = useState(true);
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [demoMode, setDemoMode] = useState(true);
    const [userProfile, setUserProfile] = useState({
        name: 'John Doe',
        level: 'Diamond',
        packageTier: 1,
        avatar: 'JD',
        id: '12345'
    });

    // Web3 state
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [contract, setContract] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [contractStats, setContractStats] = useState({
        totalUsers: 1247,
        totalVolume: 156780,
        globalHelpPool: 23456,
        leaderBonusPool: 12345
    });
    const [sponsorAddress, setSponsorAddress] = useState('');
    const [selectedPackage, setSelectedPackage] = useState(1);
    const [withdrawAmount, setWithdrawAmount] = useState('');

    // Add notification helper
    const addNotification = useCallback((type, title, message) => {
        const notification = {
            id: Date.now(),
            type,
            title,
            message,
            timestamp: new Date().toLocaleTimeString()
        };
        setNotifications(prev => [...prev, notification]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 4000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    // Web3 Connection
    const connectWallet = async () => {
        try {
            if (!window.ethereum) {
                addNotification('error', 'MetaMask Required', 'Please install MetaMask to use this application');
                return;
            }

            setLoading(true);
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();

            // Check if on BSC Mainnet
            if (network.chainId !== 56) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0x38' }], // BSC Mainnet
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: '0x38',
                                chainName: 'BSC Mainnet',
                                nativeCurrency: {
                                    name: 'BNB',
                                    symbol: 'BNB',
                                    decimals: 18,
                                },
                                rpcUrls: ['https://bsc-dataseed.binance.org/'],
                                blockExplorerUrls: ['https://bscscan.com/'],
                            }],
                        });
                    }
                }
            }

            const signer = provider.getSigner();
            const contract = new ethers.Contract(
                window.ORPHI_CROWDFUND_CONFIG.address,
                window.CONTRACT_ABI,
                signer
            );

            setAccount(accounts[0]);
            setProvider(provider);
            setContract(contract);
            setDemoMode(false);

            setDashboardData(prev => ({
                ...prev,
                isConnected: true,
                userAddress: accounts[0]
            }));

            addNotification('success', 'Wallet Connected', `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
            
            // Load user data
            await loadUserData(contract, accounts[0]);
            await loadContractStats(contract);

        } catch (error) {
            console.error('Connection error:', error);
            addNotification('error', 'Connection Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Load User Data
    const loadUserData = async (contractInstance, userAddress) => {
        try {
            const isRegistered = await contractInstance.isUserRegistered(userAddress);
            
            if (isRegistered) {
                const userInfo = await contractInstance.getUserInfo(userAddress);
                const poolEarnings = await contractInstance.getPoolEarnings(userAddress);
                const withdrawalRate = await contractInstance.getWithdrawalRate(userAddress);

                setUserInfo({
                    totalInvested: ethers.utils.formatUnits(userInfo.totalInvested, 6),
                    registrationTime: new Date(userInfo.registrationTime.toNumber() * 1000),
                    teamSize: userInfo.teamSize.toNumber(),
                    totalEarnings: ethers.utils.formatUnits(userInfo.totalEarnings, 6),
                    withdrawableAmount: ethers.utils.formatUnits(userInfo.withdrawableAmount, 6),
                    packageTier: userInfo.packageTier,
                    leaderRank: userInfo.leaderRank,
                    isCapped: userInfo.isCapped,
                    isActive: userInfo.isActive,
                    sponsor: userInfo.sponsor,
                    directReferrals: userInfo.directReferrals.toNumber(),
                    poolEarnings: poolEarnings.map(earning => ethers.utils.formatUnits(earning, 6)),
                    withdrawalRate: withdrawalRate.toNumber()
                });

                setDashboardData(prev => ({
                    ...prev,
                    totalEarnings: parseFloat(ethers.utils.formatUnits(userInfo.totalEarnings, 6)),
                    teamSize: userInfo.teamSize.toNumber(),
                    rank: getLeaderRankName(userInfo.leaderRank),
                    package: getPackageName(userInfo.packageTier)
                }));
            } else {
                setUserInfo(null);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            addNotification('error', 'Data Load Failed', 'Failed to load user information');
        }
    };

    // Load Contract Statistics
    const loadContractStats = async (contractInstance) => {
        try {
            const [totalUsers, totalVolume, globalHelpPool, leaderBonusPool] = await Promise.all([
                contractInstance.totalUsers(),
                contractInstance.totalVolume(),
                contractInstance.globalHelpPoolBalance(),
                contractInstance.leaderBonusPoolBalance()
            ]);

            setContractStats({
                totalUsers: totalUsers.toNumber(),
                totalVolume: parseFloat(ethers.utils.formatUnits(totalVolume, 6)),
                globalHelpPool: parseFloat(ethers.utils.formatUnits(globalHelpPool, 6)),
                leaderBonusPool: parseFloat(ethers.utils.formatUnits(leaderBonusPool, 6))
            });
        } catch (error) {
            console.error('Error loading contract stats:', error);
        }
    };

    // Register User
    const registerUser = async () => {
        if (!contract || !sponsorAddress || !selectedPackage) {
            addNotification('error', 'Invalid Input', 'Please fill all required fields');
            return;
        }

        try {
            setLoading(true);
            addNotification('info', 'Registration Started', 'Please confirm the transaction in MetaMask');

            const tx = await contract.registerUser(sponsorAddress, selectedPackage);
            addNotification('info', 'Transaction Sent', 'Waiting for confirmation...');

            await tx.wait();
            addNotification('success', 'Registration Complete', 'Welcome to OrphiChain!');

            // Reload user data
            await loadUserData(contract, account);
            await loadContractStats(contract);

        } catch (error) {
            console.error('Registration error:', error);
            addNotification('error', 'Registration Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Process Withdrawal
    const processWithdrawal = async () => {
        if (!contract || !withdrawAmount || parseFloat(withdrawAmount) <= 0) {
            addNotification('error', 'Invalid Amount', 'Please enter a valid withdrawal amount');
            return;
        }

        try {
            setLoading(true);
            const amountWei = ethers.utils.parseUnits(withdrawAmount, 6);
            
            addNotification('info', 'Withdrawal Started', 'Please confirm the transaction in MetaMask');

            const tx = await contract.withdraw(amountWei);
            addNotification('info', 'Transaction Sent', 'Processing withdrawal...');

            await tx.wait();
            addNotification('success', 'Withdrawal Complete', `Successfully withdrew ${withdrawAmount} USDT`);

            // Reload user data
            await loadUserData(contract, account);
            setWithdrawAmount('');

        } catch (error) {
            console.error('Withdrawal error:', error);
            addNotification('error', 'Withdrawal Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    // Package Names
    const getPackageName = (tier) => {
        const packages = { 1: '$30 USDT', 2: '$50 USDT', 3: '$100 USDT', 4: '$200 USDT' };
        return packages[tier] || 'Unknown';
    };

    // Leader Rank Names
    const getLeaderRankName = (rank) => {
        const ranks = { 0: 'None', 1: 'Shining Star', 2: 'Silver Star' };
        return ranks[rank] || 'Unknown';
    };

    // Action handlers
    const handleWithdraw = () => {
        if (demoMode) {
            addNotification('success', 'Demo Mode', 'Withdrawal request submitted (Demo)');
        } else if (!account) {
            addNotification('warning', 'Connect Wallet', 'Please connect your wallet first');
        } else {
            setActiveSubTab('withdrawal');
        }
    };

    const handleUpgrade = () => {
        if (demoMode) {
            addNotification('info', 'Demo Mode', 'Package upgrade initiated (Demo)');
        } else if (!account) {
            addNotification('warning', 'Connect Wallet', 'Please connect your wallet first');
        } else {
            addNotification('info', 'Upgrade', 'Package upgrade feature coming soon');
        }
    };

    const handleViewTeam = () => {
        setActiveSubTab('team');
        addNotification('info', 'Team View', 'Switched to Team Analytics');
    };

    const handleDisconnect = () => {
        if (demoMode) {
            addNotification('info', 'Demo Mode', 'Cannot disconnect in demo mode');
        } else {
            setAccount(null);
            setProvider(null);
            setContract(null);
            setUserInfo(null);
            setDemoMode(true);
            setDashboardData(prev => ({
                ...prev,
                isConnected: false,
                userAddress: null
            }));
            addNotification('info', 'Disconnected', 'Wallet disconnected');
        }
    };

    // Handlers for integrated components
    const handleQuickAction = (actionType, data) => {
        switch (actionType) {
            case 'claim':
                addNotification('success', 'Rewards Claimed', `Claimed $${data.amount} successfully!`);
                break;
            case 'invite':
                addNotification('success', 'Referral Link', 'Referral link copied to clipboard!');
                break;
            case 'upgrade':
                addNotification('info', 'Package Upgrade', 'Upgrade requirements displayed');
                break;
            case 'genealogy':
                setActiveSubTab('matrix');
                addNotification('info', 'Matrix View', 'Switched to Matrix View');
                break;
            case 'analytics':
                setActiveSubTab('team');
                addNotification('info', 'Team Analytics', 'Switched to Team Analytics');
                break;
            case 'history':
                setActiveSubTab('history');
                addNotification('info', 'Transaction History', 'Viewing transaction history');
                break;
            default:
                addNotification('info', 'Action Complete', `${actionType} completed`);
        }
    };

    const handleProfileUpdate = (newProfileData) => {
        setUserProfile(newProfileData);
        addNotification('success', 'Profile Updated', 'Profile updated successfully!');
    };

    const toggleDemoMode = () => {
        setDemoMode(!demoMode);
        addNotification('info', 'Mode Changed', `Switched to ${!demoMode ? 'Demo' : 'Live'} mode`);
    };

    const toggleAdminMode = () => {
        setIsAdminMode(!isAdminMode);
        addNotification('info', 'Admin Mode', `Admin mode ${!isAdminMode ? 'enabled' : 'disabled'}`);
    };

    // Auto-connect on page load
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_accounts' })
                .then(accounts => {
                    if (accounts.length > 0) {
                        connectWallet();
                    }
                });
        }
        
        // Hide loading screen
        document.body.classList.add('app-loaded');
    }, []);

    // Real-time data updates for demo mode
    useEffect(() => {
        if (demoMode) {
            const interval = setInterval(() => {
                setDashboardData(prev => ({
                    ...prev,
                    totalEarnings: prev.totalEarnings + (Math.random() * 0.1)
                }));
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [demoMode]);

    return React.createElement('div', {
        className: 'ultimate-dashboard',
        style: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1a1a2e 50%, #16213e 100%)',
            color: 'white',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }
    }, [
        // Notification System
        React.createElement(NotificationSystem, {
            key: 'notifications',
            notifications,
            removeNotification
        }),

        // Header
        React.createElement('header', {
            key: 'header',
            style: {
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '1rem 2rem',
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }
        }, [
            React.createElement('div', {
                key: 'header-content',
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }
            }, [
                React.createElement('div', {
                    key: 'header-left',
                    style: { display: 'flex', alignItems: 'center', gap: '1rem' }
                }, [
                    React.createElement(OrphiChainLogo, {
                        key: 'logo',
                        size: 'small',
                        variant: 'orbital',
                        autoRotate: true
                    }),
                    React.createElement('h1', {
                        key: 'title',
                        style: {
                            background: 'linear-gradient(135deg, #7B2CBF 0%, #00D4FF 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            margin: 0
                        }
                    }, '🚀 OrphiChain Dashboard'),
                    demoMode && React.createElement('span', {
                        key: 'demo-badge',
                        style: {
                            background: '#FFBB33',
                            color: 'black',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }
                    }, 'Demo')
                ]),

                React.createElement('div', {
                    key: 'header-right',
                    style: { display: 'flex', alignItems: 'center', gap: '1rem' }
                }, [
                    React.createElement('button', {
                        key: 'demo-toggle',
                        onClick: toggleDemoMode,
                        style: {
                            background: demoMode ? '#FFBB33' : '#00C851',
                            border: 'none',
                            color: demoMode ? 'black' : 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }
                    }, demoMode ? '🎮 Demo' : '🔴 Live'),

                    (account || demoMode) ? React.createElement('span', {
                        key: 'account',
                        style: {
                            background: 'rgba(255, 255, 255, 0.1)',
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.9rem'
                        }
                    }, demoMode ? 'Demo User' : `${account.substring(0, 6)}...${account.substring(38)}`) : null,

                    React.createElement('button', {
                        key: 'connect-btn',
                        onClick: account ? handleDisconnect : connectWallet,
                        disabled: loading,
                        style: {
                            background: account ? '#FF4444' : 'linear-gradient(135deg, #7B2CBF 0%, #00D4FF 100%)',
                            border: 'none',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '25px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            opacity: loading ? 0.7 : 1
                        }
                    }, loading ? '⏳ Loading...' : account ? '🔌 Disconnect' : '🔗 Connect Wallet')
                ])
            ])
        ]),

        // User Profile Section
        showProfile && React.createElement(UserProfileSection, {
            key: 'user-profile',
            userInfo: userProfile,
            onProfileUpdate: handleProfileUpdate
        }),

        // Quick Actions Panel
        React.createElement(QuickActionsPanel, {
            key: 'quick-actions',
            userInfo: userProfile,
            onAction: handleQuickAction
        }),

        // Main Dashboard Content
        React.createElement('div', {
            key: 'main-content',
            style: {
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '2rem'
            }
        }, [
            // Dashboard Cards
            React.createElement('div', {
                key: 'dashboard-cards',
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '2rem'
                }
            }, [
                // Total Earnings Card
                React.createElement('div', {
                    key: 'earnings-card',
                    style: {
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '15px',
                        padding: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center'
                    }
                }, [
                    React.createElement('div', {
                        key: 'card-header',
                        style: { marginBottom: '1rem' }
                    }, [
                        React.createElement('span', { key: 'icon', style: { fontSize: '2rem' } }, '💰'),
                        React.createElement('h3', { key: 'title', style: { margin: '0.5rem 0', color: '#00D4FF' } }, 'Total Earnings')
                    ]),
                    React.createElement('div', {
                        key: 'card-value',
                        style: { fontSize: '2rem', fontWeight: 'bold', color: '#00C851' }
                    }, `$${dashboardData.totalEarnings.toFixed(2)}`),
                    React.createElement('div', {
                        key: 'card-subtitle',
                        style: { fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }
                    }, demoMode ? 'Demo earnings' : 'Real-time earnings')
                ]),

                // Team Size Card
                React.createElement('div', {
                    key: 'team-card',
                    style: {
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '15px',
                        padding: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center'
                    }
                }, [
                    React.createElement('div', {
                        key: 'card-header',
                        style: { marginBottom: '1rem' }
                    }, [
                        React.createElement('span', { key: 'icon', style: { fontSize: '2rem' } }, '👥'),
                        React.createElement('h3', { key: 'title', style: { margin: '0.5rem 0', color: '#00D4FF' } }, 'Team Size')
                    ]),
                    React.createElement('div', {
                        key: 'card-value',
                        style: { fontSize: '2rem', fontWeight: 'bold', color: '#FFBB33' }
                    }, dashboardData.teamSize),
                    React.createElement('div', {
                        key: 'card-subtitle',
                        style: { fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }
                    }, 'Active team members')
                ]),

                // Rank Card
                React.createElement('div', {
                    key: 'rank-card',
                    style: {
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '15px',
                        padding: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center'
                    }
                }, [
                    React.createElement('div', {
                        key: 'card-header',
                        style: { marginBottom: '1rem' }
                    }, [
                        React.createElement('span', { key: 'icon', style: { fontSize: '2rem' } }, '🏆'),
                        React.createElement('h3', { key: 'title', style: { margin: '0.5rem 0', color: '#00D4FF' } }, 'Rank')
                    ]),
                    React.createElement('div', {
                        key: 'card-value',
                        style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#FFD700' }
                    }, dashboardData.rank),
                    React.createElement('div', {
                        key: 'card-subtitle',
                        style: { fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }
                    }, 'Current achievement')
                ]),

                // Package Card
                React.createElement('div', {
                    key: 'package-card',
                    style: {
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '15px',
                        padding: '2rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        textAlign: 'center'
                    }
                }, [
                    React.createElement('div', {
                        key: 'card-header',
                        style: { marginBottom: '1rem' }
                    }, [
                        React.createElement('span', { key: 'icon', style: { fontSize: '2rem' } }, '📦'),
                        React.createElement('h3', { key: 'title', style: { margin: '0.5rem 0', color: '#00D4FF' } }, 'Package')
                    ]),
                    React.createElement('div', {
                        key: 'card-value',
                        style: { fontSize: '1.5rem', fontWeight: 'bold', color: '#FF6B35' }
                    }, dashboardData.package),
                    React.createElement('div', {
                        key: 'card-subtitle',
                        style: { fontSize: '0.9rem', opacity: 0.7, marginTop: '0.5rem' }
                    }, 'Active investment')
                ])
            ]),

            // Action Buttons
            React.createElement('div', {
                key: 'action-buttons',
                style: {
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginBottom: '2rem'
                }
            }, [
                React.createElement('button', {
                    key: 'withdraw-btn',
                    onClick: handleWithdraw,
                    style: {
                        background: 'linear-gradient(135deg, #00C851 0%, #00A041 100%)',
                        border: 'none',
                        color: 'white',
                        padding: '1rem 2rem',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                    }
                }, '💸 Withdraw Earnings'),

                React.createElement('button', {
                    key: 'upgrade-btn',
                    onClick: handleUpgrade,
                    style: {
                        background: 'linear-gradient(135deg, #FFBB33 0%, #FF8800 100%)',
                        border: 'none',
                        color: 'white',
                        padding: '1rem 2rem',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                    }
                }, '⬆️ Upgrade Package'),

                React.createElement('button', {
                    key: 'team-btn',
                    onClick: handleViewTeam,
                    style: {
                        background: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
                        border: 'none',
                        color: 'white',
                        padding: '1rem 2rem',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                    }
                }, '👥 View Team')
            ]),

            // Sub-Dashboard Tabs
            React.createElement('div', {
                key: 'sub-dashboard',
                style: {
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '15px',
                    padding: '2rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }
            }, [
                React.createElement('div', {
                    key: 'sub-tabs',
                    style: {
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '2rem',
                        flexWrap: 'wrap'
                    }
                }, [
                    { id: 'compensation', label: 'Compensation', icon: '💰' },
                    { id: 'team', label: 'Team Analytics', icon: '📊' },
                    { id: 'matrix', label: 'Matrix View', icon: '🌐' },
                    { id: 'history', label: 'History', icon: '📋' }
                ].map(tab => 
                    React.createElement('button', {
                        key: tab.id,
                        onClick: () => setActiveSubTab(tab.id),
                        style: {
                            background: activeSubTab === tab.id ? 'linear-gradient(135deg, #7B2CBF 0%, #00D4FF 100%)' : 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }
                    }, [
                        React.createElement('span', { key: 'icon' }, tab.icon),
                        React.createElement('span', { key: 'label' }, tab.label)
                    ])
                )),

                React.createElement('div', {
                    key: 'sub-content',
                    style: { minHeight: '300px' }
                }, [
                activeSubTab === 'compensation' && React.createElement(AdvancedCompensationDashboard, {
                    key: 'compensation-view',
                    compensationData: {
                        sponsorCommissions: dashboardData.totalEarnings * 0.4 || 847.32,
                        levelBonuses: { 1: 200, 2: 150, 3: 100, 4: 75, 5: 50, 6: 25, 7: 15, 8: 10, 9: 8, 10: 5 },
                        uplineBonuses: dashboardData.totalEarnings * 0.1 || 125.50,
                        leaderBonuses: dashboardData.totalEarnings * 0.05 || 89.75,
                        globalHelpPool: dashboardData.totalEarnings * 0.08 || 156.25,
                        totalEarnings: dashboardData.totalEarnings,
                        earningsCap: dashboardData.earningsCap || 5000,
                        isNearCap: dashboardData.totalEarnings > (dashboardData.earningsCap || 5000) * 0.8
                    },
                    selectedPackage: dashboardData.package,
                    deviceInfo: { isMobile: window.innerWidth < 768 }
                }),

                    activeSubTab === 'team' && React.createElement('div', {
                        key: 'team-view',
                        style: { padding: '1rem' }
                    }, [
                        React.createElement('h4', {
                            key: 'title',
                            style: { marginBottom: '1.5rem', color: '#00D4FF' }
                        }, '📊 Team Analytics'),
                        React.createElement('div', {
                            key: 'team-stats',
                            style: {
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '1rem'
                            }
                        }, [
                            React.createElement('div', {
                                key: 'volume',
                                style: {
                                    background: 'rgba(0, 212, 255, 0.2)',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    textAlign: 'center'
                                }
                            }, [
                                React.createElement('div', { key: 'label', style: { fontSize: '0.9rem', opacity: 0.8 } }, 'Total Volume'),
                                React.createElement('div', { key: 'value', style: { fontSize: '1.5rem', fontWeight: 'bold' } }, '$15,780')
                            ]),
                            React.createElement('div', {
                                key: 'active',
                                style: {
                                    background: 'rgba(0, 200, 81, 0.2)',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    textAlign: 'center'
                                }
                            }, [
                                React.createElement('div', { key: 'label', style: { fontSize: '0.9rem', opacity: 0.8 } }, 'Active Members'),
                                React.createElement('div', { key: 'value', style: { fontSize: '1.5rem', fontWeight: 'bold' } }, '32/47')
                            ]),
                            React.createElement('div', {
                                key: 'weekly',
                                style: {
                                    background: 'rgba(255, 107, 53, 0.2)',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    textAlign: 'center'
                                }
                            }, [
                                React.createElement('div', { key: 'label', style: { fontSize: '0.9rem', opacity: 0.8 } }, 'This Week'),
                                React.createElement('div', { key: 'value', style: { fontSize: '1.5rem', fontWeight: 'bold' } }, '+3 new')
                            ])
                        ])
                    ]),

                    activeSubTab === 'matrix' && React.createElement(SimpleGenealogyTree, { key: 'matrix-view' }),

                    activeSubTab === 'history' && React.createElement('div', {
                        key: 'history-view',
                        style: { padding: '1rem' }
                    }, [
                        React.createElement('h4', {
                            key: 'title',
                            style: { marginBottom: '1.5rem', color: '#00D4FF' }
                        }, '� Transaction History'),
                        React.createElement('div', {
                            key: 'history-list',
                            style: { display: 'flex', flexDirection: 'column', gap: '1rem' }
                        }, [
                            React.createElement('div', {
                                key: 'tx1',
                                style: {
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }
                            }, [
                                React.createElement('div', { key: 'type' }, 'Commission'),
                                React.createElement('div', { key: 'amount', style: { color: '#00C851', fontWeight: 'bold' } }, '+$47.32'),
                                React.createElement('div', { key: 'date', style: { fontSize: '0.8rem', opacity: 0.7 } }, '2 hours ago')
                            ]),
                            React.createElement('div', {
                                key: 'tx2',
                                style: {
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }
                            }, [
                                React.createElement('div', { key: 'type' }, 'Level Bonus'),
                                React.createElement('div', { key: 'amount', style: { color: '#00C851', fontWeight: 'bold' } }, '+$25.00'),
                                React.createElement('div', { key: 'date', style: { fontSize: '0.8rem', opacity: 0.7 } }, '1 day ago')
                            ]),
                            React.createElement('div', {
                                key: 'tx3',
                                style: {
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }
                            }, [
                                React.createElement('div', { key: 'type' }, 'Matrix Bonus'),
                                React.createElement('div', { key: 'amount', style: { color: '#00C851', fontWeight: 'bold' } }, '+$12.50'),
                                React.createElement('div', { key: 'date', style: { fontSize: '0.8rem', opacity: 0.7 } }, '3 days ago')
                            ])
                        ])
                    ])
                ])
            ])
        ])
    ]);
};

// Initialize the application
const initializeApp = () => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(UltimateDashboard));
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('🚀 OrphiChain Ultimate Dashboard Loaded Successfully');
