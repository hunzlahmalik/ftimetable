import React from "react";
import { Checkbox, Row, Divider } from "antd";
import { SectionInputProps } from "./interfaces";
import "antd/dist/antd.css";

const { Group } = Checkbox;

const style = { padding: "8px 8px 8px 8px" };

export const SectionInput = (props: SectionInputProps): JSX.Element => {
  const {
    course: courseTitle,
    data: sections,
    dataHandler: dataHandler,
  } = props;

  const [checkedList, setCheckedList] = React.useState<string[]>([]);
  const [indeterminate, setIndeterminate] = React.useState(false);
  const [checkAll, setCheckAll] = React.useState(false);

  React.useEffect(() => {
    dataHandler(courseTitle, checkedList);
  }, [checkedList]);

  const onChange = (list: any) => {
    setCheckedList(list);
    setIndeterminate(!!list.length && list.length < sections.length);
    setCheckAll(list.length === sections.length);
    // dataHandler(courseTitle, checkedList);
  };

  const onCheckAllChange = (e: any) => {
    console.log(`checkdeAll ${e.target.checked}`);
    setCheckedList(e.target.checked ? sections : []);
    setIndeterminate(false);
    setCheckAll(e.target.checked);
    console.log(courseTitle);
    console.log(checkedList);
    // dataHandler(courseTitle, checkedList);
  };

  return (
    <Row style={style}>
      <div>{courseTitle}:</div>
      <Divider type="vertical" />
      <Checkbox
        indeterminate={indeterminate}
        onChange={onCheckAllChange}
        checked={checkAll}
      >
        Check all
      </Checkbox>
      <Divider type="vertical" />
      <Group options={sections} value={checkedList} onChange={onChange} />
    </Row>
  );
};
