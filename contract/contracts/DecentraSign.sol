// SPDX-License-Identifier: MIT
pragma solidity >=0.8.16;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @custom:security-contact abhirambsn@gmail.com
contract DecentraSign is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    struct SignedDocument {
        string name;
        address signer;
        bytes documentHash;
        uint256 tokenId;
        string uri;
        bool isValid;
        string signature;
        uint signedAt;
    }

    struct User {
        address _addr;
        string name;
        string email;
        uint256 signedDocuments;
        uint256 quota;
        bool isValid;
        uint lastPaymentTime;
    }

    struct VerificationResponse {
        SignedDocument doc;
        bool isVerified;
    }

    mapping(address => SignedDocument[]) documents;
    mapping(address => User) users;
    mapping(bytes => SignedDocument) signed;
    address[] userLUT;

    event DocumentSigned(address signer, bytes documentHash, uint256 timestamp);

    modifier _onlyUser() {
        require(users[msg.sender].isValid);
        _;
    }

    modifier checkForTime() {
        require(
            block.timestamp - users[msg.sender].lastPaymentTime <= 30 days,
            "Kindly pay before signing more docs"
        );
        _;
    }


    function transferToOwner() external onlyOwner {
        payable(this.owner()).transfer(address(this).balance);
    }

    function createUser(string memory _name, string memory _email) external {
        users[msg.sender] = User(
            msg.sender,
            _name,
            _email,
            0,
            0,
            true,
            block.timestamp
        );
        userLUT.push(msg.sender);
    }

    function getUser() external view _onlyUser returns (User memory) {
        return users[msg.sender];
    }

    function resetUsageCount() internal _onlyUser {
        users[msg.sender].quota = 0;
    }

    function payForUsage() external payable _onlyUser {
        uint value = 0.001 ether * users[msg.sender].quota;
        require(msg.value == value);
        users[msg.sender].lastPaymentTime = block.timestamp;
        resetUsageCount();
    }

    function aggregateAllDocuments()
        internal
        view
        returns (SignedDocument[] memory)
    {
        SignedDocument[] memory allDocuments;
        uint256 k = 0;
        for (uint256 i = 0; i < userLUT.length; i++) {
            SignedDocument[] memory puData = documents[userLUT[i]];
            for (uint256 j = 0; j < puData.length; j++) {
                allDocuments[k] = puData[j];
                k++;
            }
        }
        return allDocuments;
    }

    function aggregateDocumentsByUser()
        external
        view
        _onlyUser
        returns (SignedDocument[] memory)
    {
        return documents[msg.sender];
    }

    function selfReportUsage(address _addr) internal {
        users[_addr].signedDocuments++;
        users[_addr].quota++;
        require(users[_addr].signedDocuments == documents[_addr].length);
    }

    function convertToString(
        bytes memory _bytes
    ) external pure returns (string memory) {
        return string(_bytes);
    }

    function signDocument(
        string memory _name,
        string memory _documentHash,
        string memory _uri,
        string memory _signature
    ) external _onlyUser checkForTime {
        bytes memory bytesDocumentHash = bytes(_documentHash);
        SignedDocument memory sd = SignedDocument(
            _name,
            msg.sender,
            bytesDocumentHash,
            _tokenIdCounter.current(),
            _uri,
            true,
            _signature,
            block.timestamp
        );
        documents[msg.sender].push(sd);

        signed[bytesDocumentHash] = sd;
        selfReportUsage(msg.sender);
        safeMint(msg.sender, _uri);
        emit DocumentSigned(msg.sender, bytesDocumentHash, block.timestamp);
    }

    function getDocumentByHash(
        bytes memory _hash
    ) external view _onlyUser returns (SignedDocument memory) {
        return signed[_hash];
    }

    function getUsage() external view _onlyUser returns (uint[2] memory) {
        uint value = 0.001 ether * users[msg.sender].signedDocuments;
        return [users[msg.sender].signedDocuments, value];
    }

    function verifyDocumentSignature(
        string memory _sentHash
    ) external view returns (VerificationResponse memory) {
        bytes memory calculatedHash = bytes(_sentHash);
        SignedDocument memory sd = signed[calculatedHash];
        if (!sd.isValid) {
            return VerificationResponse(sd, false);
        }
        return VerificationResponse(sd, true);
    }

    constructor() ERC721("DecentraSign", "DCS") {}

    function safeMint(address to, string memory uri) public _onlyUser {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // The following functions are overrides required by Solidity.

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
