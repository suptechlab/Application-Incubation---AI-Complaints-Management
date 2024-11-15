import React from "react";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import "./SuneditorReact.scss";
import { useTranslation } from "react-i18next";

const SunEditorReact = ({
  id,
  name,
  error,
  touched,
  label,
  content,
  handleChange,
  handleBlur,
  dir,
  wrapperClassName = "mb-3 pb-1",
  height,
}) => {
  const { i18n } = useTranslation();
  return (
    <div className={wrapperClassName || ""}>
      {label ? (
        <label className="mb-1 fs-14" htmlFor={id}>
          {label}
        </label>
      ) : (
        ""
      )}
      <div className={`sun-editor-cover ${touched && error ? "is-invalid" : ""}`}>
        <SunEditor
          name="name"
          setOptions={{
            buttonList: [
              ["undo", "redo"],
              ["font", "fontSize", "formatBlock"],
              ["bold", "underline", "italic", "strike", "removeFormat"],
              ["link", "image"],
              ["fontColor", "hiliteColor", "textStyle"],
              ["outdent", "indent"],
              ["align", "horizontalRule", "list", "table"],
              ["fullScreen", "showBlocks", "codeView"],
              ["preview", "print"],
            ],
            defaultStyle: {
              "font-size": "14px",
              "font-family": "Arial, sans-serif",
            },
          }}
          onBlur={handleBlur}
          onChange={handleChange}
          setContents={content}
          height={height}
          lang={i18n.language}
        />
      </div>
      {touched && error && (
        <small className="form-text text-danger">{error}</small>
      )}
    </div>
  );
};

export default SunEditorReact;
