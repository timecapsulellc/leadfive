#!/bin/bash
# Start the OrphiChain Dashboard environment
# This script starts all required services for testing the OrphiChain dashboard

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting OrphiChain Dashboard Environment 🚀${NC}"
echo -e "${BLUE}=================================================${NC}\n"

# Check if ports are already in use
PORT_8545=$(lsof -i:8545 | grep LISTEN)
PORT_5179=$(lsof -i:5179 | grep LISTEN)

# If ports are in use, notify user
if [ ! -z "$PORT_8545" ]; then
    echo -e "${YELLOW}⚠️  Port 8545 is already in use. Hardhat network may already be running.${NC}"
fi

if [ ! -z "$PORT_5179" ]; then
    echo -e "${YELLOW}⚠️  Port 5179 is already in use. Dashboard server may already be running.${NC}"
fi

# Step 1: Start Hardhat network
echo -e "${GREEN}Step 1: Starting Hardhat local network...${NC}"
npx hardhat node --network localhost > /dev/null 2>&1 &
HARDHAT_PID=$!
echo -e "${GREEN}✅ Hardhat network started on http://localhost:8545 (PID: $HARDHAT_PID)${NC}\n"

# Give hardhat time to start
sleep 2

# Step 2: Deploy the contract
echo -e "${GREEN}Step 2: Deploying OrphiCrowdFundV4UltraSecure contract...${NC}"
npx hardhat run scripts/deploy-v4ultra.js --network localhost
echo -e "${GREEN}✅ Contract deployed successfully${NC}\n"

# Step 3: Start the dashboard
echo -e "${GREEN}Step 3: Starting the dashboard server...${NC}"
npm run dev > /dev/null 2>&1 &
DASHBOARD_PID=$!
echo -e "${GREEN}✅ Dashboard server started (PID: $DASHBOARD_PID)${NC}\n"

# Give the dashboard time to start
sleep 3

# Step 4: Display information
echo -e "${GREEN}Step 4: Environment ready for testing!${NC}"
echo -e "${BLUE}----------------------------------------${NC}"
echo -e "${BLUE}Dashboard URL:${NC} http://localhost:5179"
echo -e "${BLUE}Hardhat Network:${NC} http://localhost:8545"
echo -e "${BLUE}Contract Address:${NC} 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
echo -e "${BLUE}MockUSDT Address:${NC} 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
echo -e "${BLUE}----------------------------------------${NC}\n"

# Step 5: Instructions for stopping
echo -e "${YELLOW}To stop all services, run:${NC}"
echo -e "kill $HARDHAT_PID $DASHBOARD_PID\n"

# Step 6: MetaMask setup
echo -e "${GREEN}Step 6: MetaMask Setup${NC}"
echo -e "${BLUE}Please run ${YELLOW}./setup-metamask.sh${BLUE} for instructions on configuring MetaMask${NC}\n"

echo -e "${GREEN}🎉 All services started successfully! The dashboard is ready for testing. 🎉${NC}"

# Keep the script running until user presses Ctrl+C
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
wait
