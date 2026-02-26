import { UserContext } from "../lib/userContext";
import { useContext, useState } from "react";

const ShareSystem = ({ postUrl, custom }) => {
  const { darkMode } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      style={{
        zIndex: "999",
      }}
    >
      {/* Share Button */}
      {custom ? (
        <li
          onClick={() => {
            setShowModal(true);
          }}
          className={`border-b ${
            darkMode ? "border-gray-900" : "border-gray-100"
          } px-4 py-2 flex items-center space-x-2 hover:bg-gray-100 cursor-pointer`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12.807"
            height="15.338"
            viewBox="0 0 11.807 16.338"
          >
            <g id="upload_1_" data-name="upload (1)" transform="translate(-16)">
              <g
                id="Gruppe_3317"
                data-name="Gruppe 3317"
                transform="translate(17.863)"
              >
                <g id="Gruppe_3316" data-name="Gruppe 3316">
                  <path
                    id="Pfad_4761"
                    data-name="Pfad 4761"
                    d="M135.953,4.259,132.418.175a.5.5,0,0,0-.76,0l-3.535,4.085a.514.514,0,0,0-.08.547.505.505,0,0,0,.46.3h2.02v6.637a.508.508,0,0,0,.505.511h2.02a.508.508,0,0,0,.505-.511V5.106h2.02a.5.5,0,0,0,.46-.3A.513.513,0,0,0,135.953,4.259Z"
                    transform="translate(-127.998)"
                    fill="#5d6879"
                  />
                </g>
              </g>
              <g
                id="Gruppe_3319"
                data-name="Gruppe 3319"
                transform="translate(16 11.233)"
              >
                <g id="Gruppe_3318" data-name="Gruppe 3318">
                  <path
                    id="Pfad_4762"
                    data-name="Pfad 4762"
                    d="M25.936,352v3.063H17.9V352H16v4.085a.927.927,0,0,0,.787,1.021H27.02a.926.926,0,0,0,.787-1.021V352Z"
                    transform="translate(-16 -352)"
                    fill="#5d6879"
                  />
                </g>
              </g>
            </g>
          </svg>
          <span>Share</span>
        </li>
      ) : (
        <svg
          onClick={() => {
            setShowModal(true);
          }}
          xmlns="http://www.w3.org/2000/svg"
          width="18.114"
          height="16"
          viewBox="0 0 19.114 16"
        >
          <path
            id="share"
            d="M18.462,46.57l-4.327-4.327a1.557,1.557,0,0,0-1.076-.538c-.49,0-1.063.373-1.063,1.424V44.6A12.557,12.557,0,0,0,0,57.145a.56.56,0,0,0,1.008.336A14.319,14.319,0,0,1,12,51.718v1.45c0,1.051.573,1.424,1.063,1.424h0a1.557,1.557,0,0,0,1.076-.538l4.327-4.327a2.238,2.238,0,0,0,0-3.158Z"
            transform="translate(0 -41.705)"
            fill="#adb6c3"
          />
        </svg>
      )}

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div
            className={`${
              darkMode ? "bg-[#27292F] text-white" : "bg-white text-black"
            } p-6 rounded-lg shadow-lg w-80`}
          >
            <h2 className="text-lg font-semibold">Share this post</h2>
            <span className="flex break-all font-semibold py-1">{postUrl}</span>

            <div className="flex justify-around mb-4">
              <a
                href={`https://twitter.com/intent/tweet?url=${postUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 50 50"
                  width="30px"
                  height="30px"
                  fill="white"
                  stroke="white"
                  strokeWidth="2"
                  className="bg-black p-1.5 rounded-full"
                >
                  <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z" />
                </svg>
              </a>

              <a
                href={`https://api.whatsapp.com/send?text=${postUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-700"
              >
                <svg
                  width="30px"
                  height="30px"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16 31C23.732 31 30 24.732 30 17C30 9.26801 23.732 3 16 3C8.26801 3 2 9.26801 2 17C2 19.5109 2.661 21.8674 3.81847 23.905L2 31L9.31486 29.3038C11.3014 30.3854 13.5789 31 16 31ZM16 28.8462C22.5425 28.8462 27.8462 23.5425 27.8462 17C27.8462 10.4576 22.5425 5.15385 16 5.15385C9.45755 5.15385 4.15385 10.4576 4.15385 17C4.15385 19.5261 4.9445 21.8675 6.29184 23.7902L5.23077 27.7692L9.27993 26.7569C11.1894 28.0746 13.5046 28.8462 16 28.8462Z"
                    fill="#BFC8D0"
                  />
                  <path
                    d="M28 16C28 22.6274 22.6274 28 16 28C13.4722 28 11.1269 27.2184 9.19266 25.8837L5.09091 26.9091L6.16576 22.8784C4.80092 20.9307 4 18.5589 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16Z"
                    fill="url(#paint0_linear_87_7264)"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2C8.26801 2 2 8.26801 2 16C2 18.5109 2.661 20.8674 3.81847 22.905L2 30L9.31486 28.3038C11.3014 29.3854 13.5789 30 16 30ZM16 27.8462C22.5425 27.8462 27.8462 22.5425 27.8462 16C27.8462 9.45755 22.5425 4.15385 16 4.15385C9.45755 4.15385 4.15385 9.45755 4.15385 16C4.15385 18.5261 4.9445 20.8675 6.29184 22.7902L5.23077 26.7692L9.27993 25.7569C11.1894 27.0746 13.5046 27.8462 16 27.8462Z"
                    fill="white"
                  />
                  <path
                    d="M12.5 9.49989C12.1672 8.83131 11.6565 8.8905 11.1407 8.8905C10.2188 8.8905 8.78125 9.99478 8.78125 12.05C8.78125 13.7343 9.52345 15.578 12.0244 18.3361C14.438 20.9979 17.6094 22.3748 20.2422 22.3279C22.875 22.2811 23.4167 20.0154 23.4167 19.2503C23.4167 18.9112 23.2062 18.742 23.0613 18.696C22.1641 18.2654 20.5093 17.4631 20.1328 17.3124C19.7563 17.1617 19.5597 17.3656 19.4375 17.4765C19.0961 17.8018 18.4193 18.7608 18.1875 18.9765C17.9558 19.1922 17.6103 19.083 17.4665 19.0015C16.9374 18.7892 15.5029 18.1511 14.3595 17.0426C12.9453 15.6718 12.8623 15.2001 12.5959 14.7803C12.3828 14.4444 12.5392 14.2384 12.6172 14.1483C12.9219 13.7968 13.3426 13.254 13.5313 12.9843C13.7199 12.7145 13.5702 12.305 13.4803 12.05C13.0938 10.953 12.7663 10.0347 12.5 9.49989Z"
                    fill="white"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_87_7264"
                      x1={26.5}
                      y1={7}
                      x2={4}
                      y2={28}
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#5BD066" />
                      <stop offset={1} stopColor="#27B43E" />
                    </linearGradient>
                  </defs>
                </svg>
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${postUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <svg
                  width="30px"
                  height="30px"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx={24} cy={24} r={20} fill="#3B5998" />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M29.315 16.9578C28.6917 16.8331 27.8498 16.74 27.3204 16.74C25.8867 16.74 25.7936 17.3633 25.7936 18.3607V20.1361H29.3774L29.065 23.8137H25.7936V35H21.3063V23.8137H19V20.1361H21.3063V17.8613C21.3063 14.7453 22.7708 13 26.4477 13C27.7252 13 28.6602 13.187 29.8753 13.4363L29.315 16.9578Z"
                    fill="white"
                  />
                </svg>
              </a>
            </div>

            {/* Copy Link */}
            <button
              onClick={handleCopy}
              className="w-full bg-[#EB4463] text-white px-4 py-2 rounded-lg text-semibold flex justify-center items-center space-x-2"
            >
              <svg
                fill="white"
                width="20px"
                height="20px"
                viewBox="0 0 512 512"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>{"link"}</title>
                <path d="M48 226Q48 191 72 168 95 144 130 144L165 144Q191 144 211 157 231 170 240 192L129 192Q115 192 106 202 96 211 96 225L96 287Q96 301 106 311 115 320 129 320L240 320Q231 342 211 355 191 368 165 368L130 368Q95 368 72 345 48 321 48 286L48 226ZM464 286Q464 321 441 345 417 368 382 368L347 368Q321 368 301 355 281 342 272 320L383 320Q397 320 407 311 416 301 416 287L416 225Q416 211 407 202 397 192 383 192L272 192Q281 170 301 157 321 144 347 144L382 144Q417 144 441 168 464 191 464 226L464 286ZM144 232L368 232 368 280 144 280 144 232Z" />
              </svg>
              <span className="font-semibold ">
                {copied ? "Copied" : "Copy link"}
              </span>
            </button>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className={`${
                darkMode ? "text-white" : "text-black"
              } mt-4 text-sm underline w-full text-center`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareSystem;
