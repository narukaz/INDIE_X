// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Game_instance.sol";

contract MasterContract is VRFConsumerBaseV2Plus {
    LinkTokenInterface public LINKTOKEN;
    address public vrfCoordinatorV2Plus =
        0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B;
    address public link_token_contract =
        0x779877A7B0D9E8603169DdbD7836e478b4624789;
    bytes32 public keyHash =
        0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae;
    uint32 public callbackGasLimit = 100000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 2;
    uint256[] public s_randomWords;
    uint256 public s_requestId;
    uint256 public s_subscriptionId;
    address[] public allGames;

    mapping(address => address[]) public gamesByUser;
    mapping(address => mapping(address => uint256)) private userGameIndex;
    mapping(address => bool) public isGameInstance;
    mapping(address => address[]) public deployed_games;

    event GameDeployed(address indexed gameAddress, address indexed owner);

    constructor() VRFConsumerBaseV2Plus(vrfCoordinatorV2Plus) {
        s_vrfCoordinator = IVRFCoordinatorV2Plus(vrfCoordinatorV2Plus);
        LINKTOKEN = LinkTokenInterface(link_token_contract);

        _createNewSubscription();
    }

    /**
     * @notice (UNCHANGED) Deploys a new game instance and adds it as a VRF consumer.
     */
    function deployGame(
        string memory title,
        GAMEINSTANCE.GAMETYPE[] memory genres,
        uint256 copies,
        uint256 _price
    ) external returns (address) {
        GAMEINSTANCE game = new GAMEINSTANCE(
            title,
            genres,
            copies,
            address(this),
            _price
        );
        this.addConsumer(address(game));
        allGames.push(address(game));
        deployed_games[tx.origin].push(address(game));
        _trackGameInstance(address(game));

        emit GameDeployed(address(game), msg.sender);
        return address(game);
    }

    function getSubscriptionId() external view returns (uint256) {
        return s_subscriptionId;
    }
    function getMyDeployedGames() external view returns (address[] memory) {
        return deployed_games[msg.sender];
    }
    // --- The rest of the functions remain largely the same ---

    function registerOwnership() external {
        require(isGameInstance[msg.sender], "false");
        address user = tx.origin;
        address game = msg.sender;
        if (userGameIndex[user][game] == 0) {
            gamesByUser[user].push(game);
            userGameIndex[user][game] = gamesByUser[user].length;
        }
    }

    function _trackGameInstance(address gameAddr) internal {
        isGameInstance[gameAddr] = true;
    }

    function getMyGames() external view returns (address[] memory) {
        return gamesByUser[msg.sender];
    }

    function requestRandomWords() external onlyOwner {
        s_requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({nativePayment: false})
                )
            })
        );
    }

    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] calldata randomWords
    ) internal override {
        s_randomWords = randomWords;
    }

    function _createNewSubscription() internal {
        s_subscriptionId = s_vrfCoordinator.createSubscription();
        s_vrfCoordinator.addConsumer(s_subscriptionId, address(this));
    }

    function topUpSubscription(uint256 amount) external onlyOwner {
        LINKTOKEN.transferAndCall(
            address(s_vrfCoordinator),
            amount,
            abi.encode(s_subscriptionId)
        );
    }

    function addConsumer(address consumerAddress) external {
        s_vrfCoordinator.addConsumer(s_subscriptionId, consumerAddress);
    }

    function removeConsumer(address consumerAddress) external onlyOwner {
        s_vrfCoordinator.removeConsumer(s_subscriptionId, consumerAddress);
    }

    function cancelSubscription(address receivingWallet) external onlyOwner {
        s_vrfCoordinator.cancelSubscription(s_subscriptionId, receivingWallet);
        s_subscriptionId = 0;
    }

    function withdraw(uint256 amount, address to) external onlyOwner {
        LINKTOKEN.transfer(to, amount);
    }
}
