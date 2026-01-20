// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "./HolobotPublicMint.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory baseURI = vm.envOr("BASE_URI", string("https://holobots.fun/api/metadata/"));

        vm.startBroadcast(deployerPrivateKey);

        HolobotPublicMint nft = new HolobotPublicMint(baseURI);
        
        console.log("HolobotPublicMint deployed at:", address(nft));

        vm.stopBroadcast();
    }
}
