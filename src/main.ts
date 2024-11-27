// This is the preferred way to include a css file.
import "./style.css";
import { initializedArray } from "phil-lib/misc";

type ExternalRecord = [number, string, bigint];
const testData: ExternalRecord = [1, "ⅱ", 3n];

/**
 * Look in this array index to get the data we need.
 */
const ROMAN_INDEX = 1;

/**
 * This appears as `function external constant` in the output to the user.
 *
 * This is the way I would normally think to solve this problem.
 * This is a baseline.
 * All of the other versions of this getRoman*() are the what-if's going through my head.
 * @param input random test data.
 * @returns The second value in the input array.
 */
function getRoman(input: ExternalRecord): string {
  return input[ROMAN_INDEX];
}

/**
 * This appears as `function local constant` in the output to the user.
 *
 * In this version of the function I create a constant _inside_ the function.
 * It seems to me that this would slow the code down in a traditional interpreter.
 * The code would run at the same speed in a compiled model.
 *
 * Initial results suggest that this is _faster_ than the baseline `getRoman()`.
 * See [The Magic _Inside_ a Function](https://github.com/TradeIdeasPhilip/javascript-speed?tab=readme-ov-file#the-magic-inside-a-function)
 * for the full analysis.
 * @param input Random test data.
 * @returns The second value in the input array.
 */
function getRoman1(input: ExternalRecord): string {
  const ROMAN_INDEX = 1;
  return input[ROMAN_INDEX];
}

/**
 * This appears as 'function literal constant` in the output to the user.
 *
 * I added this for comparison with getRoman() and getRoman1().
 * Those both use named constants.
 * This uses a literal constant.
 * @param input Random test data.
 * @returns The second value in the input array.
 */
function getRoman1a(input: ExternalRecord): string {
  return input[1];
}

/**
 * This appears as `function additional constant` in the output to the user.
 *
 * In this version of the function I create _one additional_ named constant inside the function.
 * It seems to me that this would slow the code down in a traditional interpreter.
 * The code would run at the same speed in a compiled model.
 * @param input Random test data.
 * @returns The second value in the input array.
 */
function getRoman2(input: ExternalRecord): string {
  const ROMAN_INDEX = 1;
  const result = input[ROMAN_INDEX];
  return result;
}

/**
 * This appears as `function lots of constants` in the output to the user.
 *
 * In this version of the function I create several additional_ named constant inside the function.
 * This is the same as getRoman3() but more extreme.
 * @param input Random test data.
 * @returns The second value in the input array.
 */
function getRoman3(input: ExternalRecord): string {
  const ROMAN_INDEX = 1;
  const index = ROMAN_INDEX;
  const theIndex = index;
  const result = input[theIndex];
  const theResult = result;
  const toReturn = theResult;
  return toReturn;
}

/**
 * Put the output of the functions into here.
 *
 * This is never read.
 * The idea is to keep the compiler from completely optimizing all of my test code away.
 */
export let memoryHole: string = "";

/**
 * This is a wrapper around performance.now() to make it easier to use.
 *
 * This is similar to Console.time(), but I can control how to display the output.
 */
class StopWatch {
  #startTime = performance.now();
  /**
   * Counter name -> time consumed in milliseconds.
   */
  #counters = new Map<string, number>();
  /**
   * All of the saved results.
   */
  get counters(): ReadonlyMap<string, number> {
    return this.#counters;
  }
  /**
   * Call this at the end of each time.
   *
   * This will restart the timer.
   * @param name This will be displayed to the user.
   * If you call this multiple times with the same name, the times are added together.
   */
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

/**
 * Repeat the standard battery of tests n times.
 * The intent is to see if the performance changes over time,
 * like you'd expect from a hot-spot compiler.
 *
 * This displays the results in a table on the web page and
 * it returns the same data.  In both cases the times are expressed
 * in milliseconds. The results from performance.now() are precise to
 * 0.1 milliseconds, and the table on the screen represents that.
 * @param iterationsPerGroup Each of the smallest tests is run this many
 * times before moving on to the next test. Reasonable values range from
 * 10,000 to 1,000,000,000.
 * @param groupCount How many times to rerun the entire battery of tests.
 * 10 works well for me.
 * @returns The time taken
 */
function timeGroups(iterationsPerGroup: number, groupCount: number) {
  const groups = initializedArray(groupCount, () => timeIt(iterationsPerGroup));
  const table = new GroupTable(...groups);
  document.body.appendChild(table.tableElement);
  return groups;
  //console.table(results);
}

(window as any).timeIt = timeIt;
(window as any).timeGroups = timeGroups;
