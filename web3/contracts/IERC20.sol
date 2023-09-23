// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.9;

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(
        address indexed ownner,
        address indexed spender,
        uint256 value
    );

    function balanceOf(address account) external view returns (uint256);

    function transfer(address to, uint256 amount) external view returns (bool);

    function allowance(
        address owner,
        address spender
    ) external view returns (bool);

    function approve(
        address spender,
        uint256 amount
    ) external view returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}
