import React, { useState } from 'react';

const UserProfileSection = ({ userInfo, onProfileUpdate }) => {
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState({
    name: userInfo?.name || 'John Doe',
    level: userInfo?.level || 'Diamond',
    packageTier: userInfo?.packageTier || 1,
    avatar: userInfo?.avatar || 'JD'
  });

  const handleProfileSave = () => {
    onProfileUpdate?.(profileData);
    setShowProfileEdit(false);
  };

  const getAvatarInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getLevelColor = (level) => {
    const colors = {
      'Bronze': '#CD7F32',
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Platinum': '#E5E4E2',
      'Diamond': '#00D4FF'
    };
    return colors[level] || '#00D4FF';
  };

  return (
    <div className="user-profile-section">
      <div className="profile-header">
        <div className="user-avatar-large">
          {getAvatarInitials(profileData.name)}
        </div>
        <div className="user-details-extended">
          <h3>{profileData.name}</h3>
          <div 
            className="user-level-badge"
            style={{ backgroundColor: getLevelColor(profileData.level) }}
          >
            {profileData.level} Level
          </div>
          <div className="package-info">
            Package Tier {profileData.packageTier} | ID: {userInfo?.id || '12345'}
          </div>
        </div>
        <button 
          className="edit-profile-btn"
          onClick={() => setShowProfileEdit(!showProfileEdit)}
        >
          ✏️ Edit Profile
        </button>
      </div>

      {showProfileEdit && (
        <div className="profile-edit-modal">
          <div className="profile-edit-content">
            <h4>Edit Profile</h4>
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Current Level</label>
              <select
                value={profileData.level}
                onChange={(e) => setProfileData({...profileData, level: e.target.value})}
              >
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
                <option value="Diamond">Diamond</option>
              </select>
            </div>
            <div className="form-actions">
              <button onClick={handleProfileSave} className="save-btn">Save Changes</button>
              <button onClick={() => setShowProfileEdit(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .user-profile-section {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid #00D4FF;
          border-radius: 15px;
          padding: 20px;
          margin-bottom: 20px;
          backdrop-filter: blur(10px);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
        }

        .user-avatar-large {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(45deg, #00D4FF, #0099CC);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: white;
        }

        .user-details-extended h3 {
          margin: 0 0 8px 0;
          color: white;
          font-size: 1.4rem;
        }

        .user-level-badge {
          color: #1a1a2e;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          display: inline-block;
          margin-bottom: 8px;
        }

        .package-info {
          color: #ccc;
          font-size: 14px;
        }

        .edit-profile-btn {
          position: absolute;
          right: 0;
          top: 0;
          background: transparent;
          border: 1px solid #00D4FF;
          color: #00D4FF;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .edit-profile-btn:hover {
          background: #00D4FF;
          color: #1a1a2e;
        }

        .profile-edit-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .profile-edit-content {
          background: #1a1a2e;
          border: 2px solid #00D4FF;
          border-radius: 15px;
          padding: 30px;
          min-width: 400px;
        }

        .profile-edit-content h4 {
          color: #00D4FF;
          margin-bottom: 20px;
          text-align: center;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          color: white;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #333;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }

        .save-btn, .cancel-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .save-btn {
          background: #00D4FF;
          color: #1a1a2e;
        }

        .cancel-btn {
          background: transparent;
          color: #ccc;
          border: 1px solid #666;
        }

        .save-btn:hover {
          background: #00b8e6;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            text-align: center;
          }
          
          .edit-profile-btn {
            position: static;
            margin-top: 15px;
          }
          
          .profile-edit-content {
            margin: 20px;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfileSection;
