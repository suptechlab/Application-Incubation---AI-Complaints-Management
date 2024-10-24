import React from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

const SunEditorReact = ({ id, name, error, touched, label, content, handleChange, handleBlur, dir }) => {


  return (
    <div className="mb-3 position-relative w-100">
      {label ? <label className='mb-1 fs-14' htmlFor={id}>{label}</label> : ""}

      <SunEditor
        setOptions={{
          buttonList: [
            ['undo', 'redo'],
            ['font', 'fontSize', 'formatBlock'],
            ['bold', 'underline', 'italic', 'strike', 'removeFormat'],
            ['fontColor', 'hiliteColor', 'textStyle'],
            ['outdent', 'indent'],
            ['align', 'horizontalRule', 'list', 'table'],
            ['link', 'image'],
            ['fullScreen', 'showBlocks', 'codeView'],
            ['preview', 'print']
            // ['save', 'template']
          ],
          defaultStyle: {
            'font-size': '14px', // Set your desired default font size
            'font-family': 'Arial, sans-serif', // Set your desired default font family
            // Add other default styles as needed
          },
        }}

        onBlur={handleBlur}
        onChange={handleChange}
        setContents={content}
      />

      {touched && error && <small className="form-text text-danger">{error}</small>}

      {/* {
                errorsField || touched ? <span className='text-danger'>
                    {errorsField}
                </span> : ""
            } */}

      {/* <button onClick={handleSubmit}>Submit Data</button> */}
    </div>

  );
}

export default SunEditorReact;
