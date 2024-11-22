// This is the preferred way to include a css file.
import "./style.css";

import { getById } from "phil-lib/client-misc";

// getById() is usually the first function I import.
// This is the best way to access HTML from TypeScript most of the time.
const typescriptStatusSpan = getById("typescriptStatus", HTMLSpanElement);
typescriptStatusSpan.innerText = "working";



type Record = [number, string, bigint];
const testData :Record= [1, "ⅱ", 3n] ;

const ROMAN_INDEX = 1;

function getRoman(input : Record): string {
  return input[ROMAN_INDEX];
}

export let memoryHole : string = "";

function timeIt(count:number) {
  const times=[ performance.now()];
  for (let i = 0; i <count;i++) {
    memoryHole = "ⅱ";
  }
  times.push(performance.now());
  for (let i = 0; i <count;i++) {
    memoryHole = testData[1];
  }
  times.push(performance.now());
  for (let i = 0; i <count;i++) {
    memoryHole = testData[ROMAN_INDEX];
  }
  times.push(performance.now());
  for (let i = 0; i <count;i++) {
    memoryHole = getRoman(testData);
  }
  times.push(performance.now());
  return times.flatMap((startTime, startIndex)=>{
    const endIndex = startIndex+1;
    const  endTime = times[endIndex];
    if (endTime === undefined) {
      return [];
    } else {
      return [endTime-startTime];
    }
  });
}

(window as any).timeIt = timeIt;


/*
timeIt(1)
(4) [0, 0, 0, 0]
timeIt(1)
(4) [0, 0, 0, 0]
timeIt(1000)
(4) [0.10000000149011612, 0.10000000149011612, 0, 0.20000000298023224]
timeIt(10000)
(4) [0.6000000014901161, 0.3999999985098839, 0.3999999985098839, 0.5]
timeIt(10000)
(4) [0.5, 0.9000000059604645, 0.8999999985098839, 0.8999999985098839]
timeIt(1000000)
(4) [11.800000004470348, 9.199999995529652, 8.700000002980232, 8.100000001490116]
timeIt(1000000)
(4) [13.399999998509884, 8.299999997019768, 7.700000002980232, 7.399999998509884]
timeIt(10000000)
(4) [68.60000000149012, 56.100000001490116, 59.5, 64.19999999552965]
timeIt(10000000)
(4) [69.10000000149012, 55.19999999552965, 58.600000001490116, 63.20000000298023]
timeIt(10000000)
(4) [68.19999999552965, 56.20000000298023, 59.70000000298023, 64.59999999403954]
timeIt(100000000)
(4) [534.6000000014901, 548.5, 582.6999999955297, 629.3000000044703]
timeIt(100000000)
(4) [540, 559.7999999970198, 594.7000000029802, 640.2999999970198]
*/