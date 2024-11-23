// This is the preferred way to include a css file.
import "./style.css";

type Record = [number, string, bigint];
const testData: Record = [1, "ⅱ", 3n];

const ROMAN_INDEX = 1;

function getRoman(input: Record): string {
  return input[ROMAN_INDEX];
}

function getRoman1(input: Record): string {
  const ROMAN_INDEX = 1;
  return input[ROMAN_INDEX];
}

function getRoman1a(input: Record): string {
  return input[1];
}

function getRoman2(input: Record): string {
  const ROMAN_INDEX = 1;
  const result = input[ROMAN_INDEX];
  return result;
}

function getRoman3(input: Record): string {
  const ROMAN_INDEX = 1;
  const index = ROMAN_INDEX;
  const theIndex = index;
  const result = input[theIndex];
  const theResult = result;
  const toReturn = theResult;
  return toReturn;
}

export let memoryHole: string = "";

function timeIt(count: number) {
  const times = [performance.now()];
  for (let i = 0; i < count; i++) {
    memoryHole = "ⅱ";
  }
  times.push(performance.now());
  for (let i = 0; i < count; i++) {
    memoryHole = testData[1];
  }
  times.push(performance.now());
  for (let i = 0; i < count; i++) {
    memoryHole = testData[ROMAN_INDEX];
  }
  times.push(performance.now());
  for (let i = 0; i < count; i++) {
    memoryHole = getRoman(testData);
  }
  times.push(performance.now());
  for (let i = 0; i < count; i++) {
    memoryHole = getRoman1(testData);
  }
  times.push(performance.now());
  for (let i = 0; i < count; i++) {
    memoryHole = getRoman1a(testData);
  }
  times.push(performance.now());
  for (let i = 0; i < count; i++) {
    memoryHole = getRoman2(testData);
  }
  times.push(performance.now());
  for (let i = 0; i < count; i++) {
    memoryHole = getRoman3(testData);
  }
  times.push(performance.now());
  return times.flatMap((startTime, startIndex) => {
    const endIndex = startIndex + 1;
    const endTime = times[endIndex];
    if (endTime === undefined) {
      return [];
    } else {
      return [endTime - startTime];
    }
  });
}

(window as any).timeIt = timeIt;
