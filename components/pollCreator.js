import { use, useState } from "react";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import { useRouter } from "next/router";
import supabase from "@/hooks/authenticateUser";
import Spinner from "./spinner";

function PollCreator({ setNewPost, darkMode, setOpenPoll, userNumId, postLoading, setPostLoading, errorMsg, setErrorMsg, communityId, community, fetchPosts }) {
  const router = useRouter()
  const { fullPageReload } = PageLoadOptions();

  const [pollTopic, setPollTopic] = useState("")
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState(["", ""]); // Start with two empty choices
  const [days, setDays] = useState(1);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  // Handle question text changes
  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  // Handle choice text changes
  const handleChoiceChange = (index, event) => {
    const updatedChoices = [...choices];
    updatedChoices[index] = event.target.value;
    setChoices(updatedChoices);
  };

  // Add a new choice field
  const addChoiceField = () => {
    if (choices.length < 5){
      setChoices([...choices, ""]);
    }
  };

  // Remove a choice field
  const removeChoiceField = (index) => {
    const updatedChoices = [...choices];
    updatedChoices.splice(index, 1);
    setChoices(updatedChoices);
  };

  // Reset the entire poll form
  const removePoll = () => {
    setQuestion("");
    setChoices(["", ""]);
    setDays(1);
    setHours(0);
    setMinutes(0);
    setOpenPoll(false);
  };

  const createPoll = async () => {
    const now = new Date();
    const totalMs = (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60) * 1000;
    const expiresDate = new Date(now.getTime() + totalMs);
    if (!userNumId) {
      fullPageReload("/signin");
      return;
    }
    setPostLoading(true);

    if (question.trim() === "" || pollTopic.trim() === "" || choices[0] === "" || choices[1] === ""){
      setPostLoading(false);
      setErrorMsg('Fill All Fields')
      return
    }

    if (question.trim() !== "") {
      if (communityId !== null && communityId !== undefined && communityId !== '') {

        const {data, error} = await supabase.from("community_posts").insert({
          userid: userNumId,
          content: pollTopic,
          ispoll: true,
          communityid: parseInt(communityId),
        }).select('id') 

        if (error){
          setErrorMsg("Failed to post");
          setPostLoading(false);
          return
        }
        const postid = data?.[0]?.id
        console.log(postid)

        await supabase.from("community_polls").insert({
          postid: postid,
          question: question,
          options: choices,
          expires_at: expiresDate
        })
        fullPageReload(
          `/communities/${community}`.replace(" ", "+"), "window");


      } else {
       const {data, error} = await supabase.from("posts").insert({
          userid: userNumId,
          content: pollTopic,
          ispoll: true
        }).select('id')
        if (error){
          setErrorMsg("Failed to post. Post is empty");
          return
        }
        const postid = data?.[0]?.id

        await supabase.from("polls").insert({
          postid: postid,
          question: question,
          options: choices,
          expires_at: expiresDate
        })

        // fullPageReload("/home");
        fetchPosts();
        if (setNewPost !== null && setNewPost !== undefined){
          setNewPost(false)
        }
      }
    } else {
      setPostLoading(false);
      setErrorMsg("Failed to post. Post is empty");
    }
    removePoll()
    if (router.pathname === "/create" && question.trim() !== "") {
      router.push("/home");
    }
    setPostLoading(false);
  };

  return (
    <span className="text-sm w-full space-y-2 flex flex-col justify-center">
      <span className="font-semibold">Open a poll</span>
      <span
        className={`w-full rounded-md border flex justify-center ${
          darkMode
            ? "bg-[#27292F] border-[#32353C] text-white"
            : "bg-[#F9F9F9] border-[#EEEDEF]"
        }`}
      >
        
        <textarea
          value={pollTopic}
          placeholder={`Poll Topic`}
          onChange={(e) => {
            if (e.target.value && e.target.value.length < 35) {
              setPollTopic(e.target.value);
            } else if (!e.target.value){
              setPollTopic('')
            }
          }}
          className={`text-sm resize-none w-full bg-transparent ${
            darkMode ? "placeholder:text-gray-400 text-white" : "text-black"
          } h-8 placeholder:text-xs border-none focus:outline-none focus:ring-0`}
        />
      </span>
      <span
        className={`w-full rounded-md border flex justify-center ${
          darkMode
            ? "bg-[#27292F] border-[#32353C] text-white"
            : "bg-[#F9F9F9] border-[#EEEDEF]"
        }`}
      >
        
        <textarea
          value={question}
          placeholder={`Question?`}
          onChange={handleQuestionChange}
          className={`text-sm resize-none w-full bg-transparent ${
            darkMode ? "placeholder:text-gray-400 text-white" : "text-black"
          } h-8 placeholder:text-xs border-none focus:outline-none focus:ring-0`}
        />
      </span>

      {choices.map((choice, index) => (
        <span
          className={`w-full rounded-md border flex justify-center ${
            darkMode
              ? "bg-[#27292F] border-[#32353C] text-white"
              : "bg-[#F9F9F9] border-[#EEEDEF]"
          }`}
          key={index}
        >
          <input
            type="text"
            placeholder={`Choice ${index + 1}`}
            value={choice}
            onChange={(e) => handleChoiceChange(index, e)}
            className={`text-sm resize-none w-full bg-transparent ${
              darkMode ? "placeholder:text-gray-400 text-white" : "text-black"
            } h-8 placeholder:text-xs border-none focus:outline-none focus:ring-0`}
          />
          {choices.length > 2 && (
            <span
              className="rounded-r-md cursor-pointer text-white flex bg-[#EB4463] justify-center items-center px-2 font-semibold"
              onClick={() => removeChoiceField(index)}
            >
              Remove
            </span>
          )}
        </span>
      ))}

      <span
        className={`text-white w-fit py-1.5 px-2.5 rounded font-semibold ${choices.length !== 5 ? 'bg-[#EB4463] cursor-pointer' : 'bg-gray-500 cursor-disabled'}`}
        onClick={addChoiceField}
      >
        + Add another choice
      </span>

      <span className="flex flex-col space-y-1.5">
        <span className="font-semibold">Poll length</span>
        <span className="flex flex-row items-center space-x-1.5">
          <span className="flex flex-row items-center space-x-1">
            <label className="font-semibold">Days</label>
            <input
              className={`${
                darkMode
                  ? "bg-[#27292F] border-[#32353C] text-white"
                  : "bg-[#F9F9F9] border-[#EEEDEF]"
              } rounded-md border-none focus:outline-none focus:ring-0`}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            />
          </span>
          <span className="flex flex-row items-center space-x-1">
            <label className="font-semibold">Hrs</label>
            <input
              className={`${
                darkMode
                  ? "bg-[#27292F] border-[#32353C] text-white"
                  : "bg-[#F9F9F9] border-[#EEEDEF]"
              } rounded-md border-none focus:outline-none focus:ring-0`}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
            />
          </span>
          <span className="flex flex-row items-center space-x-1">
            <label className="font-semibold">Mins</label>
            <input
              className={`${
                darkMode
                  ? "bg-[#27292F] border-[#32353C] text-white"
                  : "bg-[#F9F9F9] border-[#EEEDEF]"
              } rounded-md border-none focus:outline-none focus:ring-0`}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            />
          </span>
        </span>
      </span>
      <span className="w-28 mx-auto flex flex-col justify-center pt-2 items-center space-y-4">
      {errorMsg !== "" && (
          <span className="text-sm w-full flex flex-row justify-center items-center">
            <svg
              fill="red"
              width="20px"
              height="20px"
              viewBox="0 -8 528 528"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>{"fail"}</title>
              <path d="M264 456Q210 456 164 429 118 402 91 356 64 310 64 256 64 202 91 156 118 110 164 83 210 56 264 56 318 56 364 83 410 110 437 156 464 202 464 256 464 310 437 356 410 402 364 429 318 456 264 456ZM264 288L328 352 360 320 296 256 360 192 328 160 264 224 200 160 168 192 232 256 168 320 200 352 264 288Z" />
            </svg>
            <p className="text-red-500">{errorMsg}</p>
          </span>
        )}

      {postLoading ? (
          <span className="mx-auto">
            <Spinner spinnerSize={"medium"} />
          </span> ) : <span
          className={`rounded w-full mx-auto hover:shadow cursor-pointer py-1.5 bg-[#EB4463] text-sm font-medium text-center text-white`}
          onClick={createPoll}
        >
          Post
        </span>}
        <span
          className="cursor-pointer flex flex-row justify-center space-x-1 text-white bg-gray-900 py-1.5 rounded w-full"
          onClick={removePoll}
        >
          <span>Remove</span>
          <span>poll</span>
        </span>
      </span>
    </span>
  );
}

export default PollCreator;
