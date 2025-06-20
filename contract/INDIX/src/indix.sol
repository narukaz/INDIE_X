// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

contract INDIX is Ownable {
    constructor() Ownable(msg.sender) {}

    enum Role {
        NONE,
        PLAYER,
        DEVELOPER
    }

    mapping(address => Role) public roles; //storing user type in my contract

    IERC20 public nativeToken;
    uint256 public dev_vault_amount;

    // STARTING OFF CHAIN RELATED CODE
    struct Gamer {
        string ipfsHash;
    }

    mapping(address => Gamer) public gamers; // storing users data in it
    //ENDING OFF CHAIN RELATED CODE
    struct Game {
    string name;
    address nftContract;
    string metadataIPFS; // e.g. logo, description, genre
    address[] itemNFTs; // child NFTs like skins/assets
    uint256 createdAt;
}

    struct Dev {
        bool isActive;
        uint256 lockedAmount;
        uint256[] GameIDs;
    }

    mapping(address => Dev) public devs;
    mapping(address => uint256) public dev_locked_amount;

    function changeLockAmount(uint256 _lockAmount) public onlyOwner {
        require(_lockAmount > 0, "lock amount cannot be Zero!");
        dev_vault_amount = _lockAmount * 10e18;
    }

    function registerAsGamer() public {
        require(
            dev_locked_amount[msg.sender] == 0,
            "your account is registerd as a developer, please empty your vault!"
        );
        delete devs[msg.sender];
        roles[msg.sender] = Role.PLAYER
    }

    function registerAsDeveloper() public {
        require(
            roles[msg.sender] != Role.DEVELOPER,
            "Address is already resgisterd!"
        );
        require(dev_locked_amount[msg.sender] == 0, "Vault already funded");
        nativeToken.transferFrom(msg.sender, address(this), dev_vault_amount);

        dev_locked_amount[msg.sender] = dev_vault_amount;
        roles[msg.sender] = Role.DEVELOPER;
    }
}
