// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract TokenSwap {
    IERC20 public tokenA; // Token users pay with
    IERC20 public tokenB; // Token users receive
    address public owner;
    
    event TokensSwapped(
        address indexed user,
        address indexed tokenPaid,
        address indexed tokenReceived,
        uint256 amount
    );
    
    event TokensDeposited(
        address indexed token,
        uint256 amount
    );
    
    event TokensWithdrawn(
        address indexed token,
        uint256 amount
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0), "Token A address cannot be zero");
        require(_tokenB != address(0), "Token B address cannot be zero");
        require(_tokenA != _tokenB, "Tokens must be different");
        
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        owner = msg.sender;
    }
    
    /**
     * @dev Swap tokens - user pays with tokenA and receives tokenB
     * @param amount The amount of tokens to swap
     */
    function swapTokens(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        
        // Check if user has enough tokenA
        require(tokenA.balanceOf(msg.sender) >= amount, "Insufficient tokenA balance");
        
        // Check if user has approved the contract to spend tokenA
        require(tokenA.allowance(msg.sender, address(this)) >= amount, "Insufficient tokenA allowance");
        
        // Check if contract has enough tokenB to give to user
        require(tokenB.balanceOf(address(this)) >= amount, "Insufficient tokenB in contract");
        
        // Transfer tokenA from user to contract
        require(tokenA.transferFrom(msg.sender, address(this), amount), "TokenA transfer failed");
        
        // Transfer tokenB from contract to user
        require(tokenB.transfer(msg.sender, amount), "TokenB transfer failed");
        
        emit TokensSwapped(msg.sender, address(tokenA), address(tokenB), amount);
    }
    
    /**
     * @dev Get contract balances for both tokens
     */
    function getContractBalances() external view returns (uint256 tokenABalance, uint256 tokenBBalance) {
        tokenABalance = tokenA.balanceOf(address(this));
        tokenBBalance = tokenB.balanceOf(address(this));
    }
    
    /**
     * @dev Owner can deposit tokenB to the contract for swaps
     * @param amount The amount of tokenB to deposit
     */
    function depositTokenB(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(tokenB.balanceOf(msg.sender) >= amount, "Insufficient tokenB balance");
        require(tokenB.allowance(msg.sender, address(this)) >= amount, "Insufficient tokenB allowance");
        
        require(tokenB.transferFrom(msg.sender, address(this), amount), "TokenB deposit failed");
        
        emit TokensDeposited(address(tokenB), amount);
    }
    
    /**
     * @dev Owner can withdraw accumulated tokenA from swaps
     * @param amount The amount of tokenA to withdraw
     */
    function withdrawTokenA(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(tokenA.balanceOf(address(this)) >= amount, "Insufficient tokenA in contract");
        
        require(tokenA.transfer(msg.sender, amount), "TokenA withdrawal failed");
        
        emit TokensWithdrawn(address(tokenA), amount);
    }
    
    /**
     * @dev Owner can withdraw tokenB if needed
     * @param amount The amount of tokenB to withdraw
     */
    function withdrawTokenB(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(tokenB.balanceOf(address(this)) >= amount, "Insufficient tokenB in contract");
        
        require(tokenB.transfer(msg.sender, amount), "TokenB withdrawal failed");
        
        emit TokensWithdrawn(address(tokenB), amount);
    }
    
    /**
     * @dev Emergency function to withdraw all tokens (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 tokenABalance = tokenA.balanceOf(address(this));
        uint256 tokenBBalance = tokenB.balanceOf(address(this));
        
        if (tokenABalance > 0) {
            require(tokenA.transfer(msg.sender, tokenABalance), "Emergency TokenA withdrawal failed");
        }
        
        if (tokenBBalance > 0) {
            require(tokenB.transfer(msg.sender, tokenBBalance), "Emergency TokenB withdrawal failed");
        }
    }
    
    /**
     * @dev Transfer ownership to a new owner
     * @param newOwner The address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}