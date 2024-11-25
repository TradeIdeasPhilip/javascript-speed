// This is the preferred way to include a css file.
import "./style.css";
import { initializedArray } from "phil-lib/misc";

type ExternalRecord = [number, string, bigint];
const testData: ExternalRecord = [1, "ⅱ", 3n];

const ROMAN_INDEX = 1;

function getRoman(input: ExternalRecord): string {
  return input[ROMAN_INDEX];
}

function getRoman1(input: ExternalRecord): string {
  const ROMAN_INDEX = 1;
  return input[ROMAN_INDEX];
}

function getRoman1a(input: ExternalRecord): string {
  return input[1];
}

function getRoman2(input: ExternalRecord): string {
  const ROMAN_INDEX = 1;
  const result = input[ROMAN_INDEX];
  return result;
}

function getRoman3(input: ExternalRecord): string {
  const ROMAN_INDEX = 1;
  const index = ROMAN_INDEX;
  const theIndex = index;
  const result = input[theIndex];
  const theResult = result;
  const toReturn = theResult;
  return toReturn;
}

export let memoryHole: string = "";

class StopWatch {
  #startTime = performance.now();
  #counters = new Map<string, number>();
  get counters(): ReadonlyMap<string, number> {
    return this.#counters;
  }
  save(name: string) {
    const now = performance.now();
    const previousCount = this.#counters.get(name) ?? 0;
    this.#counters.set(name, previousCount + now - this.#startTime);
    this.#startTime = now;
  }
}

function timeIt(count: number) {
  const stopWatch = new StopWatch();
  for (let i = 0; i < count; i++) {
    memoryHole = "ⅱ";
  }
  stopWatch.save("loop");
  for (let i = 0; i < count; i++) {
    memoryHole = testData[1];
  }
  stopWatch.save("read");
  for (let i = 0; i < count; i++) {
    memoryHole = testData[ROMAN_INDEX];
  }
  stopWatch.save("named constant");
  for (let i = 0; i < count; i++) {
    memoryHole = getRoman(testData);
  }
  stopWatch.save("function external constant");
  for (let i = 0; i < count; i++) {
    memoryHole = getRoman1(testData);
  }
  stopWatch.save("function local constant");
  for (let i = 0; i < count; i++) {
    memoryHole = getRoman1a(testData);
  }
  stopWatch.save("function literal constant");
  for (let i = 0; i < count; i++) {
    memoryHole = getRoman2(testData);
  }
  stopWatch.save("function additional constant");
  for (let i = 0; i < count; i++) {
    memoryHole = getRoman3(testData);
  }
  stopWatch.save("function lots of constants");
  return stopWatch.counters;
}

class GroupTable {
  readonly tableElement = document.createElement("table");
  readonly #headerRow = this.tableElement.insertRow();
  readonly #otherRows = new Map<string, HTMLTableRowElement>();

  constructor(...initialGroups: ReadonlyMap<string, number>[]) {
    this.#headerRow.insertCell();
    this.add(...initialGroups);
  }
  /**
   * Each group is in its own column.
   *
   * The first column is for headers.
   */
  #groupCount = 0;
  add(...groups: ReadonlyMap<string, number>[]) {
    const formatter = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    groups.forEach((group) => {
      const untouchedRows = new Set<string>(group.keys());
      const headerCell = this.#headerRow.insertCell();
      headerCell.classList.add("header", "top-row");
      headerCell.innerText = (this.#groupCount + 1).toString();
      group.forEach((value, name) => {
        untouchedRows.delete(name);
        let row = this.#otherRows.get(name);
        if (!row) {
          row = this.tableElement.insertRow();
          const header = row.insertCell();
          header.innerText = name;
          header.classList.add("header");
          for (let i = 0; i < this.#groupCount; i++) {
            row.insertCell();
          }
          this.#otherRows.set(name, row);
        }
        const cell = row.insertCell();
        cell.innerText = formatter.format(value);
        cell.classList.add("data");
      });
      untouchedRows.forEach((key) => {
        this.#otherRows.get(key)!.insertCell();
      });
      this.#groupCount++;
    });
  }
}

function timeGroups(iterationsPerGroup: number, groupCount: number) {
  const groups = initializedArray(groupCount, () => timeIt(iterationsPerGroup));
  const table = new GroupTable(...groups);
  document.body.appendChild(table.tableElement);
  return groups;
  //console.table(results);
}

(window as any).timeIt = timeIt;
(window as any).timeGroups = timeGroups;
