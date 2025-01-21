import React, { useState } from "react";
import { MentionsInput, Mention } from "react-mentions";
// import "./styles.css"; // Import styles for react-mentions or create custom styles

const MentionEditor = () => {
  const [value, setValue] = useState("");

  // Example data for mentions
  const users = [
    { id: "1", display: "John Doe" },
    { id: "2", display: "Jane Smith" },
    { id: "3", display: "Alice Johnson" },
  ];

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleAddMention = (id, display) => {
    console.log(`Mention added: ID=${id}, Display=${display}`);
  };


  // Function to handle dropdown item selection
  const getMentionAgentList = (priority) => {
    setLoading(true)
    if (priority && priority !== '') {
      changeTicketPriority(id, priority).then(response => {
        setSelectedPriority(priority);
        setIsGetAcitivityLogs((prev) => !prev)
      }).catch((error) => {
        if (error?.response?.data?.errorDescription) {
          toast.error(error?.response?.data?.errorDescription);
        } else {
          toast.error(error?.message ?? "FAILED TO FETCH TICKET DETAILS");
        }
      }).finally(() => {
        setLoading(false)
      })
    }
  };



  return (
    <div className="mention-editor">
      <MentionsInput
        value={value}
        onChange={handleChange}
        placeholder="Type @ to mention someone"
        className="mentions"
        singleLine={false}
      >
        <Mention
          trigger="@"
          data={users}
          onAdd={handleAddMention}
          className="mention"
        />
      </MentionsInput>
    </div>
  );
};

export default MentionEditor;
