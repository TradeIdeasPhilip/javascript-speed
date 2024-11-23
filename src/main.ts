// This is the preferred way to include a css file.
import "./style.css";

type Record = [number, string, bigint];
const testData: Record = [1, "ⅱ", 3n];

const ROMAN_INDEX = 1;

function getRoman(input: Record): string {
  return input[ROMAN_INDEX];
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
