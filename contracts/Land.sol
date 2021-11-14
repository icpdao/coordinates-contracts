// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "base64-sol/base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./interfaces/ILand.sol";

contract Land is ILand, ERC721Enumerable, Ownable {
  struct Token {
    int128 x;
    int128 y;
    string slogan;
    address buyedAddress;
    address givedAddress;
    bool isBuyed;
    bool isGived;
  }

  struct Spread {
    uint256 tokenId;
    address tokenOnwer;
    address parent;
  }

  // tokenid => TOKEN
  mapping(uint256 => Token) public tokens;

  // givedAddress => tokenid
  mapping(address => uint256) public gived;

  // buyedAddress => buy count
  mapping(address => uint8) public buyCount;
  // buyedAddress => buy count
  mapping(address => uint256[]) public buyTokens;

  // TODO PRICE VALUE
  uint256 public constant PRICE = 10 gwei;

  modifier hasGived() {
    require(
      tokens[gived[_msgSender()]].givedAddress == _msgSender(),
      "caller is no gived"
    );
    _;
  }

  modifier canBuy() {
    require(buyCount[_msgSender()] < 2, "caller is already buyed");
    _;
  }

  constructor(address _owner) ERC721("Land", "LAND") Ownable() {
    // TODO owner 问题
    transferOwnership(_owner);
    uint256 tokenId = getTokenId(0, 0);
    tokens[tokenId] = Token(0, 0, "", address(0), _owner, true, true);
    gived[_owner] = tokenId;
    _safeMint(_owner, tokenId);

    emit Buy(0, 0, address(0));
    emit GiveTo(0, 0, _owner);
  }

  function buy(int128 x, int128 y) external payable override hasGived canBuy {
    uint256 tokenId = getTokenId(x, y);

    require(!tokens[tokenId].isBuyed, "token is buyed");
    require(msg.value >= PRICE);

    tokens[tokenId] = Token(x, y, "", _msgSender(), address(0), true, false);

    buyTokens[_msgSender()].push(tokenId);
    buyCount[_msgSender()] += 1;

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
      tokens[tokenId].buyedAddress == _msgSender(),
      "caller didn't buyed this token"
    );
    require(!tokens[tokenId].isGived, "token is gived");

    tokens[tokenId].givedAddress = givedAddress;
    tokens[tokenId].isGived = true;
    gived[givedAddress] = tokenId;

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

    tokens[tokenId].slogan = slogan;

    emit SetSlogan(x, y, slogan);
  }

  function getEth() external override onlyOwner {
    payable(_msgSender()).transfer(address(this).balance);
  }

  function land(int128 x, int128 y)
    external
    view
    override
    returns (
      string memory slogan,
      address buyedAddress,
      address givedAddress,
      bool isBuyed,
      bool isGived
    )
  {
    uint256 tokenId = getTokenId(x, y);
    Token memory token = tokens[tokenId];
    slogan = token.slogan;
    buyedAddress = token.buyedAddress;
    givedAddress = token.givedAddress;
    isBuyed = token.isBuyed;
    isGived = token.isGived;
  }

  function givedLand(address givedAddress)
    external
    view
    override
    returns (
      int128 x,
      int128 y,
      string memory slogan,
      address buyedAddress,
      bool isBuyed,
      bool isGived
    )
  {
    uint256 tokenId = gived[givedAddress];
    Token memory token = tokens[tokenId];
    x = token.x;
    y = token.y;
    slogan = token.slogan;
    buyedAddress = token.buyedAddress;
    isBuyed = token.isBuyed;
    isGived = token.isGived;
  }

  function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory result)
  {
    require(tokens[tokenId].isBuyed, "not buyed");

    (int128 x, int128 y) = getCoordinates(tokenId);

    string memory _landStr = string(
      abi.encodePacked("<div>Lootland(", getCoordinatesString(x, y), ")</div>")
    );

    string memory contentStr;
    if (tokens[tokenId].isGived) {
      string memory _solganStr;
      if (bytes(tokens[tokenId].slogan).length == 0) {
        // TODO
        _solganStr = "<div>loot`s builder</div>";
      } else {
        _solganStr = string(
          abi.encodePacked("<div>", tokens[tokenId].slogan, "</div>")
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
