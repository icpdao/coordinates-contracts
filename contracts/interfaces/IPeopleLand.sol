// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPeopleLand {
  struct Land {
    int128 x;
    int128 y;
    string slogan;
    address mintedAddress;
    address givedAddress;
    bool isMinted;
    bool isGived;
  }

  event Mint(int128 x, int128 y, address mintedAddress);
  event GiveTo(int128 x, int128 y, address givedAddress);
  event SetSlogan(int128 x, int128 y, string slogan);

  function mintLandCount(address mintedAddress)
    external
    view
    returns (uint8 count);

  function isPeople(address addr) external view returns (bool);

  function isBuilder(address addr) external view returns (bool);

  function tokenSVGAddress() external view returns (address);

  function mintToSelf(
    int128 x,
    int128 y,
    bytes32 messageHash,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external;

  function mintToBuilderByOwner(
    int128 x,
    int128 y,
    address givedAddress
  ) external;

  function mintToBuilderByOwnerWithSlogan(
    int128 x,
    int128 y,
    address givedAddress,
    string memory slogan
  ) external;

  function mint(int128 x, int128 y) external payable;

  function mint2(
    int128 x1,
    int128 y1,
    int128 x2,
    int128 y2
  ) external payable;

  function giveTo(
    int128 x,
    int128 y,
    address givedAddress
  ) external;

  function mintAndGiveTo(
    int128 x,
    int128 y,
    address givedAddress
  ) external payable;

  function mintAndGiveToWithSlogan(
    int128 x,
    int128 y,
    address givedAddress,
    string memory slogan
  ) external payable;

  function mint2AndGiveTo(
    int128 x1,
    int128 y1,
    address givedAddress1,
    int128 x2,
    int128 y2,
    address givedAddress2
  ) external payable;

  function setSlogan(
    int128 x,
    int128 y,
    string memory slogan
  ) external;

  function getEth(uint256 value) external;

  function getAllEth() external;

  function setTokenSVGAddress(address _attr) external;

  function openMintSelfSwitch() external;

  function land(int128 _x, int128 _y) external view returns (Land memory token);

  function givedLand(address _givedAddress)
    external
    view
    returns (bool isGived, Land memory token);

  function getMintLands(address _mintedAddress)
    external
    view
    returns (Land[] memory _token);

  function getTokenId(int128 x, int128 y)
    external
    view
    returns (uint256 tokenId);

  function getCoordinates(uint256 tokenId)
    external
    view
    returns (int128 x, int128 y);

  function getCoordinatesStrings(int128 x, int128 y)
    external
    view
    returns (string memory sx, string memory sy);

  function packedXY(int128 x, int128 y)
    external
    pure
    returns (uint256 _packedXY);
}
