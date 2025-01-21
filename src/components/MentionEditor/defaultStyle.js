

export default {
  control: {
    backgroundColor: "#fff",
    fontSize: 14,
    fontWeight: "normal"
  },

  "&multiLine": {
    control: {
      minHeight: 100,
    },
    highlighter: {
      padding: 9,
      border: "1px solid transparent"
    },
    input: {
      padding: 9,
      border : 'none',
      outline : 'none'
      // border: "1px solid silver"
    }
  },

  "&singleLine": {
    display: "inline-block",
    width: 180,

    highlighter: {
      padding: 1,
      border: "2px inset transparent"
    },
    // input: {
    //   padding: 1,
    //   border: "2px inset"
    // }
  },

  suggestions: {
    zIndex :'1111',
    backgroundColor:"white",
    list: {
      backgroundColor: "white",
      border: "1px solid rgba(0,0,0,0.15)",
      fontSize: 14
    },
    item: {
      padding: "5px 15px",
      borderBottom: "1px solid rgba(0,0,0,0.15)",
      "&focused": {
        backgroundColor: "rgba(0, 123, 255, 0.25)"
      }
    }
  }
};
