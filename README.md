# JavaScript Speed Tester

This is a sandbox for performance testing some simple things in JavaScript.
For the most part the questions are _"Is X faster than Y?"_ and **"Do I care?"**
The second part is probably more relevant.
I have to keep reminding myself not to optimize prematurely.

## How expensive is a function call & variable lookup?

The first test!

This was interesting, and I got some results.
But my next test goes further and has some crazy and confusing results.
So keep reading, but don't take any of my conclusions too seriously.
I'm documenting a journey.

### The Problem

This one's been bothering me forever.
Back in the day I wrote a lot of high performance code in C++ and a lot of other code in [TCL](https://www.tcl.tk/about/language.html).
For the most part TCL was "easier".
But imagine the following case.

Someone gives you a _not-quite-opaque_ object.

```
type ExternalRecord = [number, string, bigint];
const testData: ExternalRecord = [1, "ⅱ", 3n];
```

The fields are stored in an array, but it's really more like a record.
You might access it like this:

```
let memoryHole = testData[1];
```

To make it more clear you might say:

```
const ROMAN_INDEX = 1;

let memoryHole = testData[ROMAN_INDEX];
```

And if you really want to keep [Uncle Bob](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882) happy, you'd wrap it all in a function, like so:

```
const ROMAN_INDEX = 1;

function getRoman(input: ExternalRecord): string {
  return input[ROMAN_INDEX];
}

let memoryHole = getRoman(testData);
```

So far so good.
And if I stopped and delivered this (imaginary) project today, it would work just fine.
But then I start to worry.
How much is this nice readable code costing me?

Back in the day, I knew that scripting languages would charge me extra for the readable code.
But C++ would make it disappear at compile time.
The cost doesn't always matter, but I still want to know the cost.

Now JavaScript brings new levels of compilation and optimization.
What does that do to the estimates in my head?
Do these things cost me anything?
And if so, how much?

### The Test Setup

I start by exporting the result of my calculations.
I'm not sure about JavaScript, but in C++ this would prevent the compiler from just optimizing the entire test away.

```
export let memoryHole: string = "";
```

Then I add a simple version of my code that does nothing.
This measures the overhead of counting to n and storing a result each time.

```
for (let i = 0; i < count; i++) {
  memoryHole = "ⅱ";
}
```

Next I try the three different ways of extracting the data: `memoryHole = testData[1];`, `memoryHole = testData[ROMAN_INDEX];`, `memoryHole = getRoman(testData);` in that order.
If there's no optimization, each of those tests will be slightly slower than the one before it.

### The Results

Short answer: Each time I added more abstraction, things got slightly slower.
But the amounts were tiny.
I had to go up to 100,000,000 iterations to get results that made sense compared to the background noise.
Even when I did 10,000,000 iterations, the version that does nothing was slower than any of the versions that actually did something.

Here are the actual results that I've seen.
The input to `timeIt()` is the number of iterations.
The result says how many milliseconds it took to do all of the iterations of each test.

The tests are listed in the same order as above: baseline, read actual data, use a named constant, then call a function.
(Later these will be called "loop", "read", "named constant", and "function external constant", respectively.)

```
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
```

## The Magic _Inside_ a Function

The first test did not show any signs of optimization.
On a hunch I moved some things into `getRoman()`.

First, I created `getRoman1()` which includes its own copy of `const ROMAN_INDEX = 1;`.
If there is no optimization this might slow things down because we are creating that constant every time through the loop.
However, moving the constant into the function actually made it much faster.
Presumably the new version is optimizing that constant away where the old version had to look it up every time.

`getRoman2()` is the same except I added one additional named constant.
This is useful in the debugger and sometimes makes the code more readable.
This cost of this is tiny.
I'm not even certain it's real.

`getRoman3()` is the same but with _a lot_ more unnecessary named constants.
When I tested with 100,000,000 iterations this was just a tiny bit slower than the previous test.
When I tried again with 1,000,000,000 (one billion) iterations this test was actually a tiny bit faster than the previous one.

Clearly the cost of an extra constant inside of a function is **too small for me to measure**, if it exists at all.

Here's the raw data.
The first four items in the result are the same as in the previous test.
The next three items are the times for `getRoman1()`, `getRoman2()`, and `getRoman3()`, in that order.

```
timeIt(100000000)
(7) [522.3999999910593, 668.2999999970198, 717.4000000059605, 768.2000000029802, 702.3999999910593, 707.1000000089407, 708.5]
timeIt(1000000000)
(7) [5200.29999999702, 5644, 6030.5999999940395, 6524.4000000059605, 5999.5999999940395, 6038.800000011921, 6036.399999991059]
```

## Just in Time

I finally found evidence of the Just in Time compiler.

I was looking for something else.
I added `getRoman1a()`, a small variation on the getRoman functions.
I inserted this as the 6th result in each list.
Don't worry about the details.
All that matters is that I tested with 100,000,000 iterations, then with 1,000,000,000 iterations, then back to 100,000,000 iterations.

```
timeIt(100000000)
(8) [523.2000000029802, 670.5999999940395, 700.1000000089407, 755.8999999910593, 702.9000000059605, 708.7999999970198, 705.7999999970198, 707.5]
timeIt(1000000000)
(8) [5283.29999999702, 5669.4000000059605, 5984.199999988079, 6449.600000008941, 6047, 6043.399999991059, 6037.100000008941, 6036.5999999940395]
timeIt(100000000)
(8) [541.7000000029802, 560.7999999970198, 591.5, 638.5999999940395, 597.6000000089407, 597.5999999940395, 597.2000000029802, 596.7000000029802]
```

Look at the rough size of each number.
Focus on the first digit of each number.
In the second row all but one of the tests was faster than in the first row.
In the third row all of the tests ran faster than in the first or second row.

Even after running these functions 1,000,000,000 times, the performance was still increasing.
When exactly does a function get JIT'ed?
I need to do more research here.
None of the other measurements will make any sense until I understand what makes the measurements settle down.

## How does it change over time?

I'm trying to take a closer look at the compiler.
I wish I knew what it was doing.

`timeGroups()` takes a close look at this.
And it's giving me very strange results.
I am running the same 8 tests exactly as described above.
I added a loop around the previous set of tests, so I can run those 10 times in a row.

This first table shows a typical result when I run **10,000 iterations** of each test.
Each row is testing one thing.
Each column repeats the same tests.
The tests are run all the way down each column before starting the next column.

|                              | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ---------------------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| loop                         | 0.7 | 0.2 | 0.1 | 0.1 | 0.1 | 0.1 | 0.0 | 0.1 | 0.1 | 0.0 |
| read                         | 0.3 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 | 0.2 | 0.1 | 0.1 | 0.2 |
| named constant               | 0.4 | 0.2 | 0.2 | 0.1 | 0.1 | 0.0 | 0.1 | 0.1 | 0.1 | 0.1 |
| function external constant   | 0.4 | 0.1 | 0.1 | 0.2 | 0.1 | 0.2 | 0.2 | 0.1 | 0.1 | 0.1 |
| function local constant      | 0.5 | 0.2 | 0.1 | 0.2 | 0.2 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 |
| function literal constant    | 0.6 | 0.1 | 0.1 | 0.0 | 0.1 | 0.1 | 0.1 | 0.1 | 0.2 | 0.2 |
| function additional constant | 0.6 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 | 0.0 |
| function lots of constants   | 0.5 | 0.1 | 0.1 | 0.2 | 0.2 | 0.2 | 0.2 | 0.2 | 0.1 | 0.2 |

This first table does not show any surprises.
The first time I run each test it takes a lot longer than future times.
That suggests it's slower before the JIT gets to it.
The other times are all pretty close to each other.
That suggest that the small changes I made had no appreciable effect.

But I'm clearly pushing the limit on the precision. Let me try that again with **100,000 iterations**:

|                              | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ---------------------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| loop                         | 2.6 | 0.9 | 0.5 | 0.5 | 0.5 | 0.4 | 0.4 | 0.4 | 0.3 | 0.4 |
| read                         | 1.2 | 1.0 | 0.5 | 0.6 | 0.6 | 0.4 | 0.5 | 0.5 | 0.5 | 0.4 |
| named constant               | 1.1 | 1.1 | 0.6 | 0.5 | 0.5 | 0.4 | 0.4 | 0.4 | 0.3 | 0.3 |
| function external constant   | 1.4 | 1.0 | 0.5 | 0.5 | 0.5 | 0.5 | 0.4 | 0.4 | 0.4 | 0.5 |
| function local constant      | 1.2 | 1.1 | 0.5 | 0.5 | 0.4 | 0.5 | 0.5 | 0.3 | 0.3 | 0.3 |
| function literal constant    | 1.0 | 0.9 | 0.5 | 0.6 | 0.5 | 0.4 | 0.4 | 0.4 | 0.4 | 0.4 |
| function additional constant | 1.0 | 0.8 | 0.6 | 0.5 | 0.4 | 0.5 | 0.5 | 0.4 | 0.5 | 0.4 |
| function lots of constants   | 1.1 | 0.9 | 0.4 | 0.4 | 0.5 | 0.4 | 0.4 | 0.4 | 0.3 | 0.3 |

My quick impressions:

- The time required seems to decrease gradually between the first run and the last. I would have expected a sudden jump between the interpreted code and the compiled code, not a continuous change.
- I'm not sure why the different columns are so different. I did not restart anything. The tests each ran 100,000 times to produce the previous table, so everything should have been warmed up, JIT'ed and compiled before any of the tests in this table were run.
- Most of the numbers in this table are _roughly_ 10× the corresponding numbers in the previous table, as expected.
- I still don't have enough precision.

This next table shows the results of **1,000,000 iterations**:

|                              | 1    | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ---------------------------- | ---- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| loop                         | 12.1 | 4.8 | 3.4 | 3.4 | 3.4 | 3.2 | 3.4 | 3.3 | 3.4 | 3.4 |
| read                         | 11.7 | 6.3 | 3.4 | 3.3 | 3.3 | 3.5 | 3.3 | 3.4 | 3.3 | 3.4 |
| named constant               | 7.7  | 5.5 | 3.3 | 3.4 | 3.3 | 3.3 | 3.4 | 3.4 | 3.3 | 3.3 |
| function external constant   | 7.8  | 6.0 | 3.4 | 3.3 | 3.4 | 3.4 | 3.3 | 3.3 | 3.4 | 3.7 |
| function local constant      | 6.4  | 5.5 | 3.4 | 3.4 | 3.4 | 3.3 | 3.4 | 3.3 | 3.4 | 3.4 |
| function literal constant    | 6.0  | 5.6 | 3.3 | 3.3 | 3.3 | 3.4 | 3.3 | 3.4 | 3.3 | 3.3 |
| function additional constant | 5.6  | 5.6 | 3.3 | 3.4 | 3.4 | 3.3 | 3.3 | 3.3 | 3.4 | 3.4 |
| function lots of constants   | 5.7  | 5.5 | 3.4 | 3.3 | 3.4 | 3.4 | 3.4 | 3.4 | 3.3 | 3.3 |

Things are settling down a lot.
The first column is still the slowest, especially at the top.
The second column is still slower than the remaining columns.

I'm still confused by the first column.
Why are things slow?
All I did was run `timeGroups()` again in the console.
I didn't restart anything.

The measurements still aren't precise enough for me to see what I'm looking for.
Remember, the first row is the baseline.
All other rows include the baseline plus some additional work.
But some rows show smaller numbers than the top row.
The error in my measurements is still bigger than the things I'm looking for.
Let's try **10,000,000 iterations**:

|                              | 1    | 2    | 3    | 4    | 5    | 6    | 7    | 8    | 9    | 10   |
| ---------------------------- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| loop                         | 62.4 | 47.0 | 33.3 | 33.2 | 33.3 | 33.7 | 33.2 | 33.3 | 33.3 | 33.2 |
| read                         | 64.7 | 63.0 | 33.6 | 33.6 | 33.4 | 33.5 | 33.5 | 33.6 | 33.6 | 33.5 |
| named constant               | 55.7 | 54.8 | 33.5 | 33.6 | 33.7 | 33.5 | 33.6 | 33.6 | 33.5 | 33.6 |
| function external constant   | 60.6 | 59.7 | 33.5 | 33.5 | 33.5 | 33.6 | 33.6 | 33.6 | 33.6 | 33.5 |
| function local constant      | 56.0 | 55.4 | 33.6 | 33.5 | 33.5 | 33.5 | 33.5 | 33.5 | 33.5 | 33.7 |
| function literal constant    | 55.9 | 55.1 | 33.6 | 33.5 | 33.6 | 33.5 | 33.6 | 33.6 | 33.6 | 33.5 |
| function additional constant | 56.1 | 55.3 | 33.6 | 33.5 | 33.6 | 33.5 | 33.5 | 33.5 | 33.9 | 33.6 |
| function lots of constants   | 56.0 | 55.0 | 33.5 | 33.6 | 33.6 | 33.6 | 33.6 | 33.5 | 33.5 | 33.5 |

Now this is getting very strange.

Columns 3-10 are consistent with the previous table.
It takes 10× as long to run 10× as many iterations.
The obvious error in the readings is still larger than any of the differences I was looking for.
If I was only looking at these columns I'd be happy to say that function calls and named constants have no appreciable cost.
However, columns 1 & 2 still baffle me.
I'm afraid to draw any conclusions until I understand what's going on there.

The numbers in the first column are almost twice as high as the numbers near the end.
The numbers in the second column are similar to the numbers in the first column.
I can't make any sense of that.
If this is just JIT, there should be a fixed cost, not something proportional to the total work.
There is not special that's happening in my code between the 2nd and 3rd columns of tests.

If brute force isn't working, you aren't using enough of it. **100,000,000 iterations**:

|                              | 1     | 2     | 3     | 4     | 5     | 6     | 7     | 8     | 9     | 10    |
| ---------------------------- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| loop                         | 504.3 | 481.4 | 332.8 | 332.2 | 332.8 | 332.7 | 332.4 | 332.2 | 332.9 | 332.2 |
| read                         | 646.9 | 635.7 | 336.7 | 335.9 | 335.7 | 337.8 | 335.8 | 335.5 | 335.3 | 336.0 |
| named constant               | 557.5 | 548.0 | 335.8 | 335.4 | 337.7 | 337.2 | 335.5 | 335.6 | 335.5 | 335.3 |
| function external constant   | 605.5 | 596.4 | 335.7 | 335.3 | 336.3 | 335.8 | 335.6 | 335.6 | 335.8 | 335.5 |
| function local constant      | 566.9 | 553.6 | 335.7 | 335.6 | 336.9 | 335.3 | 336.0 | 335.4 | 335.6 | 335.8 |
| function literal constant    | 559.3 | 550.2 | 335.4 | 335.5 | 335.7 | 335.4 | 335.3 | 335.9 | 335.4 | 335.7 |
| function additional constant | 559.7 | 551.2 | 336.0 | 335.3 | 335.4 | 336.0 | 335.6 | 335.4 | 335.9 | 335.2 |
| function lots of constants   | 558.8 | 550.3 | 335.3 | 340.7 | 335.4 | 335.4 | 338.4 | 335.5 | 335.5 | 336.0 |

My results are the same as before.
I must be missing something.

## How to Use

Currently this software is very primitive.
All user interaction is done through the console.
It's only aimed at programmers.

`function timeIt(iterationCount: number)` will run each test the requested number of times and will return a map from the test name to the execution time in milliseconds.
Note that the output format has changed slightly since i used `timeIt()` in some of the examples above.
Originally this returned an array of times without any names.

`timeGroups(iterationsPerGroup: number, groupCount: number)` will call `timeIt()` multiple times in a row and will display the results in a table. I used a groupCount of 10 in all of the examples in this document.

I used `function tableToMarkdown(element: Element): string` to convert the HTML tables into a markdown for this document.

All three of these functions are exported to the global namespace, a.k.a. the window object.

## Colophon

This project was created from a template at https://github.com/TradeIdeasPhilip/typescript-template/.
