// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "base64-sol/base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./libraries/Utils.sol";
import "./interfaces/IPeopleLand.sol";

contract PeopleLand is IPeopleLand, ERC721Enumerable, Ownable {
  Land[] private _lands;

  // packedXY => tokenId
  mapping(uint256 => uint256) private _packedXYToTokenId;

  // packedXY => bool
  mapping(uint256 => bool) private _packedXYToIsMinted;

  // givedAddress => tokenId
  mapping(address => uint256) private _gived;

  // mintedAddress => mint land tokenids
  mapping(address => uint256[]) private _mintLandTokenIds;

  // mintedAddress => mint count
  mapping(address => uint8) public override mintLandCount;

  mapping(address => bool) public override isPeople;

  mapping(address => bool) public override isBuilder;

  // TODO ??
  uint256 public constant PRICE = 4669201609102000 wei;

  address public constant SIGN_MESSAGE_ADDRESS =
    0x9d74d0D4bf55bA7E50a0600b7630c36Cab8A2a69;

  modifier hasGived() {
    require(
      _lands[_gived[_msgSender()]].isGived &&
        _lands[_gived[_msgSender()]].givedAddress == _msgSender(),
      "caller is no gived"
    );
    _;
  }

  modifier notPeopleReserved(int128 x, int128 y) {
    require(
      !((-31 < x && x < 31) && (-31 < y && y < 31)),
      "land is people reserved"
    );
    _;
  }

  modifier notReserved(int128 x, int128 y) {
    require(!((-3 < x && x < 3) && (-3 < y && y < 3)), "land is reserved");
    _;
  }

  modifier isReserved(int128 x, int128 y) {
    require((-3 < x && x < 3) && (-3 < y && y < 3), "land is not reserved");
    _;
  }

  constructor(address _owner, address _startUp)
    ERC721("People's Land", "PEOPLELAND")
    Ownable()
  {
    transferOwnership(_owner);

    _lands.push(Land(0, 0, "", address(0), _startUp, true, true));
    _gived[_startUp] = 0;
    _packedXYToIsMinted[0] = true;
    _packedXYToTokenId[0] = 0;
    _safeMint(_startUp, 0);
    isBuilder[_startUp] = true;

    emit Mint(0, 0, address(0));
    emit GiveTo(0, 0, _startUp);
  }

  function mintToSelf(
    int128 x,
    int128 y,
    bytes32 messageHash,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external override notReserved(x, y) {
    require(_verifyWhitelist(messageHash, v, r, s), "not in whitelist");

    require(
      _lands[_gived[_msgSender()]].givedAddress != _msgSender(),
      "caller is minted or have gived"
    );

    uint256 _packedXY = packedXY(x, y);
    require(!_packedXYToIsMinted[_packedXY], "land is minted");

    isPeople[_msgSender()] = true;

    _lands.push(Land(x, y, "", address(0), _msgSender(), true, true));
    uint256 newTokenId = _lands.length - 1;

    _packedXYToIsMinted[_packedXY] = true;
    _packedXYToTokenId[_packedXY] = newTokenId;
    _gived[_msgSender()] = newTokenId;

    _safeMint(_msgSender(), newTokenId);

    emit Mint(x, y, address(0));
    emit GiveTo(x, y, _msgSender());
  }

  function mintToBuilderByOwner(
    int128 x,
    int128 y,
    address givedAddress
  ) external override onlyOwner isReserved(x, y) {
    require(
      _lands[_gived[givedAddress]].givedAddress != givedAddress,
      "givedAddress is minted or have gived"
    );

    uint256 _packedXY = packedXY(x, y);
    require(!_packedXYToIsMinted[_packedXY], "land is minted");

    _lands.push(Land(x, y, "", address(0), givedAddress, true, true));
    uint256 newTokenId = _lands.length - 1;

    _packedXYToIsMinted[_packedXY] = true;
    _packedXYToTokenId[_packedXY] = newTokenId;
    _gived[givedAddress] = newTokenId;

    _safeMint(givedAddress, newTokenId);

    isBuilder[givedAddress] = true;

    emit Mint(x, y, address(0));
    emit GiveTo(x, y, givedAddress);
  }

  function mint(int128 x, int128 y) external payable override hasGived {
    _mint(x, y);
  }

  function mint2(
    int128 x1,
    int128 y1,
    int128 x2,
    int128 y2
  ) external payable override hasGived {
    _mint2(x1, y1, x2, y2);
  }

  function giveTo(
    int128 x,
    int128 y,
    address givedAddress
  ) external override hasGived {
    _giveTo(x, y, givedAddress);
  }

  function mintAndGiveTo(
    int128 x,
    int128 y,
    address givedAddress
  ) external payable override hasGived {
    _mint(x, y);
    _giveTo(x, y, givedAddress);
  }

  function mint2AndGiveTo(
    int128 x1,
    int128 y1,
    address givedAddress1,
    int128 x2,
    int128 y2,
    address givedAddress2
  ) external payable override hasGived {
    _mint2(x1, y1, x2, y2);
    _giveTo(x1, y1, givedAddress1);
    _giveTo(x2, y2, givedAddress2);
  }

  function setSlogan(
    int128 x,
    int128 y,
    string memory slogan
  ) external override {
    uint256 tokenId = getTokenId(x, y);

    require(ownerOf(tokenId) == _msgSender(), "land is not belong to caller");
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
    if (_packedXYToIsMinted[_packedXY]) {
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

  function getMintLands(address _mintedAddress)
    external
    view
    override
    returns (Land[] memory _mintLands)
  {
    uint256[] memory tokenIds = _mintLandTokenIds[_mintedAddress];
    _mintLands = new Land[](tokenIds.length);
    for (uint8 index = 0; index < tokenIds.length; index++) {
      _mintLands[index] = _lands[tokenIds[index]];
    }
  }

  function tokenURI(uint256 tokenId)
    public
    view
    override
    returns (string memory result)
  {
    (int128 x, int128 y) = getCoordinates(tokenId);

    (string memory sx, string memory sy) = getCoordinatesStrings(x, y);
    string memory _landStr = string(
      abi.encodePacked(
        '<span class="landcdt" style="vertical-align: middle;">',
        sx,
        '</span></span><span style="vertical-align: middle;font-size: 2rem;">,</span><span class="landcd"><span class="landcdt" style="vertical-align: middle;">',
        sy,
        '</span></span><span style="vertical-align: middle;font-size: 2rem;">)</span></div>'
      )
    );

    string memory _slogan;
    if (bytes(_lands[tokenId].slogan).length > 0) {
      _slogan = _lands[tokenId].slogan;
    } else {
      _slogan = "<br/>For the PEOPLE of<br/>ConstitutionDAO who made history";
    }

    string memory _sloganStr = string(
      abi.encodePacked('<div class="sologan">', _slogan, "</div>")
    );

    string memory _endTipStr = "I'm carefully selecting our neighbors!";
    if (mintLandCount[_lands[tokenId].givedAddress] >= 2) {
      _endTipStr = "Imagine and build!";
    }

    string memory _notesStr = string(
      abi.encodePacked(
        '<div class="notes"><ul>',
        _getInviteByStr(tokenId),
        _getMintAndGiveToStr(tokenId),
        '<li>Neighbors:</li></ul><div class="b1"><div class="b1i2">',
        _getNeighborsStr(x, y),
        "</div></div><ul><li>",
        _endTipStr,
        "</li></ul></div>"
      )
    );

    // TODO image base64 size
    string memory svgStr = string(
      abi.encodePacked(
        '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 360 360"><rect width="100%" height="100%" fill="#353535" /><foreignObject width="360" height="360" x="0" y="0"><body xmlns="http://www.w3.org/1999/xhtml"><style>.base{font-family:sans-serif;margin:10px;}.sologan{color:#fdf9f3;font-size:16px;font-weight:500;height:25px;margin-top:0px;text-align:center;}.land{color:#fdf9f3;font-size:12px;line-height:35px;margin-top:20px;text-align:center;}.landc{color:#fdf9f3;margin-left:auto;margin-right:auto;margin-top:5px;text-align:center;font-weight:800;font-size:0;height:45px;line-height:40px;}.landcd{background-repeat: no-repeat;background-image: url("data:image/png;base64,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");background-size:100% 100%;display:inline-block;text-align:center;font-size:1.2rem;vertical-align: middle;line-height:40px;}.landcdt{padding-left:10px;padding-right:10px;display:inline-block;color:#a4752a;}.notes{color:#fdf9f3;font-size:12px;margin-top:50px;margin-left:50px;-webkit-transform-origin-x: 0;-webkit-transform : scale(0.8,0.8) ;}ul{list-style-type:disc;margin:0 0 0 -20px;}.b1{display:flex;justify-content:center;align-items:center;margin:5px;}.b1i2{grid-column-start:2;grid-row-start:2;display:grid;grid-template-columns:repeat(3,max-content);grid-template-row:repeat(3,auto);grid-column-gap:5px;justify-items:start;}</style><div class="base"><div class="land">PEOPLELAND</div><div class="landc"><span style="vertical-align: middle;font-size: 2rem;">(</span><span class="landcd">',
        _landStr,
        _sloganStr,
        _notesStr,
        "</div></body></foreignObject></svg>"
      )
    );

    // TODO description
    string memory json = Base64.encode(
      bytes(
        string(
          abi.encodePacked(
            '{"name": "Land #',
            Strings.toString(tokenId),
            '", "description": "xxx", "image": "data:image/svg+xml;base64,',
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
    require(_packedXYToIsMinted[_packedXY], "land not minted");
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

  function getCoordinatesStrings(int128 x, int128 y)
    public
    pure
    override
    returns (string memory sx, string memory sy)
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

    sx = string(abi.encodePacked(xPrefix, xStr));
    sy = string(abi.encodePacked(yPrefix, yStr));
  }

  function _giveTo(
    int128 x,
    int128 y,
    address givedAddress
  ) private {
    uint256 tokenId = getTokenId(x, y);

    require(
      _lands[tokenId].mintedAddress == _msgSender(),
      "caller didn't minted this land"
    );
    require(!_lands[tokenId].isGived, "land is gived");

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

  function _mint2(
    int128 x1,
    int128 y1,
    int128 x2,
    int128 y2
  ) private {
    require(msg.value >= PRICE * 2, "eth too less");

    _mintWithoutEth(x1, y1);
    _mintWithoutEth(x2, y2);

    if (msg.value > PRICE * 2) {
      payable(_msgSender()).transfer(msg.value - PRICE * 2);
    }
  }

  function _mint(int128 x, int128 y) private {
    require(msg.value >= PRICE, "eth too less");

    _mintWithoutEth(x, y);

    if (msg.value > PRICE) {
      payable(_msgSender()).transfer(msg.value - PRICE);
    }
  }

  function _mintWithoutEth(int128 x, int128 y) private notPeopleReserved(x, y) {
    require(mintLandCount[_msgSender()] < 2, "caller is already minted");

    uint256 _packedXY = packedXY(x, y);

    require(!_packedXYToIsMinted[_packedXY], "land is minted");

    _lands.push(Land(x, y, "", _msgSender(), address(0), true, false));

    uint256 newTokenId = _lands.length - 1;
    _mintLandTokenIds[_msgSender()].push(newTokenId);
    mintLandCount[_msgSender()] += 1;

    _packedXYToTokenId[_packedXY] = newTokenId;
    _packedXYToIsMinted[_packedXY] = true;

    emit Mint(x, y, _msgSender());
  }

  function _getInviteByStr(uint256 tokenId)
    private
    view
    returns (string memory _str)
  {
    string memory _var;
    address mintedAddress = _lands[tokenId].mintedAddress;
    address givedAddress = _lands[tokenId].givedAddress;
    if (isPeople[givedAddress]) {
      _var = "I'm this PEOPLE ^_^";
    } else if (isBuilder[givedAddress]) {
      _var = "I'm the BUILDER ^_^";
    } else {
      Land memory _ql = _lands[_gived[mintedAddress]];
      _var = string(
        abi.encodePacked(
          "Thanks to ",
          _getTokenIdAndCoordinatesString(_gived[mintedAddress], _ql.x, _ql.y),
          " for the invite"
        )
      );
    }

    _str = string(abi.encodePacked("<li>", _var, "</li>"));
  }

  function _getMintAndGiveToStr(uint256 tokenId)
    private
    view
    returns (string memory _str)
  {
    address _givedAddress = _lands[tokenId].givedAddress;
    uint256[] memory tokenIds = _mintLandTokenIds[_givedAddress];
    string memory _mintStr = "";
    string memory _giveToStr = "";
    if (tokenIds.length != 0) {
      for (uint8 i = 0; i < tokenIds.length; i++) {
        Land memory qLand = _lands[tokenIds[i]];
        if (qLand.isGived) {
          _giveToStr = string(
            abi.encodePacked(
              _giveToStr,
              " ",
              _getTokenIdAndCoordinatesString(tokenIds[i], qLand.x, qLand.y)
            )
          );
        } else {
          _mintStr = string(
            abi.encodePacked(
              _mintStr,
              " ",
              _getCoordinatesString(qLand.x, qLand.y)
            )
          );
        }
      }
      _str = string(
        abi.encodePacked(
          bytes(_mintStr).length == 0
            ? ""
            : string(abi.encodePacked("<li>Minted", _mintStr, "</li>")),
          bytes(_giveToStr).length == 0
            ? ""
            : string(abi.encodePacked("<li>Invited", _giveToStr, "</li>"))
        )
      );
    }
  }

  function _getNeighborsStr(int128 x, int128 y)
    private
    view
    returns (string memory _str)
  {
    string[8] memory _arr = _getNeighborsStrArr(x, y);
    _str = string(
      abi.encodePacked(
        _arr[0],
        _arr[1],
        _arr[2],
        _arr[3],
        "<div>Me</div>",
        _arr[4],
        _arr[5],
        _arr[6],
        _arr[7]
      )
    );
  }

  /**
      (c1)x-1, y+1   (c2)x, y+1  (c3)x+1, y+1   
      (c4)x-1, y     (c5)x, y    (c6)x+1, y
      (c7)x-1, y-1   (c8)x, y-1  (c9)x+1, y-1
     */
  function _getNeighborsStrArr(int128 x, int128 y)
    private
    view
    returns (string[8] memory _arr)
  {
    bool xIsMax = type(int128).max == x;
    bool yIsMax = type(int128).max == y;
    bool xIsMin = type(int128).min == x;
    bool yIsMin = type(int128).min == y;
    string memory empty = "<div>#</div>";

    _arr[0] = (xIsMin || yIsMax) ? empty : _getTokenIdStr(x - 1, y + 1);
    _arr[1] = yIsMax ? empty : _getTokenIdStr(x, y + 1);
    _arr[2] = (xIsMax || yIsMax) ? empty : _getTokenIdStr(x + 1, y + 1);
    _arr[3] = xIsMin ? empty : _getTokenIdStr(x - 1, y);
    _arr[4] = xIsMax ? empty : _getTokenIdStr(x + 1, y);
    _arr[5] = (xIsMin || yIsMin) ? empty : _getTokenIdStr(x - 1, y - 1);
    _arr[6] = yIsMin ? empty : _getTokenIdStr(x, y - 1);
    _arr[7] = xIsMax || yIsMin ? empty : _getTokenIdStr(x + 1, y - 1);
  }

  function _getTokenIdStr(int128 x, int128 y)
    private
    view
    returns (string memory _str)
  {
    uint256 _packedXY = packedXY(x, y);

    if (_packedXYToIsMinted[_packedXY]) {
      _str = string(
        abi.encodePacked("#", Strings.toString(_packedXYToTokenId[_packedXY]))
      );
    } else {
      _str = "#";
    }

    _str = string(abi.encodePacked("<div>", _str, "</div>"));
  }

  function _getTokenIdAndCoordinatesString(
    uint256 tokenId,
    int128 x,
    int128 y
  ) private pure returns (string memory _str) {
    _str = string(
      abi.encodePacked(
        "#",
        Strings.toString(tokenId),
        _getCoordinatesString(x, y)
      )
    );
  }

  function _getCoordinatesString(int128 x, int128 y)
    private
    pure
    returns (string memory _str)
  {
    (string memory sx, string memory sy) = getCoordinatesStrings(x, y);
    _str = string(abi.encodePacked("(", sx, ",", sy, ")"));
  }

  function _verifyWhitelist(
    bytes32 messageHash,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) private view returns (bool pass) {
    bytes32 reMessageHash = keccak256(
      abi.encodePacked(
        "\x19Ethereum Signed Message:\n42",
        Utils.toString(_msgSender())
      )
    );

    pass = (ecrecover(messageHash, v, r, s) == SIGN_MESSAGE_ADDRESS &&
      reMessageHash == messageHash);
  }
}
