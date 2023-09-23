// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

//IMPORTING CONTRACTS

import "./Ownable.sol";
import "./ReentrancyGuard.sol";
import "./Initializable.sol";
import "./IERC20.sol";

contract TokenStaking is Ownable, ReentrancyGuard, Initializable {
    // struct to store the users detials

    struct User {
        uint256 stakeAmount; // Stake Amount
        uint256 rewardAmount; // Reward Amount
        uint256 lastStakeTime; // Last stake time
        uint256 lastRewardCalculationTime; // Last reward calculation time
        uint256 rewardsClaimedSoFar; // sum of the rewards claomed so far
    }

    uint256 _minimumStakingAmount;

    uint256 _maxStakeTokenLimit; /// maximum staking token limit for program

    uint256 _stakeEndDate; //

    uint256 _stakeStartDate; //

    uint256 _totalStakedTokens; //

    uint256 _totalUsers; //

    uint256 _stakeDays; // staking days for program

    uint256 _earlyUnStakeFeePercentage; //early unstake fee percentage

    bool _isStakingPaused; //

    address private _tokenAddress; //
    // APY
    uint256 _apyRate; //

    uint256 public constant PERCENTAGE_DENOMINATION = 100;
    uint256 public constant APY_RATE_CHANGE_THRESHOLD = 10;

    // User add  mapped to users
    mapping(address => User) private _users;
    event Stake(address indexed user, uint256 amount);
    event UnStake(address indexed user, uint256 amount);
    event EarlyUnStakeFee(address indexed user, uint256 amount);
    event ClaimReward(address indexed user, uint256 amount);

    modifier whenTreasuryHasBalance(uint256 amount) {
        require(
            IERC20(_tokenAddress).balanceOf(address(this)) >= amount,
            "TokenStaking: insufficient funs in the treasury"
        );

        _;
    }

    function initialize(
        address owner_,
        address tokenAddress_,
        uint256 apyRate_,
        uint256 minimumStakingAmount_,
        uint256 maxStakeTokenLimit_,
        uint256 stakeStartDate_,
        uint256 stakeEndDate_,
        uint256 stakeDays_,
        uint256 earlyUnStakeFeePercentage_
    ) public virtual initializer {
        _TokenStaking_init_unchained(
            owner_,
            tokenAddress_,
            apyRate_,
            minimumStakingAmount_,
            maxStakeTokenLimit_,
            stakeStartDate_,
            stakeEndDate_,
            stakeDays_,
            earlyUnStakeFeePercentage_
        );
    }

    function _TokenStaking_init_unchained(
        address owner_,
        address tokenAddress_,
        uint256 apyRate_,
        uint256 minimumStakingAmount_,
        uint256 maxStakeTokenLimit_,
        uint256 stakeStartDate_,
        uint256 stakeEndDate_,
        uint256 stakeDays_,
        uint256 earlyUnStakeFeePercentage_
    ) internal onlyInitializing {
        require(
            apyRate_ <= 10000,
            "TokenStaking: apy rate should be less than or equal to 10000"
        );
        require(
            stakeDays_ > 0,
            "TokenStaking: stake days must be greater than 0"
        );
        require(
            tokenAddress_ != address(0),
            "TokenStaking: token address cannot be the zero address"
        );
        require(
            stakeStartDate_ < stakeEndDate_,
            "TokenStaking: start date must be less than end date"
        );

        _transferOwnership(owner_);
        _tokenAddress = tokenAddress_;
        _apyRate = apyRate_;
        _minimumStakingAmount = minimumStakingAmount_;
        _maxStakeTokenLimit = maxStakeTokenLimit_;
        _stakeStartDate = stakeStartDate_;
        _stakeEndDate = stakeEndDate_;
        _stakeDays = stakeDays_ * 1 days;
        _earlyUnStakeFeePercentage = earlyUnStakeFeePercentage_;
    }

    /* view methods start */

    /**
     * @notice This function is usedf to get the minmu staking amount
     */

    function getMinimumStakingAmount() external view returns (uint256) {
        return _minimumStakingAmount;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     */
    function getMaxStakingTokenLimit() external view returns (uint256) {
        return _maxStakeTokenLimit;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     */
    function getStakeStartDate() external view returns (uint256) {
        return _stakeStartDate;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     */
    function getStakeEndDate() external view returns (uint256) {
        return _stakeEndDate;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     */
    function getTotalStakeTokens() external view returns (uint256) {
        return _totalStakedTokens;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     */
    function getTotalUsers() external view returns (uint256) {
        return _stakeDays;
    }

    /**
     * @notice This function is used to get the minmu staking amount
     */
    function getEarlyUnStakeFeePercentage() external view returns (uint256) {
        return _earlyUnStakeFeePercentage;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     */
    function getStakingStatus() external view returns (bool) {
        return _isStakingPaused;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     * @return Current APY Rate
     */
    function getAPY() external view returns (uint256) {
        return _apyRate;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     * @return msg.sender estimated rewarding amount
    
     */
    function getUserEstimatedRewards() external view returns (uint256) {
        (uint256 amount, ) = _getUserEstimatedRewards(msg.sender);
        return _users[msg.sender].rewardAmount + amount;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     */
    function getWithdrawableAmount() external view returns (uint256) {
        return
            IERC20(_tokenAddress).balanceOf(address(this)) - _totalStakedTokens;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     * @param userAddress User'saddress to get detials of
     * @return User Struct
     */
    function getUser(address userAddress) external view returns (User memory) {
        return _users[userAddress];
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     * @param _user'saddress to get detials of
     * @return User Struct
     */
    function isStakeHolder(address _user) external view returns (bool) {
        return _users[_user].stakeAmount != 0;
    }

    /* view method end */

    /*owner methons start */

    /**
     * @notice This function is usedf to get the minmu staking amount
     */
    function updateMinimumStakingAmount(uint256 newAmount) external onlyOwner {
        _minimumStakingAmount = newAmount;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     */
    function updateMaximumStakingAmount(uint256 newAmount) external onlyOwner {
        _maxStakeTokenLimit = newAmount;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     */
    function updateStakingEndDate(uint256 newDate) external onlyOwner {
        _stakeEndDate = newDate;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     */
    function updateEarlyUnStakeFeePercentage(
        uint256 newPercentage
    ) external onlyOwner {
        _earlyUnStakeFeePercentage = newPercentage;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     * @dev This function be used to stake tokens for specific users
     *
     * @param amount the amount to stake
     * @param user user's address
     */
    function stakeForUser(
        uint256 amount,
        address user
    ) external onlyOwner nonReentrant {
        _stakeTokens(amount, user);
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     */
    function toggleStakingStatus() external onlyOwner {
        _isStakingPaused = !_isStakingPaused;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     *
     * @dev This function is usedf to get the minmu staking amount
     * wth this contract
     *
     * @param amount the amount to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner nonReentrant {
        require(
            this.getWithdrawableAmount() >= amount,
            "TokenStacking: not enought withdrawable"
        );
        IERC20(_tokenAddress).transfer(msg.sender, amount);
    }

    /* end of owner methonding */

    /* begin of user method */

    /**
     * @notice This function is usedf to get the minmu staking amount
     * @param _amount the amount to withdraw
     */
    function stake(uint256 _amount) external nonReentrant {
        _stakeTokens(_amount, msg.sender);
    }

    function _stakeTokens(uint256 _amount, address user_) private {
        require(!_isStakingPaused, "TokenStacking: staking is paused");

        uint256 currentTime = getCurrentTime();

        require(
            currentTime > _stakeStartDate,
            "TokenStacking: staking not started"
        );
        require(currentTime < _stakeEndDate, "TokenStacking: staking ended");
        require(
            _totalStakedTokens + _amount <= _maxStakeTokenLimit,
            "TokenStinking: max staking token limit reached"
        );
        require(_amount > 0, "TokenStinking: stake amount must be non-zero");
        require(
            _amount >= _minimumStakingAmount,
            "TokenStinking: stake amout mustbe greater than minimu amount allowed"
        );

        if (_users[user_].stakeAmount != 0) {
            _calculateReward(user_);
        } else {
            _users[user_].lastRewardCalculationTime = currentTime;
            _totalUsers += 1;
        }

        _users[user_].stakeAmount += _amount;
        _users[user_].lastStakeTime = currentTime;

        _totalStakedTokens += _amount;

        require(
            IERC20(_tokenAddress).transferFrom(
                msg.sender,
                address(this),
                _amount
            ),
            "TokenStacking: failed to transfer tokens"
        );
        emit Stake(user_, _amount);
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     * @param _amount Amount of tokens to be unstaked
     */
    function Unstake(
        uint256 _amount
    ) external nonReentrant whenTreasuryHasBalance(_amount) {
        address user = msg.sender;
        require(_amount != 0, "TokenStaking: amount should be non-zero");
        require(
            this.isStakeHolder(user),
            "TokenStaking: not enough stake to unstake"
        );
        require(
            _users[user].stakeAmount >= _amount,
            "TokenStaking: not enough stake to unstake"
        );

        // calculate  Users' rewards until now
        _calculateReward(user);

        uint256 feeEarlyUnStake;

        if (getCurrentTime() <= _users[user].lastStakeTime + _stakeDays) {
            feeEarlyUnStake = ((_amount * _earlyUnStakeFeePercentage) /
                PERCENTAGE_DENOMINATION);

            emit EarlyUnStakeFee(user, feeEarlyUnStake);
        }

        uint256 amountToUnstake = _amount - feeEarlyUnStake;

        _users[user].stakeAmount = _amount;

        _totalStakedTokens -= _amount;

        if (_users[user].stakeAmount == 0) {
            //delete _users[user];
            _totalUsers -= 1;
        }

        require(
            IERC20(_tokenAddress).transfer(user, amountToUnstake),
            "TokenStaking: fialed to trnaser"
        );

        emit UnStake(user, _amount);
    }

    /**
     * @notice This function is used to claim user's reward
     */

    function claimReward()
        external
        nonReentrant
        whenTreasuryHasBalance(_users[msg.sender].rewardAmount)
    {
        _calculateReward(msg.sender);

        uint256 rewardAmount = _users[msg.sender].rewardAmount;

        require(rewardAmount > 0, "TokenStaking: no reard  to clamin");

        require(
            IERC20(_tokenAddress).transfer(msg.sender, rewardAmount),
            "TokenStaking: failed to transfer"
        );

        _users[msg.sender].rewardAmount = 0;
        _users[msg.sender].rewardsClaimedSoFar += rewardAmount;

        emit ClaimReward(msg.sender, rewardAmount);
    }

    /* end of user methodes */

    /**
     * @notice This function is usedf to get the minmu staking amount
     * @param _user the amount to withdraw
     */
    function _calculateReward(address _user) private {
        (uint256 userReward, uint256 currentTime) = _getUserEstimatedRewards(
            _user
        );

        _users[_user].rewardAmount += userReward;
        _users[_user].lastRewardCalculationTime = currentTime;
    }

    /**
     * @notice This function is usedf to get the minmu staking amount
     * @param _user the amount to withdraw
     * @return
     */
    function _getUserEstimatedRewards(
        address _user
    ) private view returns (uint256, uint256) {
        uint256 userReward;
        uint256 userTimestamp = _users[_user].lastRewardCalculationTime;

        uint256 currentTime = getCurrentTime();

        if (currentTime > _users[_user].lastStakeTime + _stakeDays) {
            currentTime = _users[_user].lastStakeTime + _stakeDays;
        }

        uint256 totalStakeTime = currentTime - userTimestamp;

        userReward +=
            ((totalStakeTime * _users[_user].stakeAmount) * _apyRate) /
            356 days /
            PERCENTAGE_DENOMINATION;

        return (userReward, currentTime);
    }

    function getCurrentTime() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}
