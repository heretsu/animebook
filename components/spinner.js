import DappLogo from "./dappLogo";
export default function Spinner({ spinnerSize }) {
  return (
    <>
      {spinnerSize == "logo" ? (
        <div className="relative w-20 h-20 rounded-full">
          <div className="shadow-xl absolute inset-0 flex border-4 border-b-green-500 border-transparent rounded-full animate-spin"></div>
          <div className="flex justify-center items-center h-full bg-transparent p-1 rounded-full">
            <span className="bg-white flex w-full h-full rounded-full">
                <DappLogo size="small" />
            </span>
            
          </div>
        </div>
      ) : spinnerSize == "medium" ? (
        <div className="flex border-4 border-l-none border-b-none border-x-green-500 border-transparent w-12 h-12 rounded-3xl animate-spin"></div>
      ) : (
        <div className="ml-0.5 flex border-4 border-l-none border-b-none border-r-green-500 border-transparent w-8 h-8 rounded-3xl animate-spin"></div>
      )}
    </>
  );
}
