// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "base64-sol/base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./interfaces/ILootLand.sol";

contract LootLand is ILootLand, ERC721Enumerable, Ownable {
  // tokenid => TOKEN
  mapping(uint256 => Land) private _lands;

  // givedAddress => tokenId
  mapping(address => uint256) private _gived;

  // buyedAddress => buy land tokenids
  mapping(address => uint256[]) private _buyLandTokenIds;

  // buyedAddress => buy count
  mapping(address => uint8) public override buyLandCount;

  uint256 public constant PRICE = 4669201609102000 wei;

  modifier hasGived() {
    require(
      _lands[_gived[_msgSender()]].isGived &&
        _lands[_gived[_msgSender()]].givedAddress == _msgSender(),
      "caller is no gived"
    );
    _;
  }

  constructor(address _owner) ERC721("Land", "LAND") Ownable() {
    // TODO owner 问题
    transferOwnership(_owner);
    uint256 tokenId = getTokenId(0, 0);
    _lands[tokenId] = Land(0, 0, "", address(0), _owner, true, true);
    _gived[_owner] = tokenId;
    _safeMint(_owner, tokenId);

    emit Buy(0, 0, address(0));
    emit GiveTo(0, 0, _owner);
  }

  function buy(int128 x, int128 y) external payable override hasGived {
    require(buyLandCount[_msgSender()] < 2, "caller is already buyed");

    uint256 tokenId = getTokenId(x, y);

    require(!_lands[tokenId].isBuyed, "land is buyed");
    require(msg.value >= PRICE, "eth too less");

    _lands[tokenId] = Land(x, y, "", _msgSender(), address(0), true, false);

    _buyLandTokenIds[_msgSender()].push(tokenId);
    buyLandCount[_msgSender()] += 1;

    if (msg.value > PRICE) {
      payable(_msgSender()).transfer(msg.value - PRICE);
    }

    emit Buy(x, y, _msgSender());
  }

  function giveTo(
    int128 x,
    int128 y,
    address givedAddress
  ) external override hasGived {
    uint256 tokenId = getTokenId(x, y);

    require(
      _lands[tokenId].buyedAddress == _msgSender(),
      "caller didn't buyed this token"
    );
    require(!_lands[tokenId].isGived, "token is gived");

    _lands[tokenId].givedAddress = givedAddress;
    _lands[tokenId].isGived = true;
    _gived[givedAddress] = tokenId;

    _safeMint(givedAddress, tokenId);

    emit GiveTo(x, y, givedAddress);
  }

  function setSlogan(
    int128 x,
    int128 y,
    string memory slogan
  ) external override {
    uint256 tokenId = getTokenId(x, y);

    require(ownerOf(tokenId) == _msgSender(), "token is not belong to caller");
    require(bytes(slogan).length < 256, "slogan is too long");

    _lands[tokenId].slogan = slogan;

    emit SetSlogan(x, y, slogan);
  }

  function getEth() external override onlyOwner {
    payable(_msgSender()).transfer(address(this).balance);
  }

  function land(int128 _x, int128 _y)
    external
    view
    override
    returns (Land memory _land)
  {
    uint256 tokenId = getTokenId(_x, _y);
    Land memory queryLand = _lands[tokenId];
    if (queryLand.isBuyed) {
      _land = queryLand;
    } else {
      _land = Land(_x, _y, "", address(0), address(0), false, false);
    }
  }

  function givedLand(address _givedAddress)
    external
    view
    override
    returns (bool isGived, Land memory _land)
  {
    uint256 tokenId = _gived[_givedAddress];
    Land memory queryLand = _lands[tokenId];
    if (queryLand.givedAddress == _givedAddress) {
      isGived = true;
      _land = queryLand;
    } else {
      isGived = false;
      _land = Land(0, 0, "", address(0), address(0), false, false);
    }
  }

  function getBuyLands(address _buyedAddress)
    external
    view
    override
    returns (Land[] memory _buyLands)
  {
    uint256[] memory tokenIds = _buyLandTokenIds[_buyedAddress];
    _buyLands = new Land[](tokenIds.length);
    for (uint8 index = 0; index < tokenIds.length; index++) {
      _buyLands[index] = _lands[tokenIds[index]];
    }
  }

  function tokenURI(uint256 tokenId)
    public
    view
    override
    returns (string memory result)
  {
    require(_lands[tokenId].isBuyed, "not buyed");

    (int128 x, int128 y) = getCoordinates(tokenId);

    string memory _landStr = string(
      abi.encodePacked("<div>Lootland(", getCoordinatesString(x, y), ")</div>")
    );

    string memory contentStr;
    if (_lands[tokenId].isGived) {
      string memory _solganStr;
      if (bytes(_lands[tokenId].slogan).length == 0) {
        // TODO
        _solganStr = "<div>loot`s builder</div>";
      } else {
        _solganStr = string(
          abi.encodePacked("<div>", _lands[tokenId].slogan, "</div>")
        );
      }
      contentStr = string(abi.encodePacked(_solganStr, _landStr));
    } else {
      string[3] memory buffer;
      // TODO
      buffer[0] = string(abi.encodePacked("<div>", "111111", "</div>"));
      buffer[1] = string(abi.encodePacked("<div>", _landStr, "</div>"));
      buffer[2] = string(abi.encodePacked("<div>", "222222", "</div>"));
      contentStr = string(abi.encodePacked(buffer[0], buffer[1], buffer[2]));
    }
    string memory svgStr = string(
      abi.encodePacked(
        '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 350 350"><rect width="100%" height="100%" fill="black" /><foreignObject width="350" height="350" x="0" y="0"><body xmlns="http://www.w3.org/1999/xhtml"><style>.base { color: white; font-family: serif; font-size: 14px; margin: 10px; }</style><div class="base">',
        contentStr,
        "</div></body></foreignObject></svg>"
      )
    );

    result = string(
      abi.encodePacked(
        "data:application/svg;base64,",
        Base64.encode(bytes(svgStr))
      )
    );
  }

  function getTokenId(int128 x, int128 y)
    public
    pure
    override
    returns (uint256 tokenId)
  {
    bytes32 xx = bytes16(uint128(x));
    bytes32 yy = bytes16(uint128(y));
    tokenId = uint256(xx | (yy >> 128));
  }

  function getCoordinates(uint256 tokenId)
    public
    pure
    override
    returns (int128 x, int128 y)
  {
    x = int128(uint128(tokenId >> 128));
    y = int128(uint128(tokenId));
  }

  function getCoordinatesString(int128 x, int128 y)
    public
    pure
    override
    returns (string memory data)
  {
    string memory xPrefix = "";
    if (x > 0) {
      xPrefix = "E";
    }
    if (x < 0) {
      xPrefix = "W";
    }

    string memory xStr;
    if (x >= 0) {
      xStr = Strings.toString(uint256(int256(x)));
    } else {
      unchecked {
        xStr = Strings.toString(uint256(-int256(x)));
      }
    }

    string memory yPrefix = "";
    if (y > 0) {
      yPrefix = "N";
    }
    if (y < 0) {
      yPrefix = "S";
    }

    string memory yStr;
    if (y >= 0) {
      yStr = Strings.toString(uint256(int256(y)));
    } else {
      unchecked {
        yStr = Strings.toString(uint256(-int256(y)));
      }
    }

    data = string(abi.encodePacked(xPrefix, xStr, ",", yPrefix, yStr));
  }
}
