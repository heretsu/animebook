import { ethers } from "ethers";
import Pool from "./static/Pool.json";
import Aggregator from "./static/Aggregator.json";
import { formatUnits } from "@ethersproject/units";

export default function PriceFeedStation() {
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  // const { getProvider } = ConnectionData();
  const aggregatorABI = Aggregator.abi;
  const poolABI = Pool.abi;
  const aggregatorAddress = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
  const poolAddress = "0x55b0858f060b292498e694abA042534Eb22ea02E";
  const saiPoolAddress = "0xF3F4DfD1B442c2BaA4ef9D4d4CD4A4494EcFD845"
  const solAggregatorAddress = "0x4ffC43a60e009B551865A93d232E33Fce9f01507"

  const getUsdPrice = async () => {
    const provider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/U11P6UUXB75Tetuo_B3844xml5MZWtul');

    const pool = new ethers.Contract(poolAddress, poolABI, provider);
    const saiPool = new ethers.Contract(saiPoolAddress, poolABI, provider);

    const getAmounts = await pool.getReserves();
    const tokenInPool = parseFloat(formatUnits(getAmounts[0], 9));
    const ethInPool = parseFloat(formatUnits(getAmounts[1], 18));

    const saiEthAmounts = await saiPool.getReserves();
    const saiInPool = parseFloat(formatUnits(saiEthAmounts[0], 9))
    const ethInPoolForSai = parseFloat(formatUnits(saiEthAmounts[1], 18));


    const tokenToEth = ethInPool / tokenInPool;

    const saiToEth = ethInPoolForSai / saiInPool

    const aggregator = new ethers.Contract(
      aggregatorAddress,
      aggregatorABI,
      provider
    );
    const feedAnswers = await aggregator.latestRoundData();
    const ethPrice = parseFloat(formatUnits(feedAnswers[1], 8)); //IN USD

    const solAggregator = new ethers.Contract(solAggregatorAddress, aggregatorABI, provider)
    const solFeedAnswers = await solAggregator.latestRoundData()

    const solPrice = parseFloat(formatUnits(solFeedAnswers[1], 8)) //IN USD

    const tokenPrice = tokenToEth * ethPrice; //IN USD

    const saiPrice = saiToEth * ethPrice;

    return { ethPrice, tokenPrice, solPrice, saiPrice };
  };

  return { getUsdPrice };
}
