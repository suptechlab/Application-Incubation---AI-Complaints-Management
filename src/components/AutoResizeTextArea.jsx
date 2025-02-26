import React, { useRef } from "react";

const AutoResizeTextArea = (props) => {
  const textareaRef = useRef(null);

  const handleInput = () => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; // Reset height to auto
    textarea.style.height = `${Math.min(textarea.scrollHeight, 7 * 24)}px`; // Limit to 7 rows
  };

  const handleKeyDown = (event) => {
    const textarea = textareaRef.current;
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevents new line
      if (props.submitFunction) {
        textarea.style.height = "auto";
        props.submitFunction(); // Calls the submit function
      }
    }
  };


  return (
    <textarea ref={textareaRef}
      rows="1"
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      style={{ minHeight: "24px", maxHeight: "168px", overflowY: "auto", resize: "none" }}
      {...props} />
  )
};

export default AutoResizeTextArea;
