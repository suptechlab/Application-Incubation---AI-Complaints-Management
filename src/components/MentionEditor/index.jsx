import React, { useCallback, useEffect, useState } from "react";
import { MentionsInput, Mention } from "react-mentions";
import { getAgentsListForTagging } from "../../services/ticketmanagement.service";
import toast from "react-hot-toast";
import defaultStyle from "./defaultStyle";

const MentionEditor = ({ id, name, height,error,touched,value,handleChange,handleBlur, ticketId }) => {
  // const [value, setValue] = useState("");

  const [agents, setAgents] = useState([])

  const [loading, setLoading] = useState(false)

  // Example data for mentions
  const users = [
    { id: "1", display: "John Doe" },
    { id: "2", display: "Jane Smith" },
    { id: "3", display: "Alice Johnson" },
  ];

  // const handleChange = (event) => {
  //   setValue(event.target.value);
  // };



  // Function to handle dropdown item selection
  const getMentionAgentList = () => {
    setLoading(true)
    getAgentsListForTagging(ticketId).then(response => {
      const agentList = response?.data

      const transformedData = agentList.map(item => ({
        id: item.id,
        display: item.name,
        email: item.email
      }));

      // console.log(transformedData);
      setAgents(transformedData)
    }).catch((error) => {
      setAgents([])
      if (error?.response?.data?.errorDescription) {
        toast.error(error?.response?.data?.errorDescription);
      } else {
        toast.error(error?.message ?? "FAILED TO FETCH TICKET DETAILS");
      }
    }).finally(() => {
      setLoading(false)
    })

  };

  useEffect(() => {
    if (ticketId) {
      getMentionAgentList()
    }
  }, [ticketId])

  const displayTransformHandler = useCallback(
    (id, display) => {
      const user = users.find((item) => item.id === id);
      return `@${user?.firstName || display}`;
    },
    [users]
  );


  const renderUserSuggestion = useCallback(
    (suggestion, search, highlightedDisplay, index, focused) => {
      const agent = agents[index];
      if (!agent) {
        return suggestion.display;
      }
      return (
        <div className="my-suggestion__wrapper">
          {/* <img className="my-suggestion__photo" src={agent.photo} alt="" /> */}
          <div className="my-suggestion__name">{agent.display}</div>
        </div>
      );
    },
    [agents]
  );
  return (
    <div className="mention-editor">
      <MentionsInput
        id={id}
        name={name}
        onBlur={handleBlur}
        value={value}
        onChange={handleChange}
        style={defaultStyle}
        disabled={loading ?? false}
      >
        <Mention
          trigger="@"
          data={agents}
          renderSuggestion={renderUserSuggestion}
          style={{ backgroundColor: "rgba(0, 123, 255, 0.25)" }}
          displayTransform={displayTransformHandler}
        />
      </MentionsInput>
      {touched && error && (
        <small className="form-text text-danger">{error}</small>
      )}
    </div>
  );
};

export default MentionEditor;
