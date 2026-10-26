#!/bin/bash
# ============================================
#  BlockVote - Stop All Services
# ============================================

RED='\033[1;31m'
GREEN='\033[1;32m'
NC='\033[0m'

echo ""
echo -e "${RED}🛑 Stopping BlockVote services...${NC}"

# Kill Hardhat node (port 8545)
HARDHAT_PID=$(lsof -ti :8545 2>/dev/null)
if [ ! -z "$HARDHAT_PID" ]; then
    kill $HARDHAT_PID 2>/dev/null
    echo -e "${GREEN}   ✓ Hardhat node stopped (PID: $HARDHAT_PID)${NC}"
else
    echo "   - Hardhat node not running"
fi

# Kill React frontend (port 3000)
REACT_PID=$(lsof -ti :3000 2>/dev/null)
if [ ! -z "$REACT_PID" ]; then
    kill $REACT_PID 2>/dev/null
    echo -e "${GREEN}   ✓ Frontend stopped (PID: $REACT_PID)${NC}"
else
    echo "   - Frontend not running"
fi

echo ""
echo -e "${GREEN}👋 All BlockVote services stopped.${NC}"
echo ""
