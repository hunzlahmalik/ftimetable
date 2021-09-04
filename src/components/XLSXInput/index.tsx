import React from "react";
import { Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { XLSXInputProps } from "./interfaces";
import { DraggerProps } from "antd/lib/upload";
import "antd/dist/antd.css";

const { Dragger } = Upload;

/* list of supported file types */
const SheetJSFT = [
  "xlsx",
  "xlsb",
  "xlsm",
  "xls",
  "xml",
  "csv",
  "txt",
  "ods",
  "fods",
  "uos",
  "sylk",
  "dif",
  "dbf",
  "prn",
  "qpw",
  "123",
  "wb*",
  "wq*",
  "html",
  "htm",
]
  .map((x) => `.${x}`)
  .join(",");

export const XLSXInput = (props: XLSXInputProps): JSX.Element => {
  const { dataHandler: fileHandler } = props;

  const outprops: DraggerProps = {
    name: "file",
    accept: SheetJSFT,
    customRequest: ({ file, onSuccess }) => {
      setTimeout(() => {
        if (onSuccess) onSuccess("", "" as unknown as XMLHttpRequest);
        fileHandler(file);
      }, 0);
    },
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <Dragger {...outprops}>
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">
        Click or drag file to this area to upload
      </p>
      <p className="ant-upload-hint">
        Support for a single upload. Strictly prohibit from uploading company
        data or other band files
      </p>
    </Dragger>
  );
};
