#!/bin/bash
# ============================================
#  BlockVote - One-Click Startup Script
#  Just run: ./start.sh
# ============================================

set -e

BLUE='\033[1;34m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down BlockVote...${NC}"
    if [ ! -z "$NODE_PID" ]; then
        kill $NODE_PID 2>/dev/null
        echo -e "${GREEN}   ✓ Hardhat node stopped${NC}"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}   ✓ Frontend stopped${NC}"
    fi
    echo -e "${GREEN}👋 BlockVote shut down cleanly. Goodbye!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🗳️  BlockVote - Decentralized E-Voting     ║${NC}"
echo -e "${BLUE}║       One-Click Startup Script               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Start Hardhat Node
echo -e "${YELLOW}[1/4]${NC} Starting local Hardhat blockchain..."
npx hardhat node > /tmp/blockvote-hardhat.log 2>&1 &
NODE_PID=$!

# Wait for Hardhat node to be ready
echo -n "       Waiting for node to start"
for i in {1..30}; do
    if curl -s -X POST -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        http://127.0.0.1:8545 > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}   ✓ Hardhat node running on http://127.0.0.1:8545 (PID: $NODE_PID)${NC}"
        break
    fi
    echo -n "."
    sleep 1
    if [ $i -eq 30 ]; then
        echo ""
        echo -e "${RED}   ✗ Hardhat node failed to start. Check /tmp/blockvote-hardhat.log${NC}"
        exit 1
    fi
done

# Step 2: Deploy Smart Contract
echo ""
echo -e "${YELLOW}[2/4]${NC} Deploying smart contract..."
npx hardhat run scripts/deploy.js --network localhost 2>&1 | while IFS= read -r line; do
    echo "       $line"
done
echo -e "${GREEN}   ✓ Contract deployed successfully${NC}"

# Step 3: Start Frontend
echo ""
echo -e "${YELLOW}[3/4]${NC} Starting React frontend..."
cd "$PROJECT_DIR/frontend"
BROWSER=none npm start > /tmp/blockvote-frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo -n "       Waiting for frontend to compile"
for i in {1..60}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}   ✓ Frontend running on http://localhost:3000 (PID: $FRONTEND_PID)${NC}"
        break
    fi
    echo -n "."
    sleep 2
    if [ $i -eq 60 ]; then
        echo ""
        echo -e "${YELLOW}   ⚠ Frontend is still compiling. Check http://localhost:3000 in a moment.${NC}"
        break
    fi
done

# Step 4: Open in browser
echo ""
echo -e "${YELLOW}[4/4]${NC} Opening in browser..."
open http://localhost:3000
echo -e "${GREEN}   ✓ Browser opened${NC}"

# Done!
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ${GREEN}✅ BlockVote is running!${BLUE}                    ║${NC}"
echo -e "${BLUE}╠══════════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC}                                              ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}   🌐 App:        ${GREEN}http://localhost:3000${NC}        ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}   ⛓️  Blockchain:  ${GREEN}http://127.0.0.1:8545${NC}       ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}                                              ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}   ${YELLOW}MetaMask Setup:${NC}                            ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}   • Network: Hardhat Local                   ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}   • RPC URL: http://127.0.0.1:8545           ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}   • Chain ID: 31337                          ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}   • Import Account #0 private key:           ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}   • 0xac0974bec39a17e36ba4a6b4d238ff944b     ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}     acb478cbed5efcae784d7bf4f2ff80           ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}                                              ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}   ${RED}Press Ctrl+C to stop everything${NC}            ${BLUE}║${NC}"
echo -e "${BLUE}║${NC}                                              ${BLUE}║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Keep running until Ctrl+C
wait
