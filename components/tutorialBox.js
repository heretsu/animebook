import exploreAsset from "@/assets/tutorials/onboarding_explore.png";
import communityAsset from "@/assets/tutorials/onboarding_communities.png";
import shopAsset from "@/assets/tutorials/onboarding_shop.png";
import switchAsset from "@/assets/tutorials/onboarding_switch.png";
import sailAsset from "@/assets/tutorials/onboarding_setsail.png";
import Image from "next/image";
import { useState } from "react";

export function ProgressStepper({
  step,
  setStep,
  graduateTutorial,
  setGraduate,
}) {
  const totalSteps = 5;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      graduateTutorial();
      setGraduate(true);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="flex items-center justify-between w-fit space-x-8 max-w-md mx-auto">
      <button
        onClick={prevStep}
        disabled={step === 1}
        className={`text-sm font-semibold ${
          step === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500"
        }`}
      >
        Back
      </button>

      <div className="flex space-x-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all ${
              index + 1 === step ? "w-4 bg-[#EB4463]" : "w-2 bg-gray-400"
            }`}
          ></span>
        ))}
      </div>

      <button
        onClick={nextStep}
        className={`text-sm font-semibold text-[#EB4463]`}
      >
        Next
      </button>
    </div>
  );
}

export default function TutorialBox({ graduateTutorial, setGraduate }) {
  const [step, setStep] = useState(1);

  return (
    <>
      <div className="hidden lg:flex relative h-screen space-x-10 flex-row w-full items-center justify-between px-10">
        <span className="h-[80vh] w-[20%] py-2 space-y-2 flex flex-col justify-start items-start">
          <span
            className={`${
              step === 1 ? "visible" : "invisible"
            } w-full bg-white rounded text-[#EA334E] p-2.5 text-start font-semibold text-start cursor-pointer flex flex-row space-x-2 items-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16.318"
              height="16.318"
              viewBox="0 0 22.318 22.318"
            >
              <g
                id="Layer_32"
                data-name="Layer 32"
                transform="translate(-3 -2.998)"
              >
                <path
                  id="Pfad_4696"
                  data-name="Pfad 4696"
                  d="M24.933,9.54a.77.77,0,0,1-1.418.414.385.385,0,0,0-.591-.072,1.539,1.539,0,0,1-2.22-.093A.377.377,0,0,0,20.4,9.66a.385.385,0,0,0-.294.162A1.154,1.154,0,1,1,19.161,8a1.137,1.137,0,0,1,.715.251.385.385,0,0,0,.588-.137,1.536,1.536,0,0,1,2.907.408.385.385,0,0,0,.521.3.735.735,0,0,1,.271-.05.77.77,0,0,1,.77.77ZM5.309,5.692a1.137,1.137,0,0,1,.715.251.385.385,0,0,0,.588-.137,1.536,1.536,0,0,1,2.907.408.385.385,0,0,0,.521.3.735.735,0,0,1,.271-.05.77.77,0,1,1-.648,1.184.385.385,0,0,0-.591-.072,1.539,1.539,0,0,1-2.22-.093.385.385,0,0,0-.6.033,1.154,1.154,0,1,1-.94-1.821ZM3,14.158A11.126,11.126,0,0,1,4.5,8.587a1.9,1.9,0,0,0,2.09-.3,2.369,2.369,0,0,0,2.7.1,1.539,1.539,0,1,0,1.024-2.69c-.044,0-.088,0-.131.006a2.286,2.286,0,0,0-1.3-1.367A11.132,11.132,0,0,1,22.266,6.5a2.283,2.283,0,0,0-2.279.917,1.9,1.9,0,0,0-.825-.185,1.924,1.924,0,1,0,1.277,3.36,2.369,2.369,0,0,0,2.7.1,1.52,1.52,0,0,0,1.691.231,11.074,11.074,0,0,1-1.75,9.922l-3.633-5.738a2.854,2.854,0,0,0-2.423-1.333H11.292a2.854,2.854,0,0,0-2.424,1.333L5.237,20.843A11.168,11.168,0,0,1,3,14.158Zm16.605,2.635a1.919,1.919,0,0,1-1.214.443,1.893,1.893,0,0,1-1.385-.6.385.385,0,0,0-.646.147,2.306,2.306,0,0,1-2.125,1.6.374.374,0,0,0-.077-.007,2.306,2.306,0,0,1-2.2-1.6.385.385,0,0,0-.647-.148,1.893,1.893,0,0,1-1.385.6,1.924,1.924,0,0,1-1.21-.44l.8-1.27a2.088,2.088,0,0,1,1.773-.975h5.733a2.088,2.088,0,0,1,1.773.975ZM3.314,25.317,8.3,17.445a2.676,2.676,0,0,0,3.144.081,3.073,3.073,0,0,0,2.629,1.624.407.407,0,0,0,.087.01,3.071,3.071,0,0,0,2.716-1.625,2.676,2.676,0,0,0,3.147-.083L25,25.317Z"
                  transform="translate(0 0)"
                  fill={"#EA334E"}
                />
              </g>
            </svg>

            <span>Explore</span>
          </span>
          <span
            className={`${
              step === 2 ? "visible" : "invisible"
            } w-full bg-white rounded text-[#EA334E] p-2.5 text-start font-semibold text-start cursor-pointer flex flex-row space-x-2 items-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17.318"
              height="20.966"
              viewBox="0 0 22.318 25.966"
            >
              <g id="maneki-neko" transform="translate(-38.923 -24.871)">
                <path
                  id="Pfad_4672"
                  data-name="Pfad 4672"
                  d="M85.59,158.787a2.831,2.831,0,0,1,.762-2.625,4.848,4.848,0,0,1-.692-.613c-.681.472-2.026.95-4.666,1.118a1.714,1.714,0,0,1-3.384,0,13.315,13.315,0,0,1-3.788-.674,3.711,3.711,0,0,0,.052,1.2,1.9,1.9,0,0,0,.6,1.038,3.3,3.3,0,0,0,.756.42,3.034,3.034,0,0,1,1.044.657,2.027,2.027,0,0,1,.495,1.374,3.437,3.437,0,0,1,.862.517,2.365,2.365,0,0,1,.9,1.618,2.511,2.511,0,0,1-.856,2.032c.989,0,2.294,0,3.254,0a2.51,2.51,0,0,1-.855-2.031,2.365,2.365,0,0,1,.9-1.618,4.154,4.154,0,0,1,3.045-.823c1.981.191,3.5,1.536,3.445,3.03a3.754,3.754,0,0,0,.643-.631,3.556,3.556,0,0,0,.731-1.842c-.081.005-.161.009-.241.009A2.983,2.983,0,0,1,85.59,158.787Z"
                  transform="translate(-30.587 -114.612)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4673"
                  data-name="Pfad 4673"
                  d="M41.272,198.384a6.619,6.619,0,0,1-.383-.616,3.62,3.62,0,0,0,.744,2.03,3.749,3.749,0,0,0,.647.637,2.211,2.211,0,0,1,.13-.819A6.068,6.068,0,0,1,41.272,198.384Z"
                  transform="translate(-1.724 -151.64)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4674"
                  data-name="Pfad 4674"
                  d="M175.462,163.206h-.036a2.648,2.648,0,0,1-1.162-.305,2.312,2.312,0,0,0-.71,2.2,2.494,2.494,0,0,0,2.753,1.732,6.7,6.7,0,0,0-.171-1.437A19.515,19.515,0,0,0,175.462,163.206Z"
                  transform="translate(-118.026 -121.059)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4675"
                  data-name="Pfad 4675"
                  d="M62.9,203.571a1.837,1.837,0,0,0-.7-1.25,2.789,2.789,0,0,0-.572-.362c-.008.038-.015.076-.024.114a2.982,2.982,0,0,1-1.2,1.792,2.854,2.854,0,0,1-1.588.458,3.429,3.429,0,0,1-.863-.112,4.518,4.518,0,0,1-1.309-.585,1.666,1.666,0,0,0-.045.556,1.836,1.836,0,0,0,.7,1.25,3.666,3.666,0,0,0,2.648.7C61.69,205.965,63.014,204.816,62.9,203.571Z"
                  transform="translate(-15.497 -155.316)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4676"
                  data-name="Pfad 4676"
                  d="M132.534,199.06c-.139-.013-.278-.02-.416-.02a3.529,3.529,0,0,0-2.232.721,1.836,1.836,0,0,0-.7,1.25c-.112,1.245,1.212,2.394,2.951,2.562a3.667,3.667,0,0,0,2.648-.7,1.836,1.836,0,0,0,.7-1.25c.112-1.245-1.212-2.394-2.951-2.562Z"
                  transform="translate(-79.156 -152.755)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4677"
                  data-name="Pfad 4677"
                  d="M74.665,151.376q-.047.2-.082.411a12.171,12.171,0,0,0,3.714.678,1.71,1.71,0,0,1,.441-.9H76.051A5.3,5.3,0,0,1,74.665,151.376Z"
                  transform="translate(-31.275 -110.952)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4678"
                  data-name="Pfad 4678"
                  d="M128.765,150.432a1.71,1.71,0,0,1,.441.9c2.545-.164,3.745-.613,4.311-.989-.077-.1-.14-.186-.19-.258a5.29,5.29,0,0,1-1.876.343Z"
                  transform="translate(-78.796 -109.823)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4679"
                  data-name="Pfad 4679"
                  d="M110.091,152.877a1.174,1.174,0,1,0,.211,0Z"
                  transform="translate(-61.481 -112.268)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4680"
                  data-name="Pfad 4680"
                  d="M44.937,142.952a2.5,2.5,0,0,1-2.144,2.473,5.135,5.135,0,0,0,3.194,3.005A2.534,2.534,0,0,0,48,148.157a2.436,2.436,0,0,0,.972-1.467,1.718,1.718,0,0,0-.287-1.566,2.6,2.6,0,0,0-.869-.531,3.749,3.749,0,0,1-.879-.5,2.44,2.44,0,0,1-.784-1.332,4.345,4.345,0,0,1-.054-1.481,8,8,0,0,1,.166-.971,5.336,5.336,0,0,1-2-1.358,9.051,9.051,0,0,0-1.108,1.494c-.018.032-.036.064-.054.1a2.5,2.5,0,0,1,1.832,2.407Z"
                  transform="translate(-3.394 -100.058)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4681"
                  data-name="Pfad 4681"
                  d="M41,157.814a1.955,1.955,0,0,0-1.547-1.914,5.037,5.037,0,0,0-.262,3.865A1.96,1.96,0,0,0,41,157.814Z"
                  transform="translate(0 -114.92)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4682"
                  data-name="Pfad 4682"
                  d="M118.306,111.569h-.036l.037.009.037-.009h-.038Z"
                  transform="translate(-69.591 -76.038)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4683"
                  data-name="Pfad 4683"
                  d="M52.452,40.068H60.33a4.766,4.766,0,0,0,3.607-1.65,3.664,3.664,0,0,0,.411-.866,3.464,3.464,0,0,0,.113-2.023A1.954,1.954,0,0,1,63.3,34.469a2.544,2.544,0,0,1,.5-2.714,2.8,2.8,0,0,1,1.1-.909,4.755,4.755,0,0,0-.405-.942.27.27,0,0,1-.032-.09A7.8,7.8,0,0,0,62.4,25.593a1.968,1.968,0,0,0-1.536-.717c-1.1.088-2.1,1.476-2.835,2.49a.27.27,0,0,1-.219.112h-2.91a.27.27,0,0,1-.219-.112c-.731-1.013-1.733-2.4-2.835-2.49q-.057,0-.113,0a2.049,2.049,0,0,0-1.423.722,6.664,6.664,0,0,0-.907,1.136,2.63,2.63,0,0,1,.993.264c.443-.617.95-1.087,1.252-1.121.786-.1,1.424.779,1.89,1.423a.27.27,0,0,1-.158.422l-.208.048a13.174,13.174,0,0,0-1.59.446,3.1,3.1,0,0,1-.483,3.23,3.183,3.183,0,0,1-2.44,1.2,2.672,2.672,0,0,1-.979-.184v2.831a4.782,4.782,0,0,0,4.777,4.777Zm6.8-12.773c.467-.645,1.106-1.528,1.9-1.423.527.058,1.691,1.468,2.03,2.656a.27.27,0,0,1-.368.322,15.179,15.179,0,0,0-3.192-1.085l-.208-.048a.27.27,0,0,1-.158-.422ZM61.79,33l-.406.357a1.776,1.776,0,0,0-2.6-.005l-.349-.413A2.321,2.321,0,0,1,61.79,33Zm-6.6,3.7a1.889,1.889,0,0,0,.894-1.207,1.541,1.541,0,0,1-1.023-1.061.271.271,0,0,1,.1-.293,2.393,2.393,0,0,1,1.229-.412h0a2.4,2.4,0,0,1,1.227.406.271.271,0,0,1,.105.293A1.54,1.54,0,0,1,56.7,35.493,1.889,1.889,0,0,0,57.6,36.7a1.573,1.573,0,0,0,1.423-.32l.3.453a2.522,2.522,0,0,1-1.355.477,1.509,1.509,0,0,1-.567-.108,2.021,2.021,0,0,1-1-1.018,2.021,2.021,0,0,1-1,1.018,1.509,1.509,0,0,1-.567.108,2.521,2.521,0,0,1-1.355-.477l.3-.453A1.573,1.573,0,0,0,55.186,36.7Zm-.838-3.763L54,33.35a1.765,1.765,0,0,0-2.6,0L50.992,33A2.321,2.321,0,0,1,54.348,32.937Z"
                  transform="translate(-7.675 0)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4684"
                  data-name="Pfad 4684"
                  d="M50.784,48.161a2.552,2.552,0,0,0,.393-2.7c-.314.121-.672.269-1.094.452a.27.27,0,0,1-.368-.322,4.712,4.712,0,0,1,.485-1.079,2.142,2.142,0,0,0-1.008-.183,8.506,8.506,0,0,0-.87,2.753.27.27,0,0,1-.027.086,4.725,4.725,0,0,0-.5,1.771,2.469,2.469,0,0,0,2.984-.777Z"
                  transform="translate(-7.785 -17.062)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4685"
                  data-name="Pfad 4685"
                  d="M148.5,37.353c-.38-.046-.8.415-1.145.874a14.213,14.213,0,0,1,2.5.822A4.3,4.3,0,0,0,148.5,37.353Z"
                  transform="translate(-95.102 -10.944)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4686"
                  data-name="Pfad 4686"
                  d="M70.78,37.348h0a4.3,4.3,0,0,0-1.358,1.7,14.209,14.209,0,0,1,2.5-.822C71.574,37.76,71.157,37.3,70.78,37.348Z"
                  transform="translate(-26.748 -10.939)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4687"
                  data-name="Pfad 4687"
                  d="M113.315,102.025a.844.844,0,0,0,.735-.521,1.685,1.685,0,0,0-.735-.2h0a1.682,1.682,0,0,0-.737.206.842.842,0,0,0,.736.516Z"
                  transform="translate(-64.598 -67.034)"
                  fill={"#EA334E"}
                />
                <path
                  id="Pfad_4688"
                  data-name="Pfad 4688"
                  d="M175.83,77.985a2.973,2.973,0,0,0-2.255-1.818,1.994,1.994,0,0,0-1.916.886,2.1,2.1,0,0,0-.457,2.14,1.431,1.431,0,0,0,.809.784c.264.013.43.285.492.809a4.718,4.718,0,0,1-.384,2.351,3.577,3.577,0,0,1-1.958,1.911,3.4,3.4,0,0,0,2.352,1.534c.9.016,1.795-.649,2.647-1.971a7.242,7.242,0,0,0,.67-6.625Z"
                  transform="translate(-115.102 -44.975)"
                  fill={"#EA334E"}
                />
              </g>
            </svg>

            <span>Communities</span>
          </span>
          <span
            className={`${
              step === 3 ? "visible" : "invisible"
            } w-full bg-white rounded text-[#EA334E] p-2.5 pr-24 font-semibold text-start cursor-pointer flex flex-row space-x-2 items-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19.818"
              height="19.842"
              viewBox="0 0 19.818 22.944"
            >
              <g id="layer1" transform="translate(-1.059 -280.596)">
                <path
                  id="path4503"
                  d="M10.968,280.6a13,13,0,0,0-6.938,1.846,5.7,5.7,0,0,0-2.97,4.655v9.943a5.7,5.7,0,0,0,2.97,4.655,13,13,0,0,0,6.938,1.846,13,13,0,0,0,6.936-1.846,5.7,5.7,0,0,0,2.973-4.655V287.1a5.7,5.7,0,0,0-2.973-4.655A13,13,0,0,0,10.968,280.6Zm0,.765a12.384,12.384,0,0,1,6.575,1.739,4.356,4.356,0,0,1,0,7.995,12.384,12.384,0,0,1-6.575,1.739,12.394,12.394,0,0,1-6.578-1.739,4.358,4.358,0,0,1,0-7.995A12.394,12.394,0,0,1,10.968,281.361Zm0,1.911A9.977,9.977,0,0,0,6.3,284.32,3.353,3.353,0,0,0,4.244,287.1a3.161,3.161,0,0,0,1.729,2.578c3.55-1.015,5.919-3.268,6.4-6.319a12.045,12.045,0,0,0-1.408-.083Zm2.1.188A8.741,8.741,0,0,1,11.488,287a9.387,9.387,0,0,0,5.833,1.365,2.434,2.434,0,0,0,.371-1.27,3.357,3.357,0,0,0-2.064-2.778,8.7,8.7,0,0,0-2.558-.859Zm-2.044,4.13a9.686,9.686,0,0,1-4.08,2.582,10.521,10.521,0,0,0,4.021.746,9.968,9.968,0,0,0,4.661-1.047,5.311,5.311,0,0,0,1.023-.715,10.1,10.1,0,0,1-5.625-1.566Z"
                  transform="translate(0 0)"
                  fill={"#EA334E"}
                />
              </g>
            </svg>

            <span>{"Earn & Shop"}</span>
          </span>
        </span>
        <span className="my-auto w-[40%] flex flex-col justify-center items-center">
          {step === 4 && (
            <span className="absolute top-7 flex flex-row space-x-2">
              <span className="space-y-0.5 flex flex-col justify-center items-center">
                <span
                  className={
                    "h-fit w-fit text-[0.65rem] flex flex-row justify-between space-x-1 font-semibold p-1 rounded border bg-[#F9F9F9] border-[#EEEDEF]"
                  }
                >
                  <span
                    className={`rounded w-full justify-center cursor-pointer flex flex-row border bg-[#FFFFFF] border-[#EEEDEF] py-0.5 px-4 items-center`}
                  >
                    For You
                  </span>
                  <span
                    className={
                      "w-full justify-center cursor-pointer py-0.5 px-4 flex items-center text-[#5D6879]"
                    }
                  >
                    Following
                  </span>
                </span>
                <span className="text-sm text-white font-bold">Home</span>
              </span>
              <span className="space-y-0.5 flex flex-col justify-center items-center">
                <span
                  className={
                    "h-fit w-fit text-[0.65rem] flex flex-row justify-between space-x-1 font-semibold p-1 rounded border bg-[#F9F9F9] border-[#EEEDEF]"
                  }
                >
                  <span
                    className={`rounded w-full justify-center cursor-pointer flex flex-row border bg-[#FFFFFF] border-[#EEEDEF] py-0.5 px-4 items-center`}
                  >
                    Public
                  </span>
                  <span
                    className={
                      "w-full justify-center cursor-pointer py-0.5 px-4 flex items-center text-[#5D6879]"
                    }
                  >
                    Premium
                  </span>
                </span>
                <span className="text-sm text-white font-bold">Profile</span>
              </span>
            </span>
          )}

          <span className="relative text-center mx-auto w-full p-1.5 flex flex-col bg-white rounded-2xl">
            <span
              className={`${
                step === 1
                  ? "from-[#EB4463]"
                  : step === 2
                  ? "from-[#C444EB]"
                  : step === 3
                  ? "from-[#44B8EB]"
                  : step === 4
                  ? "from-[#91EB44]"
                  : "from-[#EBE544] via-[#F8C8C4]"
              } relative flex bg-gradient-to-b to-white rounded-t-2xl`}
            >
               
               {step === 1 ? (
                <Image
                  src={exploreAsset}
                  alt="tutorial"
                  width={800}
                  height={800}
                  className="object-contain h-full w-full"
                />
              ) : step === 2 ? (
                <Image
                  src={communityAsset}
                  alt="tutorial"
                  width={800}
                  height={800}
                  className="object-contain h-full w-full"
                />
              ) : step === 3 ? (
                <Image
                  src={shopAsset}
                  alt="tutorial"
                  width={800}
                  height={800}
                  className="object-contain h-full w-full"
                />
              ) : step === 4 ? (
                <Image
                  src={switchAsset}
                  alt="tutorial"
                  width={800}
                  height={800}
                  className="object-contain h-full w-full"
                />
              ) : (
                <Image
                  src={sailAsset}
                  alt="tutorial"
                  width={800}
                  height={800}
                  className="object-contain h-full w-full"
                />
              )}
            </span>

            <span className="pt-4 text-xl font-bold">
              {step === 1
                ? "Explore Content"
                : step === 2
                ? "Communities"
                : step === 3
                ? "Earn & Shop"
                : step === 4
                ? "The Switch"
                : step === 5
                ? "Ready to set sail"
                : ""}
            </span>
            <span className="pt-1 text-sm font-light flex flex-col justify-center">
              {step === 1 ? (
                <>
                  <span>A galaxy of captivating media, artfully</span>
                  <span>created for you to discover.</span>
                </>
              ) : step === 2 ? (
                <>
                  <span>A vibrant hub of communities, connecting</span>
                  <span>your interests with thousands of people.</span>
                </>
              ) : step === 3 ? (
                <>
                  <span>How to earn money on Anime Book and shop</span>
                  <span>exclusive content to upgrade your profile.</span>
                </>
              ) : step === 4 ? (
                <>
                  <span>On some pages you may see a switch to</span>
                  <span>{"change content, e.g. on Home and Profiles."}</span>
                </>
              ) : step === 5 ? (
                <>
                  <span>
                    {"That's it with the intro. Have fun exploring the"}
                  </span>
                  <span>{"best web3 anime social media platform!"}</span>
                </>
              ) : (
                ""
              )}
            </span>

            <span className="py-7">
              <ProgressStepper
                step={step}
                setStep={setStep}
                setGraduate={setGraduate}
                graduateTutorial={graduateTutorial}
              />
            </span>
            <span
              onClick={() => {
                setGraduate(true);
                graduateTutorial();
              }}
              className="cursor-default text-sm pb-2 underline text-[#5D6879]"
            >
              {"Skip (not recommended)"}
            </span>
          </span>
        </span>
        <span className="w-[20%]"></span>
      </div>

      {/* CYPHER SCREENS DIVIDER */}

      <div className="flex lg:hidden relative h-screen space-x-10 flex-row w-full items-center justify-between px-10">
        <span className="my-auto w-full flex flex-col justify-center items-center">
          {step === 4 && (
            <span className="absolute top-7 flex flex-row space-x-2">
              <span className="space-y-0.5 flex flex-col justify-center items-center">
                <span
                  className={
                    "h-fit w-fit text-[0.65rem] flex flex-row justify-between space-x-1 font-semibold p-1 rounded border bg-[#F9F9F9] border-[#EEEDEF]"
                  }
                >
                  <span
                    className={`rounded w-full justify-center cursor-pointer flex flex-row border bg-[#FFFFFF] border-[#EEEDEF] py-0.5 px-4 items-center`}
                  >
                    For You
                  </span>
                  <span
                    className={
                      "w-full justify-center cursor-pointer py-0.5 px-4 flex items-center text-[#5D6879]"
                    }
                  >
                    Following
                  </span>
                </span>
                <span className="text-sm text-white font-bold">Home</span>
              </span>
              <span className="space-y-0.5 flex flex-col justify-center items-center">
                <span
                  className={
                    "h-fit w-fit text-[0.65rem] flex flex-row justify-between space-x-1 font-semibold p-1 rounded border bg-[#F9F9F9] border-[#EEEDEF]"
                  }
                >
                  <span
                    className={`rounded w-full justify-center cursor-pointer flex flex-row border bg-[#FFFFFF] border-[#EEEDEF] py-0.5 px-4 items-center`}
                  >
                    Public
                  </span>
                  <span
                    className={
                      "w-full justify-center cursor-pointer py-0.5 px-4 flex items-center text-[#5D6879]"
                    }
                  >
                    Premium
                  </span>
                </span>
                <span className="text-sm text-white font-bold">Profile</span>
              </span>
            </span>
          )}

          <span className="relative text-center mx-auto w-full p-1.5 flex flex-col bg-white rounded-2xl">
            <span
              className={`${
                step === 1
                  ? "from-[#EB4463]"
                  : step === 2
                  ? "from-[#C444EB]"
                  : step === 3
                  ? "from-[#44B8EB]"
                  : step === 4
                  ? "from-[#91EB44]"
                  : "from-[#EBE544] via-[#F8C8C4]"
              } relative flex bg-gradient-to-b to-white rounded-t-2xl`}
            >
              
              {step === 1 ? (
                <Image
                  src={exploreAsset}
                  alt="tutorial"
                  width={800}
                  height={800}
                  className="object-contain h-full w-full"
                />
              ) : step === 2 ? (
                <Image
                  src={communityAsset}
                  alt="tutorial"
                  width={800}
                  height={800}
                  className="object-contain h-full w-full"
                />
              ) : step === 3 ? (
                <Image
                  src={shopAsset}
                  alt="tutorial"
                  width={800}
                  height={800}
                  className="object-contain h-full w-full"
                />
              ) : step === 4 ? (
                <Image
                  src={switchAsset}
                  alt="tutorial"
                  width={800}
                  height={800}
                  className="object-contain h-full w-full"
                />
              ) : (
                <Image
                  src={sailAsset}
                  alt="tutorial"
                  width={800}
                  height={800}
                  className="object-contain h-full w-full"
                />
              )}
            </span>

            <span className="pt-4 text-xl font-bold">
              {step === 1
                ? "Explore Content"
                : step === 2
                ? "Communities"
                : step === 3
                ? "Earn & Shop"
                : step === 4
                ? "The Switch"
                : step === 5
                ? "Ready to set sail"
                : ""}
            </span>
            <span className="pt-1 text-sm font-light flex flex-col justify-center">
              {step === 1 ? (
                <>
                  <span>A galaxy of captivating media, artfully</span>
                  <span>created for you to discover.</span>
                </>
              ) : step === 2 ? (
                <>
                  <span>A vibrant hub of communities, connecting</span>
                  <span>your interests with thousands of people.</span>
                </>
              ) : step === 3 ? (
                <>
                  <span>How to earn money on Anime Book and shop</span>
                  <span>exclusive content to upgrade your profile.</span>
                </>
              ) : step === 4 ? (
                <>
                  <span>On some pages you may see a switch to</span>
                  <span>{"change content, e.g. on Home and Profiles."}</span>
                </>
              ) : step === 5 ? (
                <>
                  <span>
                    {"That's it with the intro. Have fun exploring the"}
                  </span>
                  <span>{"best web3 anime social media platform!"}</span>
                </>
              ) : (
                ""
              )}
            </span>

            <span className="py-7">
              <ProgressStepper
                step={step}
                setStep={setStep}
                setGraduate={setGraduate}
                graduateTutorial={graduateTutorial}
              />
            </span>
            <span
              onClick={() => {
                setGraduate(true);
                graduateTutorial();
              }}
              className="cursor-default text-sm pb-2 underline text-[#5D6879]"
            >
              {"Skip (not recommended)"}
            </span>
          </span>
        </span>
      </div>

      <div
        id="anime-book-font"
        className="lg:hidden fixed text-[#5d6879] text-sm bottom-0 w-full"
      >
        <div
          className={`border-t bg-white border-[#EEEDEF] mx-auto w-full flex flex-row justify-between items-center py-2 px-3`}
        >
          <span className="flex flex-col justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19.858"
              height="20.987"
              viewBox="0 0 19.858 20.987"
            >
              <g id="torii-gate" transform="translate(0 -42.669)">
                <g
                  id="Gruppe_3248"
                  data-name="Gruppe 3248"
                  transform="translate(0 42.669)"
                >
                  <path
                    id="Pfad_4689"
                    data-name="Pfad 4689"
                    d="M19.759,42.854a.368.368,0,0,0-.4-.173,38.6,38.6,0,0,1-9.425,1.037A38.592,38.592,0,0,1,.5,42.681a.368.368,0,0,0-.4.173.638.638,0,0,0-.069.534l.827,2.623a.44.44,0,0,0,.347.328c.019,0,.84.1,2.083.2l-.109,2.423H2.068a.479.479,0,0,0-.414.525v2.1a.479.479,0,0,0,.414.525h.956L2.483,63.1a.612.612,0,0,0,.112.392.378.378,0,0,0,.3.166H4.551a.471.471,0,0,0,.413-.492l.545-11.051h8.841l.545,11.051a.471.471,0,0,0,.413.492h1.655a.378.378,0,0,0,.3-.166.612.612,0,0,0,.112-.392l-.541-10.985h.956a.479.479,0,0,0,.414-.525v-2.1a.479.479,0,0,0-.414-.525H16.68l-.109-2.423c1.243-.107,2.064-.2,2.083-.2A.44.44,0,0,0,19,46.012l.827-2.623A.638.638,0,0,0,19.759,42.854ZM8.688,48.965H5.662l.1-2.24c.926.057,1.921.1,2.921.125v2.114Zm2.482,0V46.851c1-.023,1.995-.069,2.921-.125l.1,2.24Z"
                    transform="translate(0 -42.669)"
                    fill={"oklch(0.928 0.006 264.531)"}
                  />
                </g>
              </g>
            </svg>
            <span className={"text-gray-200"}>Home</span>
          </span>

          <span className="flex flex-col justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22.318"
              height="22.318"
              viewBox="0 0 22.318 22.318"
            >
              <g
                id="Layer_32"
                data-name="Layer 32"
                transform="translate(-3 -2.998)"
              >
                <path
                  id="Pfad_4696"
                  data-name="Pfad 4696"
                  d="M24.933,9.54a.77.77,0,0,1-1.418.414.385.385,0,0,0-.591-.072,1.539,1.539,0,0,1-2.22-.093A.377.377,0,0,0,20.4,9.66a.385.385,0,0,0-.294.162A1.154,1.154,0,1,1,19.161,8a1.137,1.137,0,0,1,.715.251.385.385,0,0,0,.588-.137,1.536,1.536,0,0,1,2.907.408.385.385,0,0,0,.521.3.735.735,0,0,1,.271-.05.77.77,0,0,1,.77.77ZM5.309,5.692a1.137,1.137,0,0,1,.715.251.385.385,0,0,0,.588-.137,1.536,1.536,0,0,1,2.907.408.385.385,0,0,0,.521.3.735.735,0,0,1,.271-.05.77.77,0,1,1-.648,1.184.385.385,0,0,0-.591-.072,1.539,1.539,0,0,1-2.22-.093.385.385,0,0,0-.6.033,1.154,1.154,0,1,1-.94-1.821ZM3,14.158A11.126,11.126,0,0,1,4.5,8.587a1.9,1.9,0,0,0,2.09-.3,2.369,2.369,0,0,0,2.7.1,1.539,1.539,0,1,0,1.024-2.69c-.044,0-.088,0-.131.006a2.286,2.286,0,0,0-1.3-1.367A11.132,11.132,0,0,1,22.266,6.5a2.283,2.283,0,0,0-2.279.917,1.9,1.9,0,0,0-.825-.185,1.924,1.924,0,1,0,1.277,3.36,2.369,2.369,0,0,0,2.7.1,1.52,1.52,0,0,0,1.691.231,11.074,11.074,0,0,1-1.75,9.922l-3.633-5.738a2.854,2.854,0,0,0-2.423-1.333H11.292a2.854,2.854,0,0,0-2.424,1.333L5.237,20.843A11.168,11.168,0,0,1,3,14.158Zm16.605,2.635a1.919,1.919,0,0,1-1.214.443,1.893,1.893,0,0,1-1.385-.6.385.385,0,0,0-.646.147,2.306,2.306,0,0,1-2.125,1.6.374.374,0,0,0-.077-.007,2.306,2.306,0,0,1-2.2-1.6.385.385,0,0,0-.647-.148,1.893,1.893,0,0,1-1.385.6,1.924,1.924,0,0,1-1.21-.44l.8-1.27a2.088,2.088,0,0,1,1.773-.975h5.733a2.088,2.088,0,0,1,1.773.975ZM3.314,25.317,8.3,17.445a2.676,2.676,0,0,0,3.144.081,3.073,3.073,0,0,0,2.629,1.624.407.407,0,0,0,.087.01,3.071,3.071,0,0,0,2.716-1.625,2.676,2.676,0,0,0,3.147-.083L25,25.317Z"
                  transform="translate(0 0)"
                  fill={step === 1 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
              </g>
            </svg>
            <span
              className={
                step === 1 ? "text-[#EB4463] font-semibold" : "text-gray-200"
              }
            >
              Explore
            </span>
          </span>
          {/* </span> */}

          <span className="flex flex-col justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="Layer_2"
              data-name="Layer 2"
              width="25"
              height="25"
              viewBox="0 0 25 25"
            >
              <g id="_01.Add" data-name="01.Add">
                <path
                  id="Pfad_4737"
                  data-name="Pfad 4737"
                  d="M19.243,0H5.757A5.773,5.773,0,0,0,0,5.757V19.243A5.773,5.773,0,0,0,5.757,25H19.243A5.773,5.773,0,0,0,25,19.243V5.757A5.773,5.773,0,0,0,19.243,0Zm-1.61,13.577H13.839a.22.22,0,0,0-.222.222v3.8a1.117,1.117,0,0,1-2.234,0V13.8a.22.22,0,0,0-.222-.222H7.367a1.117,1.117,0,0,1,0-2.234h3.794a.22.22,0,0,0,.222-.222V7.327a1.117,1.117,0,0,1,2.234,0v3.794a.22.22,0,0,0,.222.227h3.794a1.117,1.117,0,1,1,0,2.234Z"
                  fill={"oklch(0.928 0.006 264.531)"}
                />
              </g>
            </svg>

            <span className={"text-gray-200"}>Post</span>
          </span>

          <span className="flex flex-col justify-center items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22.318"
              height="25.966"
              viewBox="0 0 22.318 25.966"
            >
              <g id="maneki-neko" transform="translate(-38.923 -24.871)">
                <path
                  id="Pfad_4672"
                  data-name="Pfad 4672"
                  d="M85.59,158.787a2.831,2.831,0,0,1,.762-2.625,4.848,4.848,0,0,1-.692-.613c-.681.472-2.026.95-4.666,1.118a1.714,1.714,0,0,1-3.384,0,13.315,13.315,0,0,1-3.788-.674,3.711,3.711,0,0,0,.052,1.2,1.9,1.9,0,0,0,.6,1.038,3.3,3.3,0,0,0,.756.42,3.034,3.034,0,0,1,1.044.657,2.027,2.027,0,0,1,.495,1.374,3.437,3.437,0,0,1,.862.517,2.365,2.365,0,0,1,.9,1.618,2.511,2.511,0,0,1-.856,2.032c.989,0,2.294,0,3.254,0a2.51,2.51,0,0,1-.855-2.031,2.365,2.365,0,0,1,.9-1.618,4.154,4.154,0,0,1,3.045-.823c1.981.191,3.5,1.536,3.445,3.03a3.754,3.754,0,0,0,.643-.631,3.556,3.556,0,0,0,.731-1.842c-.081.005-.161.009-.241.009A2.983,2.983,0,0,1,85.59,158.787Z"
                  transform="translate(-30.587 -114.612)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4673"
                  data-name="Pfad 4673"
                  d="M41.272,198.384a6.619,6.619,0,0,1-.383-.616,3.62,3.62,0,0,0,.744,2.03,3.749,3.749,0,0,0,.647.637,2.211,2.211,0,0,1,.13-.819A6.068,6.068,0,0,1,41.272,198.384Z"
                  transform="translate(-1.724 -151.64)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4674"
                  data-name="Pfad 4674"
                  d="M175.462,163.206h-.036a2.648,2.648,0,0,1-1.162-.305,2.312,2.312,0,0,0-.71,2.2,2.494,2.494,0,0,0,2.753,1.732,6.7,6.7,0,0,0-.171-1.437A19.515,19.515,0,0,0,175.462,163.206Z"
                  transform="translate(-118.026 -121.059)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4675"
                  data-name="Pfad 4675"
                  d="M62.9,203.571a1.837,1.837,0,0,0-.7-1.25,2.789,2.789,0,0,0-.572-.362c-.008.038-.015.076-.024.114a2.982,2.982,0,0,1-1.2,1.792,2.854,2.854,0,0,1-1.588.458,3.429,3.429,0,0,1-.863-.112,4.518,4.518,0,0,1-1.309-.585,1.666,1.666,0,0,0-.045.556,1.836,1.836,0,0,0,.7,1.25,3.666,3.666,0,0,0,2.648.7C61.69,205.965,63.014,204.816,62.9,203.571Z"
                  transform="translate(-15.497 -155.316)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4676"
                  data-name="Pfad 4676"
                  d="M132.534,199.06c-.139-.013-.278-.02-.416-.02a3.529,3.529,0,0,0-2.232.721,1.836,1.836,0,0,0-.7,1.25c-.112,1.245,1.212,2.394,2.951,2.562a3.667,3.667,0,0,0,2.648-.7,1.836,1.836,0,0,0,.7-1.25c.112-1.245-1.212-2.394-2.951-2.562Z"
                  transform="translate(-79.156 -152.755)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4677"
                  data-name="Pfad 4677"
                  d="M74.665,151.376q-.047.2-.082.411a12.171,12.171,0,0,0,3.714.678,1.71,1.71,0,0,1,.441-.9H76.051A5.3,5.3,0,0,1,74.665,151.376Z"
                  transform="translate(-31.275 -110.952)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4678"
                  data-name="Pfad 4678"
                  d="M128.765,150.432a1.71,1.71,0,0,1,.441.9c2.545-.164,3.745-.613,4.311-.989-.077-.1-.14-.186-.19-.258a5.29,5.29,0,0,1-1.876.343Z"
                  transform="translate(-78.796 -109.823)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4679"
                  data-name="Pfad 4679"
                  d="M110.091,152.877a1.174,1.174,0,1,0,.211,0Z"
                  transform="translate(-61.481 -112.268)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4680"
                  data-name="Pfad 4680"
                  d="M44.937,142.952a2.5,2.5,0,0,1-2.144,2.473,5.135,5.135,0,0,0,3.194,3.005A2.534,2.534,0,0,0,48,148.157a2.436,2.436,0,0,0,.972-1.467,1.718,1.718,0,0,0-.287-1.566,2.6,2.6,0,0,0-.869-.531,3.749,3.749,0,0,1-.879-.5,2.44,2.44,0,0,1-.784-1.332,4.345,4.345,0,0,1-.054-1.481,8,8,0,0,1,.166-.971,5.336,5.336,0,0,1-2-1.358,9.051,9.051,0,0,0-1.108,1.494c-.018.032-.036.064-.054.1a2.5,2.5,0,0,1,1.832,2.407Z"
                  transform="translate(-3.394 -100.058)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4681"
                  data-name="Pfad 4681"
                  d="M41,157.814a1.955,1.955,0,0,0-1.547-1.914,5.037,5.037,0,0,0-.262,3.865A1.96,1.96,0,0,0,41,157.814Z"
                  transform="translate(0 -114.92)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4682"
                  data-name="Pfad 4682"
                  d="M118.306,111.569h-.036l.037.009.037-.009h-.038Z"
                  transform="translate(-69.591 -76.038)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4683"
                  data-name="Pfad 4683"
                  d="M52.452,40.068H60.33a4.766,4.766,0,0,0,3.607-1.65,3.664,3.664,0,0,0,.411-.866,3.464,3.464,0,0,0,.113-2.023A1.954,1.954,0,0,1,63.3,34.469a2.544,2.544,0,0,1,.5-2.714,2.8,2.8,0,0,1,1.1-.909,4.755,4.755,0,0,0-.405-.942.27.27,0,0,1-.032-.09A7.8,7.8,0,0,0,62.4,25.593a1.968,1.968,0,0,0-1.536-.717c-1.1.088-2.1,1.476-2.835,2.49a.27.27,0,0,1-.219.112h-2.91a.27.27,0,0,1-.219-.112c-.731-1.013-1.733-2.4-2.835-2.49q-.057,0-.113,0a2.049,2.049,0,0,0-1.423.722,6.664,6.664,0,0,0-.907,1.136,2.63,2.63,0,0,1,.993.264c.443-.617.95-1.087,1.252-1.121.786-.1,1.424.779,1.89,1.423a.27.27,0,0,1-.158.422l-.208.048a13.174,13.174,0,0,0-1.59.446,3.1,3.1,0,0,1-.483,3.23,3.183,3.183,0,0,1-2.44,1.2,2.672,2.672,0,0,1-.979-.184v2.831a4.782,4.782,0,0,0,4.777,4.777Zm6.8-12.773c.467-.645,1.106-1.528,1.9-1.423.527.058,1.691,1.468,2.03,2.656a.27.27,0,0,1-.368.322,15.179,15.179,0,0,0-3.192-1.085l-.208-.048a.27.27,0,0,1-.158-.422ZM61.79,33l-.406.357a1.776,1.776,0,0,0-2.6-.005l-.349-.413A2.321,2.321,0,0,1,61.79,33Zm-6.6,3.7a1.889,1.889,0,0,0,.894-1.207,1.541,1.541,0,0,1-1.023-1.061.271.271,0,0,1,.1-.293,2.393,2.393,0,0,1,1.229-.412h0a2.4,2.4,0,0,1,1.227.406.271.271,0,0,1,.105.293A1.54,1.54,0,0,1,56.7,35.493,1.889,1.889,0,0,0,57.6,36.7a1.573,1.573,0,0,0,1.423-.32l.3.453a2.522,2.522,0,0,1-1.355.477,1.509,1.509,0,0,1-.567-.108,2.021,2.021,0,0,1-1-1.018,2.021,2.021,0,0,1-1,1.018,1.509,1.509,0,0,1-.567.108,2.521,2.521,0,0,1-1.355-.477l.3-.453A1.573,1.573,0,0,0,55.186,36.7Zm-.838-3.763L54,33.35a1.765,1.765,0,0,0-2.6,0L50.992,33A2.321,2.321,0,0,1,54.348,32.937Z"
                  transform="translate(-7.675 0)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4684"
                  data-name="Pfad 4684"
                  d="M50.784,48.161a2.552,2.552,0,0,0,.393-2.7c-.314.121-.672.269-1.094.452a.27.27,0,0,1-.368-.322,4.712,4.712,0,0,1,.485-1.079,2.142,2.142,0,0,0-1.008-.183,8.506,8.506,0,0,0-.87,2.753.27.27,0,0,1-.027.086,4.725,4.725,0,0,0-.5,1.771,2.469,2.469,0,0,0,2.984-.777Z"
                  transform="translate(-7.785 -17.062)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4685"
                  data-name="Pfad 4685"
                  d="M148.5,37.353c-.38-.046-.8.415-1.145.874a14.213,14.213,0,0,1,2.5.822A4.3,4.3,0,0,0,148.5,37.353Z"
                  transform="translate(-95.102 -10.944)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4686"
                  data-name="Pfad 4686"
                  d="M70.78,37.348h0a4.3,4.3,0,0,0-1.358,1.7,14.209,14.209,0,0,1,2.5-.822C71.574,37.76,71.157,37.3,70.78,37.348Z"
                  transform="translate(-26.748 -10.939)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4687"
                  data-name="Pfad 4687"
                  d="M113.315,102.025a.844.844,0,0,0,.735-.521,1.685,1.685,0,0,0-.735-.2h0a1.682,1.682,0,0,0-.737.206.842.842,0,0,0,.736.516Z"
                  transform="translate(-64.598 -67.034)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
                <path
                  id="Pfad_4688"
                  data-name="Pfad 4688"
                  d="M175.83,77.985a2.973,2.973,0,0,0-2.255-1.818,1.994,1.994,0,0,0-1.916.886,2.1,2.1,0,0,0-.457,2.14,1.431,1.431,0,0,0,.809.784c.264.013.43.285.492.809a4.718,4.718,0,0,1-.384,2.351,3.577,3.577,0,0,1-1.958,1.911,3.4,3.4,0,0,0,2.352,1.534c.9.016,1.795-.649,2.647-1.971a7.242,7.242,0,0,0,.67-6.625Z"
                  transform="translate(-115.102 -44.975)"
                  fill={step === 2 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
              </g>
            </svg>
            <span
              className={
                step === 2 ? "text-[#EB4463] font-semibold" : "text-gray-200"
              }
            >
              {"Community"}
            </span>
            {/* </span> */}
          </span>

          <span className={"flex flex-col justify-center items-center"}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24.818"
              height="24.842"
              viewBox="0 0 19.818 22.944"
            >
              <g id="layer1" transform="translate(-1.059 -280.596)">
                <path
                  id="path4503"
                  d="M10.968,280.6a13,13,0,0,0-6.938,1.846,5.7,5.7,0,0,0-2.97,4.655v9.943a5.7,5.7,0,0,0,2.97,4.655,13,13,0,0,0,6.938,1.846,13,13,0,0,0,6.936-1.846,5.7,5.7,0,0,0,2.973-4.655V287.1a5.7,5.7,0,0,0-2.973-4.655A13,13,0,0,0,10.968,280.6Zm0,.765a12.384,12.384,0,0,1,6.575,1.739,4.356,4.356,0,0,1,0,7.995,12.384,12.384,0,0,1-6.575,1.739,12.394,12.394,0,0,1-6.578-1.739,4.358,4.358,0,0,1,0-7.995A12.394,12.394,0,0,1,10.968,281.361Zm0,1.911A9.977,9.977,0,0,0,6.3,284.32,3.353,3.353,0,0,0,4.244,287.1a3.161,3.161,0,0,0,1.729,2.578c3.55-1.015,5.919-3.268,6.4-6.319a12.045,12.045,0,0,0-1.408-.083Zm2.1.188A8.741,8.741,0,0,1,11.488,287a9.387,9.387,0,0,0,5.833,1.365,2.434,2.434,0,0,0,.371-1.27,3.357,3.357,0,0,0-2.064-2.778,8.7,8.7,0,0,0-2.558-.859Zm-2.044,4.13a9.686,9.686,0,0,1-4.08,2.582,10.521,10.521,0,0,0,4.021.746,9.968,9.968,0,0,0,4.661-1.047,5.311,5.311,0,0,0,1.023-.715,10.1,10.1,0,0,1-5.625-1.566Z"
                  transform="translate(0 0)"
                  fill={step === 3 ? "#EB4463" : "oklch(0.928 0.006 264.531)"}
                />
              </g>
            </svg>

            <span
              className={
                step === 3 ? "text-[#EB4463] font-semibold" : "text-gray-200"
              }
            >
              Earn
            </span>
            {/* </span> */}
          </span>
        </div>
      </div>
    </>
  );
}
