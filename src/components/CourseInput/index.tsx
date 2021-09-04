import React from "react";
import { Select } from "antd";
import { CourseInputProps } from "./interfaces";

const { Option } = Select;

export const CourseInput = (props: CourseInputProps): JSX.Element => {
  const { data: courses, dataHandler: dataHandler } = props;

  function handleChange(value: any) {
    console.log(`selected ${value}`);
    dataHandler(value);
  }

  return (
    <Select
      mode="multiple"
      style={{ width: "100%" }}
      placeholder="select one course"
      onChange={handleChange}
      optionLabelProp="label"
    >
      {courses.map((course, index) => {
        return (
          <Option key={index} value={course} label={course}>
            <div className="demo-option-label-item">{course}</div>
          </Option>
        );
      })}
    </Select>
  );
};
