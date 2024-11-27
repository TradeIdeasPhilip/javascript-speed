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

This first table shows a typical result when I run 10,000 iterations of each test.
Each row is testing one thing.
Each column repeats the same tests.
The tests are run all the way down each column before starting the next column.

|                              | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ---------------------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| loop                         | 0.8 | 0.1 | 0.0 | 0.1 | 0.1 | 0.2 | 0.1 | 0.1 | 0.2 | 0.1 |
| read                         | 0.4 | 0.1 | 0.2 | 0.1 | 0.1 | 0.1 | 0.1 | 0.2 | 0.1 | 0.0 |
| named constant               | 0.3 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 | 0.1 | 0.2 |
| function external constant   | 0.6 | 0.2 | 0.1 | 0.1 | 0.2 | 0.1 | 0.1 | 0.2 | 0.1 | 0.1 |
| function local constant      | 0.4 | 0.1 | 0.2 | 0.1 | 0.1 | 0.1 | 0.2 | 0.1 | 0.1 | 0.1 |
| function literal constant    | 0.3 | 0.1 | 0.0 | 0.2 | 0.1 | 0.1 | 0.1 | 0.1 | 0.2 | 0.1 |
| function additional constant | 0.2 | 0.1 | 0.2 | 0.2 | 0.2 | 0.2 | 0.1 | 0.1 | 0.2 | 0.2 |
| function lots of constants   | 0.4 | 0.2 | 0.1 | 0.0 | 0.0 | 0.1 | 0.1 | 0.1 | 0.0 | 0.1 |

**Coming Soon:** I tried the same thing with 10x as many iterations, 100x as many, etc. Those results don't make sense. The first column is usually much bigger than the rest, and the second column is a little bigger than the rest, and the others are all faster than the first two columns and generally similar to each other. That makes no sense. Why would it take longer to warm up when it had a larger workload? Why would it need to warm up again when I repeat the command at the console? I need a better way to create tables in this document.

## How to Use

Currently this software is very primitive.
All user interaction is done through the console.
It's only aimed at programmers.

Look for "timeIt" in the examples above.
These are exact copies of what I typed into the console and JavaScript's responses.

**New:** `timeGroups()` will call `timeIt()` and will display the result on the web page in a table.
I am currently investigating the way code seems to run faster over time.

## Colophon

This project was created from a template at https://github.com/TradeIdeasPhilip/typescript-template/.
