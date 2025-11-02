// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PredictionMarket
 * @dev Prediction market contract for Base blockchain
 * Compatible with your existing Seti backend API
 */
contract PredictionMarket {
    struct Market {
        string id;
        string question;
        string description;
        uint256 endTime;
        uint256 yesShares;
        uint256 noShares;
        uint256 totalPool;
        bool resolved;
        bool outcome;
        address creator;
        string category;
    }

    struct Position {
        uint256 yesShares;
        uint256 noShares;
        bool claimed;
    }

    mapping(string => Market) public markets;
    mapping(string => mapping(address => Position)) public positions;
    
    string[] public marketIds;
    uint256 public constant FEE_PERCENTAGE = 2; // 2% platform fee

    event MarketCreated(
        string indexed marketId,
        string question,
        uint256 endTime,
        address creator
    );

    event BetPlaced(
        string indexed marketId,
        address indexed user,
        bool outcome,
        uint256 amount,
        uint256 shares
    );

    event MarketResolved(
        string indexed marketId,
        bool outcome
    );

    event WinningsClaimed(
        string indexed marketId,
        address indexed user,
        uint256 amount
    );

    /**
     * @dev Create a new prediction market
     */
    function createMarket(
        string memory _marketId,
        string memory _question,
        string memory _description,
        uint256 _endTime,
        string memory _category
    ) external payable returns (string memory) {
        require(_endTime > block.timestamp, "End time must be in future");
        require(msg.value > 0, "Must provide initial liquidity");
        require(bytes(markets[_marketId].id).length == 0, "Market already exists");

        uint256 initialShares = 1000 * 1e18; // 1000 shares each side
        
        markets[_marketId] = Market({
            id: _marketId,
            question: _question,
            description: _description,
            endTime: _endTime,
            yesShares: initialShares,
            noShares: initialShares,
            totalPool: msg.value,
            resolved: false,
            outcome: false,
            creator: msg.sender,
            category: _category
        });

        marketIds.push(_marketId);

        emit MarketCreated(_marketId, _question, _endTime, msg.sender);
        return _marketId;
    }

    /**
     * @dev Place a bet on a market outcome
     */
    function placeBet(
        string memory _marketId,
        bool _outcome
    ) external payable {
        Market storage market = markets[_marketId];
        require(bytes(market.id).length > 0, "Market does not exist");
        require(block.timestamp < market.endTime, "Market has ended");
        require(!market.resolved, "Market already resolved");
        require(msg.value > 0, "Must send ETH");

        // Simple constant product AMM
        uint256 shares;
        if (_outcome) {
            shares = (msg.value * market.yesShares) / (market.yesShares + msg.value);
            market.yesShares += shares;
        } else {
            shares = (msg.value * market.noShares) / (market.noShares + msg.value);
            market.noShares += shares;
        }

        market.totalPool += msg.value;

        Position storage position = positions[_marketId][msg.sender];
        if (_outcome) {
            position.yesShares += shares;
        } else {
            position.noShares += shares;
        }

        emit BetPlaced(_marketId, msg.sender, _outcome, msg.value, shares);
    }

    /**
     * @dev Resolve a market (only creator)
     */
    function resolveMarket(
        string memory _marketId,
        bool _outcome
    ) external {
        Market storage market = markets[_marketId];
        require(bytes(market.id).length > 0, "Market does not exist");
        require(msg.sender == market.creator, "Only creator can resolve");
        require(block.timestamp >= market.endTime, "Market not ended");
        require(!market.resolved, "Already resolved");

        market.resolved = true;
        market.outcome = _outcome;

        emit MarketResolved(_marketId, _outcome);
    }

    /**
     * @dev Claim winnings from a resolved market
     */
    function claimWinnings(string memory _marketId) external {
        Market storage market = markets[_marketId];
        require(bytes(market.id).length > 0, "Market does not exist");
        require(market.resolved, "Market not resolved");

        Position storage position = positions[_marketId][msg.sender];
        require(!position.claimed, "Already claimed");
        
        uint256 winningShares = market.outcome ? position.yesShares : position.noShares;
        require(winningShares > 0, "No winning shares");

        uint256 totalWinningShares = market.outcome ? market.yesShares : market.noShares;
        uint256 payout = (winningShares * market.totalPool) / totalWinningShares;
        
        uint256 fee = (payout * FEE_PERCENTAGE) / 100;
        uint256 finalPayout = payout - fee;

        position.claimed = true;

        (bool success, ) = msg.sender.call{value: finalPayout}("");
        require(success, "Transfer failed");

        emit WinningsClaimed(_marketId, msg.sender, finalPayout);
    }

    /**
     * @dev Get current prices for a market
     */
    function getPrices(string memory _marketId) external view returns (uint256 yesPrice, uint256 noPrice) {
        Market storage market = markets[_marketId];
        require(bytes(market.id).length > 0, "Market does not exist");
        
        uint256 total = market.yesShares + market.noShares;
        yesPrice = (market.yesShares * 100) / total;
        noPrice = (market.noShares * 100) / total;
    }

    /**
     * @dev Get user's position in a market
     */
    function getPosition(
        string memory _marketId,
        address _user
    ) external view returns (uint256 yesShares, uint256 noShares, bool claimed) {
        Position storage position = positions[_marketId][_user];
        return (position.yesShares, position.noShares, position.claimed);
    }

    /**
     * @dev Get market count
     */
    function getMarketCount() external view returns (uint256) {
        return marketIds.length;
    }

    /**
     * @dev Get market by index
     */
    function getMarketByIndex(uint256 index) external view returns (Market memory) {
        require(index < marketIds.length, "Index out of bounds");
        return markets[marketIds[index]];
    }
}

