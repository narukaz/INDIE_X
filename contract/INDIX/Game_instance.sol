// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// --- Imports ---
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {IVRFCoordinatorV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

// --- Interfaces ---
interface IMasterContract {
    function registerOwnership() external;
    function getSubscriptionId() external view returns (uint256);
}
interface AutomationRegistrarInterface {
    function registerUpkeep(
        RegistrationParams calldata requestParams
    ) external returns (uint256);
}

// --- Structs ---
struct RegistrationParams {
    string name;
    bytes encryptedEmail;
    address upkeepContract;
    uint32 gasLimit;
    address adminAddress;
    uint8 triggerType;
    bytes checkData;
    bytes triggerConfig;
    bytes offchainConfig;
    uint96 amount;
}

contract GAMEINSTANCE is AutomationCompatibleInterface, VRFConsumerBaseV2Plus {
    // --- State Variables ---
    AggregatorV3Interface internal dataFeed =
        AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    address public immutable AUTOMATION_REGISTRAR_ADDRESS;
    address public immutable LINK_TOKEN_ADDRESS;
    LinkTokenInterface public immutable i_link;
    AutomationRegistrarInterface public immutable i_registrar;
    uint96 public minFundingAmount = 1 ether; // 0.6 LINK
    mapping(uint256 => uint256) public tokenIdToUpkeepId;
    string public game;
    address private masterContract;
    address public instance_owner;
    uint256 public totalCopies;
    uint256 public soldCopies;
    uint256 public gamePrice;
    uint256 public _nextTokenId = 0;
    mapping(address => bool) public gameOwnership;
    mapping(address => uint256) public pendingWithdrawals;
    mapping(uint256 => string) public tokenCIDs;
    mapping(uint256 => address) public skinOwner;
    mapping(uint256 => SKINTYPE) public skinType;
    mapping(uint256 => Rental) public rentals;
    mapping(uint256 => RentalRequest[]) public rentalRequests;
    mapping(address => uint256[]) public mySkins;
    mapping(uint256 => Skin) public skinDetails;
    mapping(address => RentalRequestInfo[]) public userPendingRentalRequests;
    IVRFCoordinatorV2Plus public immutable i_vrfCoordinator;
    uint256 public s_subscriptionId;
    bytes32 public s_keyHash;
    mapping(uint256 => address) public s_pendingRequests;
    uint256[] public lootBoxSkins;
    uint256 public lootBoxPrice = 0.0005 ether;

    // State variables to track tokens with rental requests
    uint256[] public tokensWithRentalRequests;
    mapping(uint256 => uint256) private tokenRequestListIndex;
    mapping(uint256 => bool) private hasActiveRequests;
    struct CompleteNftDetails {
        uint256 tokenId;
        string cid;
        string gameCid;
        uint256 price;
        SKINTYPE skinType;
        address currentOwner;
        address instanceOwner; // <-- ADD THIS LINE
        bool isRentalActive;
        uint256 rentalRequestCount;
    }

    // --- Enums & Structs ---
    enum GAMETYPE {
        ACTION,
        RACING,
        SURVIVAL,
        STRATEGY
    }
    GAMETYPE[] public genres;
    enum SKINTYPE {
        COMMON,
        RARE,
        LEGENDARY
    }
    struct Skin {
        SKINTYPE skinType;
        uint256 price;
        bool isForSale;
    }
    struct Rental {
        address originalOwner;
        address renter;
        uint256 startTime;
        uint256 duration;
        bool isActive;
    }
    struct RentalRequest {
        address requester;
        uint256 price;
        uint256 duration;
    }
    struct RentalRequestInfo {
        uint256 tokenId;
        uint256 requestIndex;
    }

    // --- EVENTS ---

    // event SkinSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event UpkeepRegisteredForRental(
        uint256 indexed tokenId,
        uint256 indexed upkeepId
    );
    event RentalRequested(
        uint256 indexed tokenId,
        address indexed requester,
        uint256 price,
        uint256 duration
    );
    // event LootBoxOpened(uint256 indexed requestId, address indexed player);
    // event LootBoxReward(uint256 indexed requestId, address indexed player, uint256 indexed prizeTokenId);
    // event SkinMinted(uint256 indexed tokenId, address indexed owner, SKINTYPE skinType, uint256 price);
    // event TokenCIDUpdated(uint256 indexed tokenId, address indexed updatedBy, string newCid);
    // event SkinDelisted(uint256 indexed tokenId, address indexed owner);
    // event SkinsAddedToLootBox(address indexed owner, uint256[] tokenIds);
    // event LootBoxFundsWithdrawn(address indexed owner, uint256 amount);
    event RentalStarted(
        uint256 indexed tokenId,
        address indexed originalOwner,
        address indexed renter,
        uint256 endTime
    );
    event RentalEnded(
        uint256 indexed tokenId,
        address indexed originalOwner,
        address indexed renter
    );
    event RentalRequestRefunded(
        uint256 indexed tokenId,
        address indexed requester,
        uint256 amount
    );
    // event GameOwnershipRegistered(address indexed buyer, address indexed game);
    // event FundsWithdrawn(address indexed user, uint256 amount);

    constructor(
        string memory title,
        GAMETYPE[] memory _genres,
        uint256 copies,
        address _masterContract,
        uint256 _price
    ) VRFConsumerBaseV2Plus(0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B) {
        game = title;
        genres = _genres;
        totalCopies = copies;
        masterContract = _masterContract;
        instance_owner = tx.origin;
        LINK_TOKEN_ADDRESS = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
        AUTOMATION_REGISTRAR_ADDRESS = 0xb0E49c5D0d05cbc241d68c05BC5BA1d1B7B72976;
        i_link = LinkTokenInterface(LINK_TOKEN_ADDRESS);
        i_registrar = AutomationRegistrarInterface(
            AUTOMATION_REGISTRAR_ADDRESS
        );
        i_vrfCoordinator = IVRFCoordinatorV2Plus(
            0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B
        );
        s_keyHash = 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
        s_subscriptionId = IMasterContract(_masterContract).getSubscriptionId();
        gamePrice = _price;
    }

    // --- Direct Minting and Updating Functions ---
    function mintSkin(
        SKINTYPE _type,
        uint256 price,
        string memory cid
    ) external {
        require(msg.sender == instance_owner, "Only instance_owner can mint");
        require(price > 0, "Price must be greater than zero");

        uint256 tokenId = _nextTokenId++;
        skinOwner[tokenId] = instance_owner;
        skinType[tokenId] = _type;
        tokenCIDs[tokenId] = cid;
        skinDetails[tokenId] = Skin(_type, price, true);
        _addSkinToOwner(instance_owner, tokenId);
    }

    function addSkinsToLootBox(uint256[] calldata tokenIds) external {
        require(msg.sender == instance_owner, "not owner");
        for (uint i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(skinOwner[tokenId] == msg.sender, "not owner");
            lootBoxSkins.push(tokenId);
        }
    }

    function openLootBox() external payable {
        require(msg.value == lootBoxPrice, "Incorrect payment amount");
        require(lootBoxSkins.length > 0, "Loot box is currently empty");
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: s_keyHash,
                subId: s_subscriptionId,
                requestConfirmations: 3,
                callbackGasLimit: 200000,
                numWords: 1,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
        s_pendingRequests[requestId] = msg.sender;
        // emit LootBoxOpened(requestId, msg.sender);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] calldata randomWords
    ) internal override {
        address player = s_pendingRequests[requestId];
        require(player != address(0), "not present");
        delete s_pendingRequests[requestId];
        uint256 totalSkins = lootBoxSkins.length;
        require(totalSkins > 0, "false ");
        uint256 randomIndex = randomWords[0] % totalSkins;
        uint256 prizeTokenId = lootBoxSkins[randomIndex];
        lootBoxSkins[randomIndex] = lootBoxSkins[totalSkins - 1];
        lootBoxSkins.pop();
        skinOwner[prizeTokenId] = player;
        _addSkinToOwner(player, prizeTokenId);
        // emit LootBoxReward(requestId, player, prizeTokenId);
    }

    function withdrawLootBoxFunds() external {
        require(msg.sender == instance_owner, "not owner");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = payable(instance_owner).call{value: balance}("");
        require(success, "failed");
        // emit LootBoxFundsWithdrawn(msg.sender, balance);
    }

    // --- AUTOMATION & RENTAL FUNCTIONS ---
    function checkUpkeep(
        bytes calldata checkData
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint256 tokenId = abi.decode(checkData, (uint256));
        Rental memory rental = rentals[tokenId];
        upkeepNeeded =
            rental.isActive &&
            (block.timestamp >= (rental.startTime + rental.duration));
        performData = checkData;
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256 tokenId = abi.decode(performData, (uint256));
        if (rentals[tokenId].isActive) {
            endRental(tokenId);
        }
    }

    function approveRegistrar(uint96 amount) external {
        require(msg.sender == instance_owner, "not owner");
        i_link.approve(address(i_registrar), amount);
    }

    function _registerUpkeep(uint256 tokenId) private returns (uint256) {
        require(
            i_link.balanceOf(address(this)) >= minFundingAmount,
            "low balance"
        );

        string memory upkeepName = string.concat(
            "Perfecto-",
            uint256ToString(tokenId)
        );
        bytes memory checkData = abi.encode(tokenId);
        RegistrationParams memory params = RegistrationParams({
            name: upkeepName,
            encryptedEmail: "0x",
            upkeepContract: address(this),
            gasLimit: 500000,
            adminAddress: instance_owner,
            triggerType: 0,
            checkData: checkData,
            triggerConfig: "0x",
            offchainConfig: "0x",
            amount: minFundingAmount
        });
        uint256 upkeepId = i_registrar.registerUpkeep(params);
        tokenIdToUpkeepId[tokenId] = upkeepId;
        emit UpkeepRegisteredForRental(tokenId, upkeepId);
        return upkeepId;
    }

    // In your GAMEINSTANCE contract

    function approveRequest(uint256 tokenId, uint256 idx) external {
        // --- NEW LINE ---
        // Check if the token is already in an active rental period.
        require(!rentals[tokenId].isActive, "Token is already rented out");

        require(skinOwner[tokenId] == msg.sender, "not owner");
        require(idx < rentalRequests[tokenId].length, "false");

        RentalRequest memory reqToApprove = rentalRequests[tokenId][idx];
        address requester = reqToApprove.requester;
        uint256 rentalDuration = reqToApprove.duration;

        _removeUserPendingRequest(requester, tokenId, idx);

        uint256 lastIndex = rentalRequests[tokenId].length - 1;
        if (idx != lastIndex) {
            RentalRequest memory lastReq = rentalRequests[tokenId][lastIndex];
            rentalRequests[tokenId][idx] = lastReq;
            _updateUserPendingRequestIndex(
                lastReq.requester,
                tokenId,
                lastIndex,
                idx
            );
        }
        rentalRequests[tokenId].pop();

        if (rentalRequests[tokenId].length == 0) {
            _removeTokenFromRequestList(tokenId);
        }

        _removeSkinFromOwner(msg.sender, tokenId);
        _addSkinToOwner(requester, tokenId);

        // Set the new rental details
        rentals[tokenId] = Rental(
            msg.sender,
            requester,
            block.timestamp,
            rentalDuration,
            true
        );
        skinOwner[tokenId] = requester;

        _registerUpkeep(tokenId);

        uint256 total = reqToApprove.price;
        uint256 ownerShare = (total * 3) / 100;
        uint256 masterShare = (total * 2) / 100;

        pendingWithdrawals[msg.sender] += ownerShare;
        pendingWithdrawals[masterContract] += masterShare;

        emit RentalStarted(
            tokenId,
            msg.sender,
            requester,
            block.timestamp + rentalDuration
        );
    }

    function endRental(uint256 tokenId) public {
        Rental storage r = rentals[tokenId];
        require(r.isActive, "not active");
        require(block.timestamp >= r.startTime + r.duration, "too early");
        address currentRenter = skinOwner[tokenId];
        address originalOwner = r.originalOwner;
        r.isActive = false;
        skinOwner[tokenId] = originalOwner;
        _removeSkinFromOwner(currentRenter, tokenId);
        _addSkinToOwner(originalOwner, tokenId);
        delete tokenIdToUpkeepId[tokenId];
        emit RentalEnded(tokenId, originalOwner, currentRenter);
    }

    function refundRequest(uint256 tokenId, uint256 idx) external {
        require(idx < rentalRequests[tokenId].length, "Index out of bounds");
        RentalRequest memory reqToRefund = rentalRequests[tokenId][idx];
        require(reqToRefund.requester == msg.sender, "not requester");
        _removeUserPendingRequest(msg.sender, tokenId, idx);
        uint256 lastIndex = rentalRequests[tokenId].length - 1;
        if (idx != lastIndex) {
            RentalRequest memory lastReq = rentalRequests[tokenId][lastIndex];
            rentalRequests[tokenId][idx] = lastReq;
            _updateUserPendingRequestIndex(
                lastReq.requester,
                tokenId,
                lastIndex,
                idx
            );
        }
        rentalRequests[tokenId].pop();

        if (rentalRequests[tokenId].length == 0) {
            _removeTokenFromRequestList(tokenId);
        }

        pendingWithdrawals[msg.sender] += reqToRefund.price;
        emit RentalRequestRefunded(tokenId, msg.sender, reqToRefund.price);
    }

    function buySkin(uint256 tokenId) external payable {
        require(skinDetails[tokenId].isForSale, "false");
        address seller = skinOwner[tokenId];
        uint256 price = skinDetails[tokenId].price;
        require(msg.sender != seller, "false");
        require(msg.value == price, "wrong");
        _removeSkinFromOwner(seller, tokenId);
        _addSkinToOwner(msg.sender, tokenId);
        skinOwner[tokenId] = msg.sender;
        skinDetails[tokenId].isForSale = false;
        pendingWithdrawals[seller] += msg.value;
        // emit SkinSold(tokenId, seller, msg.sender, price);
    }

    function buygame() external payable {
        require(msg.value == gamePrice, "wrong amount");
        require(soldCopies < totalCopies, "out of stock");
        gameOwnership[msg.sender] = true;
        soldCopies++;
        IMasterContract(masterContract).registerOwnership();
        // emit GameOwnershipRegistered(msg.sender, address(this));
    }

    function requestRent(
        uint256 tokenId,
        uint256 durationSec
    ) external payable {
        require(skinOwner[tokenId] != address(0), "false");
        require(msg.value > 0, "lock some wei");

        if (rentalRequests[tokenId].length == 0) {
            _addTokenToRequestList(tokenId);
        }

        uint256 newRequestIndex = rentalRequests[tokenId].length;
        rentalRequests[tokenId].push(
            RentalRequest(msg.sender, msg.value, durationSec)
        );
        userPendingRentalRequests[msg.sender].push(
            RentalRequestInfo(tokenId, newRequestIndex)
        );
        emit RentalRequested(tokenId, msg.sender, msg.value, durationSec);
    }

    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "no funds");
        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        // emit FundsWithdrawn(msg.sender, amount);
    }

    // --- HELPER & VIEW FUNCTIONS ---
    function uint256ToString(
        uint256 value
    ) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    function _addTokenToRequestList(uint256 tokenId) private {
        if (!hasActiveRequests[tokenId]) {
            hasActiveRequests[tokenId] = true;
            tokensWithRentalRequests.push(tokenId);
            tokenRequestListIndex[tokenId] =
                tokensWithRentalRequests.length -
                1;
        }
    }
    function _removeTokenFromRequestList(uint256 tokenId) private {
        if (!hasActiveRequests[tokenId]) return;
        uint256 indexToRemove = tokenRequestListIndex[tokenId];
        uint256 lastIndex = tokensWithRentalRequests.length - 1;
        if (indexToRemove != lastIndex) {
            uint256 lastTokenId = tokensWithRentalRequests[lastIndex];
            tokensWithRentalRequests[indexToRemove] = lastTokenId;
            tokenRequestListIndex[lastTokenId] = indexToRemove;
        }
        tokensWithRentalRequests.pop();
        delete hasActiveRequests[tokenId];
        delete tokenRequestListIndex[tokenId];
    }
    function _addSkinToOwner(address _owner, uint256 tokenId) private {
        mySkins[_owner].push(tokenId);
    }
    function _removeSkinFromOwner(address _owner, uint256 tokenId) private {
        uint256[] storage tokenIds = mySkins[_owner];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == tokenId) {
                tokenIds[i] = tokenIds[tokenIds.length - 1];
                tokenIds.pop();
                break;
            }
        }
    }
    function _removeUserPendingRequest(
        address requester,
        uint256 tokenId,
        uint256 requestIndex
    ) private {
        RentalRequestInfo[] storage pendingRequests = userPendingRentalRequests[
            requester
        ];
        for (uint i = 0; i < pendingRequests.length; i++) {
            if (
                pendingRequests[i].tokenId == tokenId &&
                pendingRequests[i].requestIndex == requestIndex
            ) {
                pendingRequests[i] = pendingRequests[
                    pendingRequests.length - 1
                ];
                pendingRequests.pop();
                break;
            }
        }
    }
    function _updateUserPendingRequestIndex(
        address requester,
        uint256 tokenId,
        uint256 oldIndex,
        uint256 newIndex
    ) private {
        RentalRequestInfo[] storage pendingRequests = userPendingRentalRequests[
            requester
        ];
        for (uint i = 0; i < pendingRequests.length; i++) {
            if (
                pendingRequests[i].tokenId == tokenId &&
                pendingRequests[i].requestIndex == oldIndex
            ) {
                pendingRequests[i].requestIndex = newIndex;
                break;
            }
        }
    }
    // function getMySkins() external view returns (uint256[] memory) { return mySkins[msg.sender]; }
    // function getSkinType(uint256 tokenId) external view returns (SKINTYPE) { require(skinOwner[tokenId] != address(0), "Token does not exist"); return skinType[tokenId]; }
    function getMyPendingRentalRequests()
        external
        view
        returns (RentalRequestInfo[] memory)
    {
        return userPendingRentalRequests[msg.sender];
    }
    function getRentalRequests(
        uint256 tokenId
    ) external view returns (RentalRequest[] memory) {
        require(skinOwner[tokenId] != address(0), "fasle");
        return rentalRequests[tokenId];
    }
    function getMyRequestIndicesForToken(
        uint256 tokenId
    ) external view returns (uint256[] memory) {
        RentalRequestInfo[] memory pendingRequests = userPendingRentalRequests[
            msg.sender
        ];
        uint256 count = 0;
        for (uint i = 0; i < pendingRequests.length; i++) {
            if (pendingRequests[i].tokenId == tokenId) {
                count++;
            }
        }
        if (count == 0) {
            return new uint256[](0);
        }
        uint256[] memory indices = new uint256[](count);
        uint256 currentIndex = 0;
        for (uint i = 0; i < pendingRequests.length; i++) {
            if (pendingRequests[i].tokenId == tokenId) {
                indices[currentIndex] = pendingRequests[i].requestIndex;
                currentIndex++;
            }
        }
        return indices;
    }
    function getAllTokensWithRentalRequests()
        external
        view
        returns (uint256[] memory)
    {
        return tokensWithRentalRequests;
    }
    function isRentalActive(uint256 tokenId) public view returns (bool) {
        Rental memory r = rentals[tokenId];
        return r.isActive && block.timestamp <= r.startTime + r.duration;
    }
    // function tokenURI(uint256 tokenId) external view returns (string memory) { require(skinOwner[tokenId] != address(0), "Token does not exist"); return tokenCIDs[tokenId]; }
    function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
        (, int256 answer, , , ) = dataFeed.latestRoundData();
        return answer;
    }
    function weiToUsd(
        uint256 weiAmount
    ) public view returns (uint256 dollars, uint256 cents) {
        int256 rawPrice = getChainlinkDataFeedLatestAnswer();
        require(rawPrice > 0, "invalid price");
        uint256 price = uint256(rawPrice);
        uint256 product = weiAmount * price;
        dollars = product / 1e26;
        uint256 remainder = product % 1e26;
        cents = remainder / 1e24;
    }
    function getGameCid() public view returns (string memory) {
        return game;
    }
    function getsoldcopies() public view returns (uint256) {
        return soldCopies;
    }

    function gettotalmintednfts() public view returns (uint256) {
        return _nextTokenId;
    }

    function getAllNftDetails()
        external
        view
        returns (CompleteNftDetails[] memory)
    {
        uint256 totalMinted = _nextTokenId - 1;
        if (totalMinted == 0) {
            return new CompleteNftDetails[](0);
        }

        CompleteNftDetails[] memory allDetails = new CompleteNftDetails[](
            totalMinted
        );
        string memory gameName = game;

        for (uint256 i = 0; i < totalMinted; i++) {
            uint256 currentTokenId = i + 1;

            Skin memory details = skinDetails[currentTokenId];
            Rental memory currentRental = rentals[currentTokenId];

            allDetails[i] = CompleteNftDetails({
                tokenId: currentTokenId,
                cid: tokenCIDs[currentTokenId],
                gameCid: gameName,
                price: details.price,
                skinType: details.skinType,
                instanceOwner: instance_owner,
                currentOwner: skinOwner[currentTokenId],
                isRentalActive: currentRental.isActive &&
                    (block.timestamp <=
                        currentRental.startTime + currentRental.duration),
                rentalRequestCount: rentalRequests[currentTokenId].length
            });
        }

        return allDetails;
    }

    //     function getMyInventoryDetails() external view returns (CompleteNftDetails[] memory) {
    //     // Get the array of token IDs owned by the person calling this function
    //     uint256[] storage ownedTokenIds = mySkins[msg.sender];
    //     uint256 numOwned = ownedTokenIds.length;

    //     if (numOwned == 0) {
    //         return new CompleteNftDetails[](0);
    //     }

    //     CompleteNftDetails[] memory inventoryDetails = new CompleteNftDetails[](numOwned);
    //     string memory gameName = game;

    //     // Loop through only the tokens the user owns
    //     for (uint256 i = 0; i < numOwned; i++) {
    //         uint256 currentTokenId = ownedTokenIds[i];

    //         Skin memory details = skinDetails[currentTokenId];
    //         Rental memory currentRental = rentals[currentTokenId];

    //         inventoryDetails[i] = CompleteNftDetails({
    //             tokenId: currentTokenId,
    //             cid: tokenCIDs[currentTokenId],
    //             gameCid: gameName,
    //               instanceOwner:instance_owner ,
    //             price: details.price,
    //             skinType: details.skinType,
    //             currentOwner: skinOwner[currentTokenId], // This will be msg.sender
    //             isRentalActive: currentRental.isActive && (block.timestamp <= currentRental.startTime + currentRental.duration),
    //             rentalRequestCount: rentalRequests[currentTokenId].length
    //         });
    //     }

    //     return inventoryDetails;
    // }
    function getRentalTimeDetails(
        uint256 tokenId
    )
        external
        view
        returns (uint256 startTime, uint256 duration, bool isActive)
    {
        Rental storage rental = rentals[tokenId];
        return (rental.startTime, rental.duration, rental.isActive);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
