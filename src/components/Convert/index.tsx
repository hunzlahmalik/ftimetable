import { Button, Modal } from "antd";
import { triggerFocus } from "antd/lib/input/Input";
import React from "react";
import { XLSXParser } from "../../modules/xlsx/XLSXParser";
import { ConvertProps } from "./interfaces";

export class Convert extends React.Component {
  defaultFileType = "json";

  fileNames = {
    json: "courses.json",
    csv: "courses.csv",
    text: "courses.txt",
  };
  state = {
    loading: false,
    visible: false,
    fileType: this.defaultFileType,
    fileDownloadUrl: null,
    status: "",
    data: null as unknown as ConvertProps,
  };
  // setState({
  //   visible: true,
  // });
  constructor(props) {
    // this.setState({
    //   visible: true,
    // });
    console.log("visible");
    super(props);
    this.state.data = props.courses;
    this.changeFileType = this.changeFileType.bind(this);
    this.download = this.download.bind(this);
  }

  changeFileType(event: React.ChangeEvent<HTMLSelectElement>): void {
    const value = event.target.value;
    this.setState({ fileType: value });
  }

  download(event: React.ChangeEvent<HTMLButtonElement>): void {
    event.preventDefault();
    // Prepare the file
    let output = "";
    if (this.state.fileType === "json") {
      output = JSON.stringify({ states: this.state.data }, null, 4);
    } else if (this.state.fileType === "csv") {
      output = XLSXParser.to_csv(this.state.data.courses);
    } else if (this.state.fileType === "text") {
      output = XLSXParser.to_lststr(this.state.data.courses);
    }
    // Download it
    const blob = new Blob([output]);
    const fileDownloadUrl = URL.createObjectURL(blob);
    this.setState({ fileDownloadUrl: fileDownloadUrl }, () => {
      this.dofileDownload.click();
      URL.revokeObjectURL(fileDownloadUrl); // free up storage--no longer needed.
      this.setState({ fileDownloadUrl: "" });
    });
  }

  showModal = (): void => {
    this.setState({
      visible: true,
    });
  };

  handleOk = (): void => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.setState({ loading: false, visible: false });
    }, 3000);
  };

  handleCancel = (): void => {
    this.setState({ visible: false });
  };

  render(): JSX.Element {
    const { visible, loading } = this.state;
    return (
      <>
        {/* <Button type="primary" onClick={this.showModal}>
          Converter
        </Button> */}
        <Modal
          visible={true}
          title="Converter"
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <>
              <form>
                <span className="mr">File type:</span>
                <select
                  name="fileType"
                  onChange={this.changeFileType}
                  value={this.state.fileType}
                  className="mr"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="text">Text</option>
                </select>

                <button onClick={this.download}>Download the file!</button>

                <a
                  className="hidden"
                  download={this.fileNames[this.state.fileType]}
                  href={this.state.fileDownloadUrl}
                  ref={(e) => (this.dofileDownload = e)}
                ></a>
              </form>
              <Button key="back" onClick={this.handleCancel}>
                Return
              </Button>
            </>,
          ]}
        >
          Download the parsed data.
        </Modal>
      </>
    );
  }
}

// ReactDOM.render(<Con />, document.getElementById("root"));
