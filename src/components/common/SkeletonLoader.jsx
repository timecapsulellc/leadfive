import React from 'react';

const SkeletonLoader = ({
  variant = 'text',
  width = '100%',
  height = '1rem',
  className = '',
  count = 1,
  spacing = '0.5rem',
}) => {
  const skeletonStyle = {
    display: 'inline-block',
    width,
    height,
    backgroundColor: '#e2e8f0',
    borderRadius: '0.375rem',
    backgroundImage:
      'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    position: 'relative',
    overflow: 'hidden',
  };

  const variants = {
    text: { height: '1rem', borderRadius: '0.25rem' },
    title: { height: '1.5rem', borderRadius: '0.375rem' },
    paragraph: { height: '4rem', borderRadius: '0.5rem' },
    card: { height: '8rem', borderRadius: '0.75rem' },
    avatar: {
      width: '3rem',
      height: '3rem',
      borderRadius: '50%',
    },
    button: {
      height: '2.5rem',
      borderRadius: '0.5rem',
      width: '120px',
    },
    badge: {
      height: '1.25rem',
      borderRadius: '9999px',
      width: '60px',
    },
  };

  const variantStyle = variants[variant] || {};
  const finalStyle = { ...skeletonStyle, ...variantStyle };

  if (count === 1) {
    return (
      <div className={`skeleton-loader ${className}`} style={finalStyle} />
    );
  }

  return (
    <div className={`skeleton-group ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="skeleton-loader"
          style={{
            ...finalStyle,
            marginBottom: index < count - 1 ? spacing : '0',
          }}
        />
      ))}
    </div>
  );
};

// Specialized skeleton components for common use cases
export const TextSkeleton = props => (
  <SkeletonLoader variant="text" {...props} />
);
export const TitleSkeleton = props => (
  <SkeletonLoader variant="title" {...props} />
);
export const ParagraphSkeleton = props => (
  <SkeletonLoader variant="paragraph" {...props} />
);
export const CardSkeleton = props => (
  <SkeletonLoader variant="card" {...props} />
);
export const AvatarSkeleton = props => (
  <SkeletonLoader variant="avatar" {...props} />
);
export const ButtonSkeleton = props => (
  <SkeletonLoader variant="button" {...props} />
);
export const BadgeSkeleton = props => (
  <SkeletonLoader variant="badge" {...props} />
);

// Dashboard-specific skeleton components
export const DashboardCardSkeleton = ({ className = '' }) => (
  <div
    className={`dashboard-card-skeleton ${className}`}
    style={{ padding: '1.5rem' }}
  >
    <div
      style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}
    >
      <AvatarSkeleton width="2rem" height="2rem" />
      <TitleSkeleton width="120px" style={{ marginLeft: '0.75rem' }} />
    </div>
    <ParagraphSkeleton height="1rem" style={{ marginBottom: '0.5rem' }} />
    <TextSkeleton width="80%" />
  </div>
);

export const EarningsCardSkeleton = ({ className = '' }) => (
  <div
    className={`earnings-card-skeleton ${className}`}
    style={{ padding: '1.5rem' }}
  >
    <div style={{ textAlign: 'center' }}>
      <TitleSkeleton width="100px" style={{ margin: '0 auto 0.75rem' }} />
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
        <TextSkeleton width="120px" height="2rem" />
      </div>
      <BadgeSkeleton />
    </div>
  </div>
);

export const ReferralListSkeleton = ({ count = 3, className = '' }) => (
  <div className={`referral-list-skeleton ${className}`}>
    {Array.from({ length: count }, (_, index) => (
      <div
        key={index}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '1rem',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '0.5rem',
        }}
      >
        <AvatarSkeleton />
        <div style={{ marginLeft: '1rem', flex: 1 }}>
          <TitleSkeleton width="150px" style={{ marginBottom: '0.5rem' }} />
          <TextSkeleton width="100px" />
        </div>
        <BadgeSkeleton />
      </div>
    ))}
  </div>
);

export default SkeletonLoader;
