#!/bin/bash

# OrphiCrowdFund User Testing & Community Launch Setup
# Run this script to prepare for user testing and community launch

echo "🚀 SETTING UP USER TESTING & COMMUNITY LAUNCH"
echo "=============================================="

# Create testing documentation
echo "📄 Creating user testing guides..."
mkdir -p user-testing/{guides,feedback,analytics}

# Create user testing guide
cat > user-testing/guides/USER_TESTING_GUIDE.md << 'EOF'
# ORPHI CROWDFUND USER TESTING GUIDE
## BSC Testnet Testing Instructions

### 🎯 TESTING OBJECTIVES
- Test user registration process
- Verify sponsor/referral system
- Test contribution functionality
- Verify bonus calculations
- Test withdrawal process
- Collect user feedback

### 📱 SETUP REQUIREMENTS

#### MetaMask Configuration
1. **Add BSC Testnet**
   - Network Name: BSC Testnet
   - RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545/
   - Chain ID: 97
   - Currency Symbol: BNB
   - Block Explorer: https://testnet.bscscan.com

2. **Get Test BNB**
   - Visit: https://testnet.binance.org/faucet-smart
   - Enter wallet address
   - Request test BNB tokens

### 🧪 TESTING SCENARIOS

#### Scenario 1: First User Registration
**Objective:** Test root user registration
**Steps:**
1. Connect wallet to BSC Testnet
2. Register with Package 1 ($30 equivalent)
3. Verify registration success
4. Check user dashboard

**Expected Results:**
- User successfully registered
- Package tier correctly set
- Earnings cap set to $90 (3x investment)
- Statistics updated

#### Scenario 2: Sponsored User Registration  
**Objective:** Test referral system
**Steps:**
1. Get sponsor link/address from existing user
2. Register with sponsor using Package 2 ($50)
3. Verify sponsor receives bonus
4. Check referral counting

**Expected Results:**
- User registered with correct sponsor
- Sponsor receives 40% bonus ($20)
- Sponsor's direct referrals increased
- Level bonuses calculated

#### Scenario 3: Withdrawal Testing
**Objective:** Test withdrawal functionality
**Steps:**
1. Ensure user has withdrawable balance
2. Attempt withdrawal
3. Verify transaction success
4. Check balance updates

**Expected Results:**
- Withdrawal transaction successful
- User balance updated correctly
- Contract balance reduced
- Transaction recorded on blockchain

### 📊 FEEDBACK COLLECTION

#### User Experience Metrics
- Registration completion rate
- Average registration time
- User interface clarity rating
- Error frequency and types
- Overall satisfaction score

#### Technical Metrics
- Transaction success rate
- Gas cost efficiency
- Network response time
- Contract interaction smoothness

### 🐛 BUG REPORTING

#### Report Template
**Bug ID:** [AUTO-GENERATED]
**Severity:** [Critical/High/Medium/Low]
**Description:** [Detailed description]
**Steps to Reproduce:** [Step by step]
**Expected Result:** [What should happen]
**Actual Result:** [What actually happened]
**Environment:** [Browser, wallet, network]
**Screenshots:** [If applicable]

### 📈 SUCCESS CRITERIA
- [ ] 95%+ transaction success rate
- [ ] <30 seconds average registration time
- [ ] 4+ user experience rating (1-5 scale)
- [ ] Zero critical bugs
- [ ] <5 medium/low bugs
EOF

# Create feedback collection form template
cat > user-testing/feedback/FEEDBACK_FORM.md << 'EOF'
# ORPHI CROWDFUND TESTING FEEDBACK FORM

## 👤 TESTER INFORMATION
- **Name:** _____________________
- **Email:** ____________________
- **Experience Level:** [ ] Beginner [ ] Intermediate [ ] Expert
- **Previous MLM Experience:** [ ] Yes [ ] No

## 🧪 TESTING RESULTS

### Registration Process (1-5 rating)
- **Ease of Use:** [ ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5
- **Speed:** [ ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5
- **Clarity:** [ ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5

### User Interface (1-5 rating)
- **Design:** [ ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5
- **Navigation:** [ ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5
- **Information Display:** [ ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5

### Functionality Testing
- **Registration:** [ ] Success [ ] Failed
- **Sponsor System:** [ ] Working [ ] Issues
- **Bonus Calculation:** [ ] Correct [ ] Incorrect
- **Withdrawal:** [ ] Success [ ] Failed

### Issues Encountered
1. ________________________________
2. ________________________________
3. ________________________________

### Suggestions for Improvement
1. ________________________________
2. ________________________________
3. ________________________________

### Overall Rating: [ ] 1 [ ] 2 [ ] 3 [ ] 4 [ ] 5

### Would you recommend this platform?
[ ] Definitely [ ] Probably [ ] Maybe [ ] Probably Not [ ] Definitely Not

### Additional Comments:
_________________________________________________
_________________________________________________
_________________________________________________
EOF

# Create community launch checklist
cat > user-testing/COMMUNITY_LAUNCH_CHECKLIST.md << 'EOF'
# COMMUNITY LAUNCH CHECKLIST

## 📋 PRE-LAUNCH PREPARATION

### Technical Readiness
- [ ] Smart contract deployed and verified
- [ ] Basic functionality tested
- [ ] Frontend integration prepared
- [ ] User guides created
- [ ] Support documentation ready

### Community Setup
- [ ] Telegram group created
- [ ] Discord server setup
- [ ] Social media accounts
- [ ] Website/landing page
- [ ] FAQ documentation

### Marketing Materials
- [ ] Platform overview video
- [ ] Step-by-step tutorials
- [ ] Compensation plan explanation
- [ ] Safety and security guide
- [ ] Testimonials (when available)

## 🚀 LAUNCH STRATEGY

### Phase 1: Closed Beta (Week 1)
- **Target:** 10-20 experienced users
- **Focus:** Technical testing and feedback
- **Activities:**
  - Invite experienced crypto users
  - Conduct guided testing sessions
  - Collect detailed feedback
  - Fix critical issues

### Phase 2: Community Beta (Week 2)
- **Target:** 50-100 community members
- **Focus:** User experience and engagement
- **Activities:**
  - Open to community members
  - Social media announcement
  - Referral incentives
  - Regular feedback collection

### Phase 3: Public Launch (Week 3+)
- **Target:** General public
- **Focus:** Growth and adoption
- **Activities:**
  - Public announcement
  - Marketing campaign
  - Influencer partnerships
  - Media coverage

## 📞 SUPPORT STRUCTURE

### Support Channels
- [ ] Telegram support group
- [ ] Discord help desk
- [ ] Email support
- [ ] FAQ section
- [ ] Video tutorials

### Support Team Training
- [ ] Platform functionality
- [ ] Common issues resolution
- [ ] Escalation procedures
- [ ] Documentation updates

## 📊 LAUNCH METRICS

### Week 1 Targets
- [ ] 20+ registered users
- [ ] 95%+ transaction success rate
- [ ] <5 reported bugs
- [ ] 4+ average satisfaction rating

### Week 2 Targets
- [ ] 100+ registered users
- [ ] 50+ active referrers
- [ ] Community engagement >80%
- [ ] Media mentions: 3+

### Week 3 Targets
- [ ] 500+ registered users
- [ ] $10,000+ total contributions
- [ ] Platform stability 99%+
- [ ] Ready for mainnet consideration
EOF

echo "✅ User testing & community launch setup complete!"
echo ""
echo "📋 Immediate actions:"
echo "   1. Set up community channels (Telegram, Discord)"
echo "   2. Create user testing group"
echo "   3. Prepare marketing materials"
echo "   4. Schedule beta testing sessions"
echo ""
echo "🎯 Launch timeline:"
echo "   Week 1: Closed beta (10-20 users)"
echo "   Week 2: Community beta (50-100 users)"  
echo "   Week 3: Public launch preparation"
echo ""
echo "📈 Success metrics:"
echo "   • User registration rate"
echo "   • Transaction success rate"
echo "   • Community engagement"
echo "   • Platform stability"
EOF
