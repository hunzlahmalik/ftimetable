/**
 * @author Hunzlah Malik
 */

import {
  read,
  readFile,
  Range,
  CellAddress,
  WorkSheet,
  utils,
  CellObject,
  WorkBook,
} from "xlsx";

/**
 * Utils that read, write and change XLXS files
 * @class
 */
export class XLSXUtils {
  static read = read;
  static readFile = readFile;
  static utils = utils;

  /**
   * Reads the file data and paas it to the workBook Handler
   * @param {Blob, any} params {file, wbHandler} - file and workBook Handler
   */
  static loadFile = (params: { file: Blob; wbHandler: any }): void => {
    const { file, wbHandler } = params;
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = async (e) => {
      if (!(e && e.target)) throw new Error("e.target is null!");

      /* Parse data */
      const bstr = e.target.result;
      wbHandler(read(bstr, { type: rABS ? "binary" : "array" }));
    };
    if (rABS) reader.readAsBinaryString(file);
    else reader.readAsArrayBuffer(file);
  };

  static loadSheet = (params: { wb: WorkBook; sheet: number }): WorkSheet => {
    return params.wb.Sheets[params.wb.SheetNames[params.sheet]];
  };

  /**
   * Converts a cell address to cell name
   * @example
   * // return AA21
   * cellAddressToCellName({c: 27, r: 21});
   * @param {CellAddress} cellAddress - Cell address that will be converted
   * @returns {String} the cell name.
   */
  static cellAddressToCellName = (cellAddress: CellAddress): string =>
    utils.encode_cell(cellAddress);

  /**
   * Converts a cell name to cell address
   * @example
   * // return {c: 27, r: 21}
   * cellNameToCellAddress("AA21");
   * @param {String} cellName - Cell Name that will be converted
   * @returns {CellAddress} the cell address.
   */
  static cellNameToCellAddress = (cellAddress: string): CellAddress =>
    utils.decode_cell(cellAddress);

  /**
   * Give the range to iterate between the cells
   * @example
   * // return [{c: 1, r: 2}, {c: 2, r: 2}, {c: 3, r: 2}]
   * getRange({s: {c: 1, r: 2}, e: {c: 3, r: 2}})
   * @example
   * // return [{c: 1, r: 2}, {c: 1, r: 3}, {c: 1, r: 4}]
   * getRange({s: {c: 1, r: 2}, e: {c: 1, r: 4}})
   * @param {Range} range - CellAddress with starting and ending
   * @returns {CellAddress[]} the list of cell addresses
   * @note Only works for horizontal and verticle iterations
   */
  static getRange(range: Range): CellAddress[] {
    const start = range.s;
    const end = range.e;
    const list: CellAddress[] = [];
    // horizontal iteration
    if (start.c !== end.c && start.r === end.r)
      for (let col = start.c; col <= end.c; ++col)
        list.push({ c: col, r: start.r });
    // verticle iteration
    else if (start.c === end.c && start.r !== end.r)
      for (let row = start.r; row <= end.r; ++row)
        list.push({ c: start.c, r: row });

    return list;
  }

  /**
   * Fill cell from a Worksheet that were merged
   * @param {WorkSheet} ws -Worksheet that will be filled
   */
  static fillMerges(ws: WorkSheet): void {
    const merges: Range[] | undefined = ws["!merges"];
    if (!merges) return; // if undefined

    for (const merge of merges) {
      const startCell: CellObject = ws[this.cellAddressToCellName(merge.s)];

      //if starting cell is not null
      if (Boolean(startCell))
        for (const address of this.getRange(merge))
          ws[this.cellAddressToCellName(address)] = startCell; //copying start cell value to the remaing cells
    }

    //empyting the merges is workSheet
    merges.length = 0;
  }

  /**
   * Check if a variable is type of CellObject
   * @static
   * @param {any} object - any type
   * @returns true or false
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  static typeOfCellObject(object: any): object is CellObject {
    return (
      typeof object === "object" && !Array.isArray(object) && "t" in object
    );
  }
}
