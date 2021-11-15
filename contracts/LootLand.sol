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
    _buy(x, y);
  }

  function buy2(
    int128 x1,
    int128 y1,
    int128 x2,
    int128 y2
  ) external payable override hasGived {
    _buy2(x1, y1, x2, y2);
  }

  function giveTo(
    int128 x,
    int128 y,
    address givedAddress
  ) external override hasGived {
    _giveTo(x, y, givedAddress);
  }

  function buyAndGiveTo(
    int128 x,
    int128 y,
    address givedAddress
  ) external payable override hasGived {
    _buy(x, y);
    _giveTo(x, y, givedAddress);
  }

  function buy2AndGiveTo(
    int128 x1,
    int128 y1,
    address givedAddress1,
    int128 x2,
    int128 y2,
    address givedAddress2
  ) external payable override hasGived {
    _buy2(x1, y1, x2, y2);
    _giveTo(x1, y1, givedAddress1);
    _giveTo(x2, y2, givedAddress2);
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
    (int128 x, int128 y) = getCoordinates(tokenId);

    string memory _slogan;
    if (!_lands[tokenId].isBuyed) {
      _slogan = "Waiting for you";
    } else {
      _slogan = "Inviting the talented you to become a lootverse builder for the next 10 years, And For you on my side bought:";
      if (_lands[tokenId].isGived && bytes(_lands[tokenId].slogan).length > 0) {
        _slogan = _lands[tokenId].slogan;
      }
    }

    string memory _sloganStr = string(
      abi.encodePacked('<div class="sologan">', _slogan, "</div>")
    );

    string memory _landStr = string(
      abi.encodePacked(
        '<div class="land">Lootland (',
        getCoordinatesString(x, y),
        ")</div>"
      )
    );

    string memory _notesStr = string(
      abi.encodePacked(
        '<div class="notes">',
        "<div>Notes:</div>",
        "<div>- Lootland is created for builders</div>",
        "<div>- Only invited to be a builder</div>",
        "<div>- Each builder can only buy two lands</div>",
        "<div>- Only one person can be invited to each land</div>",
        "<div>- Each person can only accept an invitation once</div>",
        "<div>- Each land is 100*100 square meters</div>",
        "</div>"
      )
    );

    string memory svgStr = string(
      abi.encodePacked(
        '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 360 360"><rect width="100%" height="100%" fill="#0F4C81" /><foreignObject width="360" height="360" x="0" y="0"><body xmlns="http://www.w3.org/1999/xhtml"><style>.base {font-family:sans-serif;margin:10px;}.sologan { color: #F0EDE5; font-size: 18px;margin-top:30px;height: 90px; }.land { color: #C0D725; font-size: 24px; height: 60px; }.notes { color: #A5B8D0; font-size: 14px; }</style><div class="base">',
        _sloganStr,
        _landStr,
        _notesStr,
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

  function _giveTo(
    int128 x,
    int128 y,
    address givedAddress
  ) private {
    uint256 tokenId = getTokenId(x, y);

    require(
      _lands[tokenId].buyedAddress == _msgSender(),
      "caller didn't buyed this token"
    );
    require(!_lands[tokenId].isGived, "token is gived");

    require(
      _lands[_gived[givedAddress]].givedAddress != givedAddress,
      "givedAddress have gived land"
    );

    _lands[tokenId].givedAddress = givedAddress;
    _lands[tokenId].isGived = true;
    _gived[givedAddress] = tokenId;

    _safeMint(givedAddress, tokenId);

    emit GiveTo(x, y, givedAddress);
  }

  function _buy2(
    int128 x1,
    int128 y1,
    int128 x2,
    int128 y2
  ) private {
    require(msg.value >= PRICE * 2, "eth too less");

    _buyWithoutEth(x1, y1);
    _buyWithoutEth(x2, y2);

    if (msg.value > PRICE * 2) {
      payable(_msgSender()).transfer(msg.value - PRICE * 2);
    }
  }

  function _buy(int128 x, int128 y) private {
    require(msg.value >= PRICE, "eth too less");

    _buyWithoutEth(x, y);

    if (msg.value > PRICE) {
      payable(_msgSender()).transfer(msg.value - PRICE);
    }
  }

  function _buyWithoutEth(int128 x, int128 y) private {
    require(buyLandCount[_msgSender()] < 2, "caller is already buyed");

    uint256 tokenId = getTokenId(x, y);

    require(!_lands[tokenId].isBuyed, "land is buyed");

    _lands[tokenId] = Land(x, y, "", _msgSender(), address(0), true, false);

    _buyLandTokenIds[_msgSender()].push(tokenId);
    buyLandCount[_msgSender()] += 1;

    emit Buy(x, y, _msgSender());
  }
}
