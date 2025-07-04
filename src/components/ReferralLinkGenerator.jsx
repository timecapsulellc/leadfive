/**
 * Referral Link Generator Component
 * Generates and manages referral links for LeadFive users
 */

import React, { useState, useEffect } from 'react';
import { 
  FaLink, 
  FaCopy, 
  FaShare, 
  FaQrcode, 
  FaWhatsapp, 
  FaTelegram, 
  FaTwitter, 
  FaFacebook,
  FaEnvelope,
  FaCheck,
  FaDownload
} from 'react-icons/fa';
import QRCode from 'qrcode';
import { ROOT_USER_CONFIG, generateReferralLink } from '../config/rootUser';

const ReferralLinkGenerator = ({ userAccount, userReferralCode }) => {
  const [referralLink, setReferralLink] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareStats, setShareStats] = useState({
    totalShares: 0,
    clicks: 0,
    registrations: 0
  });

  // Generate referral link on component mount
  useEffect(() => {
    if (userReferralCode) {
      const link = generateReferralLink(userReferralCode);
      setReferralLink(link);
      generateQRCode(link);
    } else if (userAccount) {
      // Use wallet address as referral if no custom code
      const link = generateReferralLink(userAccount);
      setReferralLink(link);
      generateQRCode(link);
    } else {
      // Fallback to root user link
      const link = ROOT_USER_CONFIG.referralLinks.current;
      setReferralLink(link);
      generateQRCode(link);
    }
  }, [userAccount, userReferralCode]);

  // Generate QR Code
  const generateQRCode = async (link) => {
    try {
      const qrDataURL = await QRCode.toDataURL(link, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeData(qrDataURL);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
      
      // Track copy event
      trackShareEvent('copy');
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = referralLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Track sharing events
  const trackShareEvent = (platform) => {
    setShareStats(prev => ({
      ...prev,
      totalShares: prev.totalShares + 1
    }));
    
    // You can integrate with analytics here
    console.log(`Referral link shared via: ${platform}`);
  };

  // Social sharing functions
  const shareOnWhatsApp = () => {
    const message = encodeURIComponent(
      `🚀 Join me on LeadFive - the revolutionary Web3 financial platform!\n\n` +
      `💰 Earn up to 4X your investment\n` +
      `🔗 Smart contracts ensure transparency\n` +
      `🤖 AI-powered insights with AIRA\n\n` +
      `Register here: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
    trackShareEvent('whatsapp');
  };

  const shareOnTelegram = () => {
    const message = encodeURIComponent(
      `🚀 Join LeadFive - Revolutionary Web3 Financial Platform!\n\n` +
      `💎 Up to 4X sustainable returns\n` +
      `🔐 PhD-audited smart contracts\n` +
      `🤖 AI assistant included\n\n` +
      `${referralLink}`
    );
    window.open(`https://t.me/share/url?url=${referralLink}&text=${message}`, '_blank');
    trackShareEvent('telegram');
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `🚀 Discovered @LeadFive - the future of Web3 finance!\n\n` +
      `💰 4X sustainable returns\n` +
      `🔗 Transparent smart contracts\n` +
      `🤖 AI-powered insights\n\n` +
      `Join the revolution:`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${referralLink}`, '_blank');
    trackShareEvent('twitter');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
    trackShareEvent('facebook');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join me on LeadFive - Revolutionary Web3 Platform');
    const body = encodeURIComponent(
      `Hi there!\n\n` +
      `I wanted to share something exciting with you - LeadFive, a revolutionary Web3 financial platform.\n\n` +
      `Here's what makes it special:\n` +
      `💰 Up to 4X sustainable returns on investment\n` +
      `🔐 PhD-audited smart contracts for security\n` +
      `🤖 AIRA AI assistant for personalized guidance\n` +
      `🌐 100% transparent on blockchain\n` +
      `👥 Strong community of like-minded investors\n\n` +
      `I think you'd really benefit from this opportunity. The platform combines cutting-edge technology with proven financial strategies.\n\n` +
      `You can register using my referral link: ${referralLink}\n\n` +
      `Feel free to reach out if you have any questions!\n\n` +
      `Best regards`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
    trackShareEvent('email');
  };

  // Download QR code
  const downloadQRCode = () => {
    if (qrCodeData) {
      const link = document.createElement('a');
      link.download = `leadfive-referral-qr-${userReferralCode || 'default'}.png`;
      link.href = qrCodeData;
      link.click();
      trackShareEvent('qr_download');
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.08)',
      backdropFilter: 'blur(12px)',
      borderRadius: '20px',
      padding: '24px',
      margin: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 style={{ 
          margin: '0 0 8px 0', 
          color: '#fbbf24',
          fontSize: '1.8rem',
          fontWeight: 'bold'
        }}>
          🔗 Your Referral Link
        </h2>
        <p style={{ 
          margin: 0, 
          color: '#cbd5e1',
          fontSize: '1rem'
        }}>
          Share LeadFive with others and earn rewards
        </p>
      </div>

      {/* Referral Link Display */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <FaLink style={{ color: '#3b82f6' }} />
          <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Your Referral Link</span>
        </div>
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <input
            type="text"
            value={referralLink}
            readOnly
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            onClick={copyToClipboard}
            style={{
              background: copySuccess ? '#10b981' : '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'background 0.3s ease'
            }}
          >
            {copySuccess ? <FaCheck /> : <FaCopy />}
            {copySuccess ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* QR Code Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <FaQrcode style={{ color: '#8b5cf6' }} />
          <span style={{ color: '#8b5cf6', fontWeight: 'bold' }}>QR Code</span>
        </div>
        {qrCodeData && (
          <div>
            <img 
              src={qrCodeData} 
              alt="Referral QR Code"
              style={{ 
                maxWidth: '200px', 
                height: 'auto',
                border: '4px solid white',
                borderRadius: '8px',
                marginBottom: '12px'
              }}
            />
            <br />
            <button
              onClick={downloadQRCode}
              style={{
                background: '#8b5cf6',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                color: 'white',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              <FaDownload />
              Download QR
            </button>
          </div>
        )}
      </div>

      {/* Social Sharing Buttons */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <FaShare style={{ color: '#10b981' }} />
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>Share on Social Media</span>
        </div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
          gap: '12px' 
        }}>
          <button
            onClick={shareOnWhatsApp}
            style={{
              background: '#25d366',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <FaWhatsapp />
            WhatsApp
          </button>
          <button
            onClick={shareOnTelegram}
            style={{
              background: '#0088cc',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <FaTelegram />
            Telegram
          </button>
          <button
            onClick={shareOnTwitter}
            style={{
              background: '#1da1f2',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <FaTwitter />
            Twitter
          </button>
          <button
            onClick={shareOnFacebook}
            style={{
              background: '#4267b2',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <FaFacebook />
            Facebook
          </button>
          <button
            onClick={shareViaEmail}
            style={{
              background: '#ea4335',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px'
            }}
          >
            <FaEnvelope />
            Email
          </button>
        </div>
      </div>

      {/* Share Statistics */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '16px'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#fbbf24' }}>📊 Sharing Statistics</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
              {shareStats.totalShares}
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Total Shares</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {shareStats.clicks}
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Link Clicks</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
              {shareStats.registrations}
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Registrations</div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.1)',
        borderRadius: '12px',
        padding: '16px',
        marginTop: '20px',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#10b981' }}>💡 Sharing Tips</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#cbd5e1', fontSize: '14px' }}>
          <li>Share your personal success story with LeadFive</li>
          <li>Explain the 4X earning potential and smart contracts</li>
          <li>Mention the AI assistant (AIRA) for guidance</li>
          <li>Emphasize the transparent, blockchain-based system</li>
          <li>Follow up with interested contacts personally</li>
        </ul>
      </div>
    </div>
  );
};

export default ReferralLinkGenerator;