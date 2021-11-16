// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "base64-sol/base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./interfaces/ILootLand.sol";

contract LootLand is ILootLand, ERC721Enumerable, Ownable {
  Land[] private _lands;

  // packedXY => tokenId
  mapping(uint256 => uint256) private _packedXYToTokenId;

  // packedXY => bool
  mapping(uint256 => bool) private _packedXYToIsBuyed;

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

    _lands.push(Land(0, 0, "", address(0), _owner, true, true));
    _gived[_owner] = 0;
    _packedXYToIsBuyed[0] = true;
    _packedXYToTokenId[0] = 0;
    _safeMint(_owner, 0);

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

  function getAllEth() external override onlyOwner {
    payable(_msgSender()).transfer(address(this).balance);
  }

  function getEth(uint256 value) external override onlyOwner {
    if (value <= address(this).balance) {
      payable(_msgSender()).transfer(value);
    }
  }

  function land(int128 _x, int128 _y)
    external
    view
    override
    returns (Land memory _land)
  {
    uint256 _packedXY = packedXY(_x, _y);
    if (_packedXYToIsBuyed[_packedXY]) {
      uint256 tokenId = _packedXYToTokenId[_packedXY];
      Land memory queryLand = _lands[tokenId];
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

    string memory json = Base64.encode(
      bytes(
        string(
          abi.encodePacked(
            '{"name": "Land #',
            Strings.toString(tokenId),
            '", "description": "xxxxx", "image": "data:image/svg+xml;base64,',
            Base64.encode(bytes(svgStr)),
            '"}'
          )
        )
      )
    );
    result = string(abi.encodePacked("data:application/json;base64,", json));
  }

  function getTokenId(int128 x, int128 y)
    public
    view
    override
    returns (uint256 tokenId)
  {
    uint256 _packedXY = packedXY(x, y);
    require(_packedXYToIsBuyed[_packedXY], "not buyed");
    tokenId = _packedXYToTokenId[_packedXY];
  }

  function packedXY(int128 x, int128 y)
    public
    pure
    override
    returns (uint256 _packedXY)
  {
    bytes32 xx = bytes16(uint128(x));
    bytes32 yy = bytes16(uint128(y));
    _packedXY = uint256(xx | (yy >> 128));
  }

  function getCoordinates(uint256 tokenId)
    public
    view
    override
    returns (int128 x, int128 y)
  {
    require(tokenId < _lands.length, "not exists");
    x = _lands[tokenId].x;
    y = _lands[tokenId].y;
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

    uint256 _packedXY = packedXY(x, y);

    require(!_packedXYToIsBuyed[_packedXY], "land is buyed");

    _lands.push(Land(x, y, "", _msgSender(), address(0), true, false));

    uint256 newTokenId = _lands.length - 1;
    _buyLandTokenIds[_msgSender()].push(newTokenId);
    buyLandCount[_msgSender()] += 1;

    _packedXYToTokenId[_packedXY] = newTokenId;
    _packedXYToIsBuyed[_packedXY] = true;

    emit Buy(x, y, _msgSender());
  }
}
