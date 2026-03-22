// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YARNFT is ERC721, Ownable {

    uint256 public nextTokenId;

    constructor() 
        ERC721("YAR NFT", "YARNFT") 
        Ownable(msg.sender)
    {}

    function mint(address student) public onlyOwner {
        _safeMint(student, nextTokenId);
        nextTokenId++;
    }
}
