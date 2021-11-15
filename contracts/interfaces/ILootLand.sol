// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ILootLand {
  struct Land {
    int128 x;
    int128 y;
    string slogan;
    address buyedAddress;
    address givedAddress;
    bool isBuyed;
    bool isGived;
  }

  event Buy(int128 x, int128 y, address buyedAddress);
  event GiveTo(int128 x, int128 y, address givedAddress);
  event SetSlogan(int128 x, int128 y, string slogan);

  function buyLandCount(address buyedAddress) external returns (uint8 count);

  function buy(int128 x, int128 y) external payable;

  function giveTo(
    int128 x,
    int128 y,
    address givedAddress
  ) external;

  function setSlogan(
    int128 x,
    int128 y,
    string memory slogan
  ) external;

  function getEth() external;

  function land(int128 _x, int128 _y) external view returns (Land memory token);

  function givedLand(address _givedAddress)
    external
    view
    returns (bool isGived, Land memory token);

  function getBuyLands(address _buyedAddress)
    external
    view
    returns (Land[] memory _token);

  function getTokenId(int128 x, int128 y)
    external
    pure
    returns (uint256 tokenId);

  function getCoordinates(uint256 tokenId)
    external
    pure
    returns (int128 x, int128 y);

  function getCoordinatesString(int128 x, int128 y)
    external
    pure
    returns (string memory data);
}
