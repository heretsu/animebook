import React, { useEffect, useState } from "react";
import newLogo from "../../assets/newLogo.png";
import Image from "next/image";
import supabase from "@/hooks/authenticateUser";

const CustomizeStreamModal = ({
  isOpen,
  onClose,
  onStartStream,
  darkMode,
  schedule,
  formData,
  setFormData,
}) => {
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [scheduleSet, setScheduleSet] = useState(false);
  const [mediaName, setMediaName] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (tags) => {
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Upload single thumbnail if selected
    if (mediaFile && mediaFile.length > 0) {
      const file = mediaFile[0]; // Just get the one file

      // Validate file type
      if (file.type.startsWith("video/")) {
        setErrorMsg("Video not accepted");
        return;
      }

      // Validate file size (optional - 5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("File too large (max 5MB)");
        return;
      }

      try {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from("mediastore")
          .upload(`live/${fileName}`, file);

        if (error) {
          console.error("Upload error:", error);
          setErrorMsg("Upload failed");
          return;
        }

        const thumbnailUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mediastore/${data.path}`;
        setFormData((prev) => ({ ...prev, thumbnail_url: thumbnailUrl }))
      } catch (error) {
        console.error("Upload error:", error);
        setErrorMsg("Upload failed");
        return;
      }
    }

    if (schedule) {
      onStartStream().then(() => {
        setScheduleSet(true);
      });
    } else {
      onStartStream().then(() => {
        onClose();
      });
    }
  };

  const mediaChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setMediaName(file.name);
      setMediaFile(e.target.files);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        onClose();
      }}
    >
      {scheduleSet ? (
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="flex flex-col justify-center items-center w-full text-white text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40px"
                height="40px"
                viewBox="0 0 22 22.002"
              >
                <defs>
                  <linearGradient
                    id="bellGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" style={{ stopColor: "#667eea" }} />
                    <stop offset="100%" style={{ stopColor: "#ec4899" }} />
                  </linearGradient>
                </defs>
                <g id="bell" transform="translate(-1 0.002)">
                  <path
                    id="Pfad_4717"
                    data-name="Pfad 4717"
                    d="M11,20a22.61,22.61,0,0,1-2.47-.15,2.494,2.494,0,0,0,4.94,0A22.61,22.61,0,0,1,11,20Z"
                    transform="translate(1)"
                    fill="url(#bellGradient)"
                  />
                  <path
                    id="Pfad_4718"
                    data-name="Pfad 4718"
                    fill="url(#bellGradient)"
                    d="M22.7,16.69C21.35,17.99,15.839,19,12,19S2.65,17.99,1.3,16.69a.933.933,0,0,1-.176-1.14A16.59,16.59,0,0,0,3.2,8,7.468,7.468,0,0,1,5.719,2.29,9.08,9.08,0,0,1,12,0a9.08,9.08,0,0,1,6.281,2.29A7.468,7.468,0,0,1,20.8,8a16.59,16.59,0,0,0,2.079,7.55A.933.933,0,0,1,22.7,16.69Z"
                  />
                </g>
              </svg>
              <span className="mt-2 text-lg font-semibold">
                {"Stream Scheduled!"}
              </span>
              <p className="mt-1 mb-8">
                Your stream has been scheduled to go live on{" "}
                <strong>
                  {new Date(formData.scheduledDate).toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </strong>
              </p>
              <button className="btn-primary" onClick={onClose}>
                {"Got it!"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <span>{schedule ? "Plan a Stream" : "Customize Stream"}</span>
              <button className="close-btn" onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {schedule && (
                <div className="form-group">
                  <label htmlFor="scheduledDate">
                    <span>Stream Date & Time</span>
                    <span className="ml-1 text-[#EA334E]">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledDate"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}

              {/* Stream Title */}
              <div className="form-group">
                <label htmlFor="title">
                  <span>Stream Title</span>
                  <span className="ml-1 text-[#EA334E]">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter your stream title"
                  required
                  maxLength={40}
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="category">
                  <span>Category</span>
                  <span className="ml-1 text-[#EA334E]">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="anime">Anime Discussion</option>
                  <option value="gaming">Gaming</option>
                  <option value="art">Art & Drawing</option>
                  <option value="music">Music</option>
                  <option value="just-chatting">Just Chatting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <TagsInput
                tags={formData.tags}
                setTags={handleTagsChange}
                maxTags={5}
              />

              <div className="form-group">
                <label htmlFor="description">Notification Message</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Let your followers know what you'll be streaming"
                  maxLength={25}
                />
              </div>

              <div className="form-group">
                <label htmlFor="thumbnail">
                  <span>Thumbnail</span>
                </label>
                {thumbnailPreview ? (
                  <label
                    onClick={(e) => {
                      mediaChange(e);
                    }}
                    htmlFor="input-post-file"
                  >
                    <Image
                      src={thumbnailPreview}
                      alt="Invalid post media. Click to change"
                      height={300}
                      width={300}
                    />

                    <input
                      onChange={mediaChange}
                      className="hidden"
                      type="file"
                      accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                      id="input-post-file"
                    />
                  </label>
                ) : (
                  <label
                    htmlFor="input-post-file"
                    className="w-full flex justify-center items-center relative cursor-pointer rounded-lg p-2"
                    style={{ border: "1px dashed oklch(44.2% 0.017 285.786)" }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100"
                      height="100"
                      viewBox="0 0 22 22"
                      className="m-auto"
                    >
                      <path
                        id="image"
                        d="M17,0H5A5,5,0,0,0,0,5V17a5,5,0,0,0,5,5H17a5,5,0,0,0,5-5V5a5,5,0,0,0-5-5ZM6.07,5a2,2,0,1,1-2,2,2,2,0,0,1,2-2ZM20,17a3.009,3.009,0,0,1-3,3H5a3.009,3.009,0,0,1-3-3v-.24l3.8-3.04a.668.668,0,0,1,.73-.05l2.84,1.7a2.624,2.624,0,0,0,3.36-.54l3.94-4.61a.642.642,0,0,1,.47-.22.614.614,0,0,1,.47.19L20,12.57Z"
                        fill={darkMode ? "#6A6B71" : "#4a5764"}
                      />
                    </svg>

                    <input
                      onChange={mediaChange}
                      className="hidden"
                      type="file"
                      accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                      id="input-post-file"
                    />
                  </label>
                )}
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  <span>{schedule ? "Schedule Stream" : "Start Stream"}</span>
                </button>
              </div>
            </form>
          </div>
          <div className="modal-mascot">
            <div className="mascot-bubble">Let's go live!</div>
            <span className="relative h-12 w-12 flex flex-shrink-0 rounded-full">
              <Image
                src={newLogo}
                alt="logo"
                width={70}
                height={70}
                className="rounded-full"
              />
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-container {
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-content {
          background: ${darkMode ? "#1e1f24" : "white"};
          border-radius: 24px;
          padding: 32px;
          position: relative;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .modal-header span {
          font-size: 24px;
          font-weight: 700;
          // background: linear-gradient(135deg, #667eea 0%, #ec4899 100%);
          // -webkit-background-clip: text;
          // -webkit-text-fill-color: transparent;
          // background-clip: text;
          color: ${darkMode ? "white" : "black"};
          margin: 0;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #ffffff;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .form-group {
          margin-bottom: 10px;
          position: relative;
        }

        .form-group label {
          display: block;
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .form-group input[type="text"],
        .form-group textarea,
        .form-group select,
        .form-group input[type="datetime-local"] {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 14px 16px;
          color: #ffffff;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .form-group input[type="text"]:focus,
        .form-group textarea:focus,
        .form-group select:focus,
        .form-group input[type="datetime-local"] {
          outline: none;
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-group input[type="datetime-local"]:focus {
          outline: none;
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-group input[type="datetime-local"] {
          cursor: pointer;
          color-scheme: dark;
        }

        .form-group
          input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        .form-group input[type="datetime-local"] {
          border: none;
          box-shadow: 0 0 0 1px transparent;
          color: ${darkMode ? "white" : "black"};
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-label span {
          color: #e2e8f0;
          font-size: 15px;
          font-weight: 500;
        }

        .schedule-checkbox {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #667eea;
          border-radius: 6px;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-group select {
          cursor: pointer;
        }

        .char-count {
          position: absolute;
          right: 0;
          top: 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        .thumbnail-upload {
          margin-top: 8px;
        }

        .upload-placeholder {
          display: flex;
          width: fit-content;
          flex-direction: column;
          align-items: center;
          text-align: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.03);
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 25px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .upload-placeholder:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(99, 102, 241, 0.5);
        }

        .upload-placeholder svg {
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 12px;
          margin: auto;
        }

        .upload-placeholder span {
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 500;
          margin: auto;
        }

        .upload-hint {
          color: rgba(255, 255, 255, 0.4) !important;
          font-size: 12px !important;
          margin-top: 4px;
        }

        .thumbnail-preview {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
        }

        .thumbnail-preview img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }

        .remove-thumbnail {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .remove-thumbnail:hover {
          background: rgba(239, 68, 68, 0.9);
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }

        .btn-secondary,
        .btn-primary {
          flex: 1;
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #ec4899 100%);
          color: white;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .btn-primary:hover::before {
          left: 100%;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(99, 102, 241, 0.4);
        }

        .modal-mascot {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          // background: linear-gradient(135deg, #667eea 0%, #ec4899 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .mascot-bubble {
          position: absolute;
          bottom: 60px;
          right: -10px;
          background: white;
          color: #1a1f35;
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .mascot-bubble::after {
          content: "";
          position: absolute;
          bottom: -6px;
          right: 20px;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid white;
        }

        /* Scrollbar styling */
        .modal-container::-webkit-scrollbar {
          width: 8px;
        }

        .modal-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .modal-container::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 4px;
        }

        .modal-container::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }

        @media (max-width: 640px) {
          .modal-content {
            padding: 24px;
          }

          .modal-header span {
            font-size: 24px;
          }

          .modal-actions {
            flex-direction: column;
          }

          .mascot-bubble {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export const TagsInput = ({ tags, setTags, maxTags = 5 }) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim().toLowerCase();

    if (trimmedValue && !tags.includes(trimmedValue) && tags.length < maxTags) {
      setTags([...tags, trimmedValue]);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="form-group">
      <label htmlFor="tags">{"Tags (Optional)"}</label>

      <div className="tags-input-container">
        {tags.map((tag, index) => (
          <div key={index} className="tag-chip">
            <span>{tag}</span>
            <button
              type="button"
              className="tag-remove"
              onClick={() => removeTag(index)}
              aria-label={`Remove ${tag} tag`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ))}

        <input
          type="text"
          id="tags"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          maxLength={20}
          disabled={tags.length >= maxTags}
        />
      </div>

      <span className="char-count">
        {tags.length}/{maxTags} tags
      </span>

      <style jsx>{`
        .form-group {
          margin-bottom: 10px;
          position: relative;
        }
        *:focus {
          outline: none;
        }

        #tags:focus {
          box-shadow: 0 0 0 3px transparent;
        }

        .form-group label {
          display: block;
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .tag-hint {
          font-size: 12px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.4);
        }

        .tags-input-container {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 8px 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          min-height: 48px;
          transition: all 0.2s;
          box-sizing: border-box;
        }

        .tags-input-container:focus-within {
          border-color: rgba(99, 102, 241, 0.5);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .tag-remove {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          padding: 0;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .tag-remove:hover {
          color: #ffffff;
        }

        .tags-input-container input {
          flex: 1;
          min-width: 120px;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 15px;
          font-family: inherit;
          padding: 4px 0;
        }

        .tags-input-container input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .tags-input-container input:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .char-count {
          position: absolute;
          right: 0;
          top: 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
};

export default CustomizeStreamModal;
