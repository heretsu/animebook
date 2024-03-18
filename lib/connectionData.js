import { useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

export default function ConnectionData() {
  const [address, setAddress ] = useState(null);
  const [ethBalance, setEthBalance] = useState("");
  const [error, setError] = useState(false);
  const [network, setNetwork] = useState();
  const web3Modal =
    typeof window !== "undefined" && new Web3Modal({ cacheProvider: true });

  const setWalletAddress = async (provider) => {
    try {
      
      const signer = provider.getSigner();
      if (signer) {
        const web3Address = await signer.getAddress();
        const balance = await provider.getBalance(web3Address);
        const formattedBalance =
          balance / 1e18 < 0.001 ? 0 : parseFloat(balance / 1e18).toFixed(3);
        setEthBalance(formattedBalance);
        setAddress(web3Address);
        return web3Address;
      }
    } catch (error) {
      console.log(
        error,
        "Account not connected; logged from setWalletAddress function"
      );
    }
  };

  const checkIfExtensionIsAvailable = () => {
    if (
      (window && window.web3 !== undefined) ||
      (window && window.ethereum !== undefined)
    ){
      return
    } else{
      web3Modal && web3Modal.toggleModal();
      window.location.href = "https://metamask.app.link/dapp/animebook-cypherp0nk.vercel.app/signin"
      //https://metamask.app.link/dapp/animebook.io/signin
    }
  };

  const connectToWallet = async () => {
    try {

      checkIfExtensionIsAvailable();
      const connection = web3Modal && (await web3Modal.connect());
      const provider = new ethers.providers.Web3Provider(connection);
      await subscribeProvider(connection);

      const addr = await setWalletAddress(provider);
      return {addr, provider}
    } catch (error) {
      console.log(
        error,
        "got this error on connectToWallet catch block while connecting the wallet"
      );
    }
  };

  const subscribeProvider = async (connection) => {
    connection.on("chainChanged", async (chainId) => {
      if (chainId?.length) {
        console.log(chainId);
        setNetwork(chainId);
        window.location.reload();
      }
    });
  };

  const disconnectWallet = () => {
    setAddress(null);
    web3Modal && web3Modal.clearCachedProvider();
  };

  return {
    address,
    ethBalance,
    error,
    network,
    connectToWallet,
    disconnectWallet,
  };
}
