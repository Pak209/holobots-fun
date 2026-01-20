// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title HolobotPublicMint
 * @dev Simple ERC721 contract where anyone can mint 1 Holobot for free
 */
contract HolobotPublicMint is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    uint256 public constant MAX_SUPPLY = 10000;
    uint256 public constant MAX_PER_WALLET = 5;
    
    string private _baseTokenURI;
    
    // Track mints per wallet
    mapping(address => uint256) public mintedPerWallet;
    
    event HolobotMinted(address indexed to, uint256 indexed tokenId);

    constructor(
        string memory baseURI
    ) ERC721("Holobot", "HBOT") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
        _tokenIdCounter = 1; // Start at 1
    }

    /**
     * @dev Public mint function - anyone can mint up to MAX_PER_WALLET
     */
    function publicMint() external {
        require(_tokenIdCounter <= MAX_SUPPLY, "Max supply reached");
        require(mintedPerWallet[msg.sender] < MAX_PER_WALLET, "Max mints per wallet reached");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        mintedPerWallet[msg.sender]++;
        
        _safeMint(msg.sender, tokenId);
        
        emit HolobotMinted(msg.sender, tokenId);
    }

    /**
     * @dev Mint function with quantity
     */
    function mint(uint256 quantity) external {
        require(_tokenIdCounter + quantity - 1 <= MAX_SUPPLY, "Exceeds max supply");
        require(mintedPerWallet[msg.sender] + quantity <= MAX_PER_WALLET, "Exceeds max per wallet");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            mintedPerWallet[msg.sender]++;
            
            _safeMint(msg.sender, tokenId);
            emit HolobotMinted(msg.sender, tokenId);
        }
    }

    /**
     * @dev Free mint - alias for publicMint for compatibility
     */
    function freeMint() external {
        require(_tokenIdCounter <= MAX_SUPPLY, "Max supply reached");
        require(mintedPerWallet[msg.sender] < MAX_PER_WALLET, "Max mints per wallet reached");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        mintedPerWallet[msg.sender]++;
        
        _safeMint(msg.sender, tokenId);
        
        emit HolobotMinted(msg.sender, tokenId);
    }

    /**
     * @dev Owner can mint to specific address (for rewards, giveaways, etc)
     */
    function ownerMint(address to, uint256 quantity) external onlyOwner {
        require(_tokenIdCounter + quantity - 1 <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            
            _safeMint(to, tokenId);
            emit HolobotMinted(to, tokenId);
        }
    }

    /**
     * @dev Set base URI for metadata
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Get token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        return bytes(_baseTokenURI).length > 0
            ? string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"))
            : "";
    }

    /**
     * @dev Get total supply
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    /**
     * @dev Get base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
