// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YARDEX is Ownable {

    IERC20 public yarToken;
    uint256 public conversionRate = 2;

    constructor(address _yarToken) Ownable(msg.sender) {
        yarToken = IERC20(_yarToken);
    }

    function convertYARtoUSD(uint256 amount) public {
        require(amount > 0, "Invalid amount");

        require(
            yarToken.balanceOf(msg.sender) >= amount,
            "Insufficient balance"
        );

        require(
            yarToken.allowance(msg.sender, address(this)) >= amount,
            "Insufficient allowance"
        );

        require(
            yarToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        emit Converted(msg.sender, amount, amount / conversionRate);
    }

    function withdrawYAR(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "Invalid address");

        require(
            yarToken.transfer(to, amount),
            "Withdraw failed"
        );

        emit Withdraw(to, amount);
    }

    event Converted(address user, uint256 yarAmount, uint256 usdValue);
    event Withdraw(address to, uint256 amount);
}
