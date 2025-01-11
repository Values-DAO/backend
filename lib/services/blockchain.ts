// Get the price of ETH in USDC
export const getEthPriceInUsdc = async () => {
  const url = "https://api.g.alchemy.com/prices/v1/tokens/by-symbol?symbols=ETH&symbols=USDC";
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer sCRkeELOK2UImXTjQsv3HsfyvaQ1qlIV`,
  };

  const response = await fetch(url, { method: "GET", headers });
  const data = await response.json();

  const ethPriceInUsd = data.data[0].prices[0].value;
  const usdcPriceInUsd = data.data[1].prices[0].value;

  const ethPrice = ethPriceInUsd / usdcPriceInUsd;
  return ethPrice;
};
