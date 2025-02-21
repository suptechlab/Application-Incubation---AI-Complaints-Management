import React, { useRef } from "react";

const AutoResizeTextArea = (props) => {
  const textareaRef = useRef(null);

  const handleInput = () => {
    const textarea = textareaRef.current;
    textarea.style.height = "auto"; // Reset height to auto
    textarea.style.height = `${Math.min(textarea.scrollHeight, 7 * 24)}px`; // Limit to 7 rows
  };
  return (
    <textarea ref={textareaRef}
      rows="1"
      onInput={handleInput}
      style={{ minHeight: "24px", maxHeight: "168px", overflowY: "auto", resize: "none" }}
      {...props} />
  )
};

export default AutoResizeTextArea;
