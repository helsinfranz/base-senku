// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FluoriteToken is ERC20, Ownable {
    address public gameController;

    constructor(
        address initialOwner
    ) ERC20("Fluorite", "FLUOR") Ownable(initialOwner) {
        gameController = msg.sender;
        _mint(initialOwner, 1_000_000_000 * 10 ** decimals());
    }

    modifier onlyGame() {
        require(
            msg.sender == gameController,
            "Only game controller can call this"
        );
        _;
    }

    function setGameController(address _gameController) external onlyOwner {
        gameController = _gameController;
    }

    function mint(address to, uint256 amount) external onlyGame {
        _mint(to, amount);
    }

    function burnFrom(address from, uint256 amount) external onlyGame {
        _burn(from, amount);
    }
}
