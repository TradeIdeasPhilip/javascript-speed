# JavaScript Speed Tester

This is a sandbox for performance testing some simple things in JavaScript.
For the most part the questions are _"Is X faster than Y?"_ and **"Do I care?"**
The second part is probably more relevant.
I have to keep reminding myself not the optimize prematurely.

## How expensive is a function call & variable lookup?

The first test!

### The Problem

This one's been bothering me forever.
Back in the day I wrote a lot of high performance code in C++ and a lot of other code in [TCL](https://www.tcl.tk/about/language.html).
For the most part TCL was "easier".
But imagine the following case.

Someone gives you a _not-quite-opaque_ object.

```
type Record = [number, string, bigint];
const testData: Record = [1, "ⅱ", 3n];
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

function getRoman(input: Record): string {
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
The cost doesn't always matter, but I still like to know the cost.

Now JavaScript brings new levels of compilation and optimization.
What does that do to the calculations in my head?
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
(I will eventually add code to format this better.)
The input to `timeIt()` is the number of iterations.
The result says how many milliseconds it took to do all of the iterations of each test.

The tests are listed in the same order as above: baseline, read actual data, use a named constant, then call a function.

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

## How to Use

Currently this is very primitive.
All user interaction is done through the console.
It's only aimed at programmers.

See the log immediately above this.
That is an exact copy of what I typed into the console and JavaScript's responses.

## Colophon

This project was created from a template at https://github.com/TradeIdeasPhilip/typescript-template/.
