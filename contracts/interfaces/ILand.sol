// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ILand {
  event Buy(int128 x, int128 y, address buyedAddress);
  event GiveTo(int128 x, int128 y, address givedAddress);
  event SetSlogan(int128 x, int128 y, string slogan);

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

  function land(int128 x, int128 y)
    external
    view
    returns (
      string memory slogan,
      address buyedAddress,
      address givedAddress,
      bool isBuyed,
      bool isGived
    );

  function givedLand(address givedAddress)
    external
    view
    returns (
      int128 x,
      int128 y,
      string memory slogan,
      address buyedAddress,
      bool isBuyed,
      bool isGived
    );

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
