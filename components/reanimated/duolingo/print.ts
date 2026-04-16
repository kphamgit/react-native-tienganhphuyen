//Read ClickAndClozeNew.tsx (lines 311-330)
/* offsets is an array of shared value objects — one per word — used by Reanimated to drive the drag-and-drop 
animations on the UI thread.
 Each entry looks like:

{
  order: useSharedValue(0),
  width: useSharedValue(0),
  originalX: useSharedValue(0),
  originalY: useSharedValue(0),
  ...
}
Lines 317–321 initialize each word's offset with its measured position:

offset.order.value = -1 — marks the word as not yet placed in the answer area (unordered/in word bank)
offset.width.value = width — stores the word's measured pixel width so gesture handlers know how wide each word is
offset.originalX.value = x — stores where the word sits horizontally in the word bank
offset.originalY.value = y + linesHeight + wordBankOffsetY — stores where the word sits vertically, 
offset down by the answer lines area height so word bank words appear below the answer lines

These shared values are then read by ClickableWordNew during gestures to 
animate words smoothly without going through React state.

*/

/*

  offsetStyles:  [
  {"height": 40, "left": 145, "position": "absolute", "top": 136, "width": 47.33332824707031}, 
  {"height": 40, "left": 200.3333282470703, "position": "absolute", "top": 136, "width": 48}]

*/

/*
can you explain why wordElements returned from useMemo, on line 55, is an array of JSX Elements?
Read Child1.tsx
wordElements is an array of JSX Elements because of the .map() on line 58.

.map() always returns an array — one item per element in the source array. Here, shuffledWords is ["one", "three", "fourteen"] (3 strings), 
and for each string it returns a <WordContext.Provider> JSX element. So the result is an array of 3 JSX elements.

JSX elements are just JavaScript objects under the hood (React.createElement(...) calls), so .map() producing an array of them 
is the same as .map() producing an array of any other value.

React can render arrays of JSX elements directly — that's why {wordElements} inside the return works fine.
*/


/*
How does React display a child which is a Provider?
React treats a Provider like any other component — it just renders its children prop (in this
case, Word). 
So when React encounters {child} on line 84 (where child is a <WordContext.Provider>), 
it:

Calls the Provider's render logic
The Provider makes its value available to any descendant that calls useContext(WordContext)
Then renders its children — in this case <Word />
So visually, what actually gets displayed on screen is <Word />. The Provider itself renders
 no visible UI — it's invisible infrastructure for passing context down the tree.

*/

/*
What if I don't use Context Provider. What kind of Prop drilling is involved?

Without WordContext, you'd need to pass text, wordHeight, and wordGap as props to <Word /> directly. But there's a deeper problem — look at where the chain breaks:

The component tree:


ClickAndClozeNew
  → creates wordElements (JSX) in useMemo
      → <Word /> is already instantiated here
  → passes wordElements as children to ComputeWordLayout
      → ComputeWordLayout wraps each in a <View>
          → ClickableWordNew wraps each again
By the time Word is rendered deep in the tree, the JSX was already created in useMemo. So you'd have two bad options:

Option 1 — Pass props at creation time (simple but inflexible):

// in useMemo, pass directly to Word
<Word key={...} text={word} wordHeight={wordHeight} wordGap={wordGap} />
This works for the default <Word />, but breaks renderWord — 
the custom renderer would also need text, wordHeight, wordGap passed 
into it explicitly every time.

Option 2 — Use React.cloneElement to inject props later:


// in ComputeWordLayout or ClickableWordNew
React.cloneElement(child, { text, wordHeight, wordGap })
This is hacky, fragile, and considered an anti-pattern.

The real problem is the renderWord escape hatch — 
since anyone can pass a custom word renderer, context gives them a clean, stable contract: "just call useContext(WordContext) 
and you'll get the data." Without it, every custom renderer would need to accept and forward those props manually.

*/

/*
can you explain line 74 to line 78?

Read ComputeWordLayout.tsx (lines 73-82)
This is a clever trick to count the number of lines the words wrap across.

The key insight: words on the same line share the same y value. Since flexWrap lays out words left-to-right and wraps to a new row, every word on row 1 has the same y, every word on row 2 has the same y, etc.

So using a Set — which only stores unique values — is a way to deduplicate:


words:   ["one", "two", "three", "four", "five"]
y values: [0,     0,     0,       48,     48   ]
Set:      {0, 48}  → size = 2 lines
Walking through each line:
Walking through each line:

line 74 — create an empty Set to collect unique y values
line 75 — loop over every measured word
line 76 — grab its y position (vertical offset from the top of the container)
line 77 — add it to the Set; duplicates are automatically ignored
after the loop, numLines.size = the number of distinct rows the words occupy
*/


/*
what is numLinesSize on line 79?

const numLinesSize = numLines.size < 3 ? numLines.size + 1 : numLines.size;
It's the number of lines, but with one extra line added as a buffer when there are fewer than 3 lines.

The reason: if the words only measure as fitting in 1 or 2 rows, there's a risk that in the real UI (with absolute positioning)
 a word might wrap onto an extra unexpected row due to slight measurement differences. Adding +1 reserves that extra row of height as a 
 safety margin so words don't overlap the answer lines.

If there are already 3+ lines measured, the extra buffer is considered unnecessary.

I still don't understand. Why is it that when there are 3+ lines measured, the the extra buffer is considered unnecessary.

Honestly, it's just a heuristic — there's no mathematically rigorous reason why 3 is the cutoff. It's a judgment call baked into the code.

The intuition behind it is probably:

With 1 line, an unexpected wrap doubles your line count (1 → 2). That's a big jump that would cause visible layout breakage, so the buffer matters a lot.
With 2 lines, wrapping to 3 is still a 50% increase. Still worth guarding against.
With 3+ lines, the words are already spread across many rows, so the container is already tall. 
An extra unexpected wrap adds a smaller relative percentage of height, 
and the risk of visible breakage is considered low enough to not bother.
But you could make an argument that the buffer should always be added regardless of line count. The 3-line cutoff is just an arbitrary threshold the author chose 
— not a rule with a deep technical justification.
*/

/*
can you explain what is WordBankOffset which passed in as a prop to ComputeWordLayout?

wordBankOffsetY is the vertical gap between the answer lines area and the word bank below it.

Visually the layout looks like this:


┌─────────────────────────┐
│  ___  ___  ___  ___     │  ← answer lines (where dropped words go)
│                         │
│         ↕ wordBankOffsetY (gap)
│                         │
│  [one] [two] [three]    │  ← word bank (draggable words)
│  [four] [five]          │
└─────────────────────────┘
It's used in two places in ComputeWordLayout:

offset.originalY.value = y + linesHeight + wordBankOffsetY — sets the word's resting Y position in the word bank, pushed down by this gap
top: y + linesHeight + wordBankOffsetY * 2 — the *2 in the style accounts for top and bottom spacing around the word bank area
It defaults to 20 pixels in ClickAndClozeNew if not provided by the parent.
*/

/*
Read ComputeWordLayout.tsx (lines 100-114)
This builds the absolute position style for each word chip in the word bank — these are the styles that will be used 
in the real UI after measurement is complete.

Each field:

position: "absolute" — takes the word out of normal flow so it can be placed precisely by top/left
height: wordHeight — fixes the chip height (the measured height from flex layout isn't used directly; 
the configured wordHeight prop is used instead for consistency)

top: y + linesHeight + wordBankOffsetY * 2 — positions the word vertically: y is where it sat during measurement, 
linesHeight pushes it below the answer lines area, and wordBankOffsetY * 2 adds top+bottom spacing around the word bank
left: x + wordGap — positions the word horizontally at its measured x, plus a small gap inset from the left edge
width: width - wordGap * 2 — slightly narrows the chip by subtracting gaps on both sides, so adjacent chips don't visually touch
These styles are saved into offsetStyles.current[index] and later passed up to the parent via onLayout, where they become the wordStyles used by <Placeholder> and <ClickableWordNew> to position each chip in the real UI.



/*

const offsets = words.map(() => ({
order: useSharedValue(0),
width: useSharedValue(0),
height: useSharedValue(0),
x: useSharedValue(0),
y: useSharedValue(0),
originalX: useSharedValue(0),
originalY: useSharedValue(0),
}));
when we define a variable (such as offsets) that hold Reanimated shared values, is the variable created in the UI thread?

No — the variable itself is created on the JS thread during the React render. useSharedValue(0) runs on the JS thread and returns a JavaScript object that acts as a proxy/handle.

The value inside (offset.order.value, etc.) is what lives on the UI thread. The JS-side object is just a handle that lets you read/write across the thread boundary.

So:

const offsets = words.map(() => ({ order: useSharedValue(0), ... })) — this runs on the JS thread, creating JS objects
offsets[0].order.value = 1 — from JS thread, this dispatches a write to the UI thread asynchronously
Inside a worklet ("worklet"), offsets[0].order.value = 1 — this writes directly on the UI thread synchronously
That's the dual nature of shared values — they're accessible from both threads, but behave differently depending on which thread you're on
*/
