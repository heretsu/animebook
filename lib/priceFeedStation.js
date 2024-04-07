import { ethers } from "ethers";
import Pool from "./static/Pool.json";
import Aggregator from "./static/Aggregator.json";
import { formatUnits } from "@ethersproject/units";
import ConnectionData from "./connectionData";

export default function PriceFeedStation() {
  const { connectToWallet } = ConnectionData();
  const aggregatorABI = Aggregator.abi;
  const poolABI = Pool.abi;
  const aggregatorAddress = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
  const poolAddress = "0x55b0858f060b292498e694abA042534Eb22ea02E";

  const getUsdPrice = async () => {
    const { provider } = await connectToWallet();

    const pool = new ethers.Contract(poolAddress, poolABI, provider);
    const getAmounts = await pool.getReserves();
    const tokenInPool = parseFloat(formatUnits(getAmounts[0], 9));
    const ethInPool = parseFloat(formatUnits(getAmounts[1], 18));

    const tokenToEth = ethInPool / tokenInPool;

    const aggregator = new ethers.Contract(
      aggregatorAddress,
      aggregatorABI,
      provider
    );
    const feedAnswers = await aggregator.latestRoundData();
    const ethPrice = parseFloat(formatUnits(feedAnswers[1], 8)); //IN USD

    const tokenPrice = tokenToEth * ethPrice; //IN USD

    return { ethPrice, tokenPrice };
  };

  return { getUsdPrice };
}
