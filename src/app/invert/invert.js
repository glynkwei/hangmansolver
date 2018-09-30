// @flow

import type { Rectangle } from './types';

const RectangleComparator = ({top: lhsTop, left: lhsLeft} : Rectangle, {top: rhsTop, left: rhsLeft}: Rectangle) => (
    (lhsTop !== rhsTop ) ? rhsTop - lhsTop : rhsLeft - lhsLeft
);

const groupingBy = (iterator, toKey) => {
    const eleMap = new Map();
    for (let el of iterator) {
        const key = toKey(el);
        const vals = eleMap.get(key);
        if (vals) {
            vals.push(el);
        }
        else {
            eleMap.set(key, [el]);
        }
    }
    return eleMap.values();
};

const pushOrSet = (map, key, val) => {
  const res = map.get(key);
  if (res) {
      res.push(val);
      return res;
  }
  const rtn = [val];
  map.set(key, rtn);
  return rtn;
};

const LeftAdjacencyKey = ({top, left, height}) => JSON.stringify({top, left, height});
const RightAdjacencyKey = ({top, left, height, width}) => JSON.stringify({top, left: left + width, height});
const TopAdjacencyKey = ({top, left, width}) => JSON.stringify({top, left, width});
const BottomAdjacencyKey = ({top, left, width, height}) => JSON.stringify({top: top + height, left, width});

const computeKeys = rectangle => [LeftAdjacencyKey(rectangle),
    RightAdjacencyKey(rectangle),
    TopAdjacencyKey(rectangle),
    BottomAdjacencyKey(rectangle),];

const mergeRectangles = (adjacentRects, adjacencyMap) => {
    if (adjacentRects.length < 2) {
        return false;
    }
    adjacentRects.sort(RectangleComparator);
    const keys = [];
    for (let rect of adjacentRects) {
        computeKeys(rect).forEach(key => keys.push(key));
    }

  const major = adjacentRects[1]; // Top-left
  const minor = adjacentRects[0]; // Bottom-right
  const newRect = major.top === minor.top ?  {
      top: major.top,
      left: major.left,
      height: major.height,
      width: major.width + minor.width,
  } : {
      top: major.top,
      left: major.left,
      height: major.height + minor.height,
      width: major.width,
  };

  // Invalidate keys for old rectangles and add new rectangle in
  const newKeys = computeKeys(newRect);
  keys.forEach(oldKey => adjacencyMap.delete(oldKey));
  newKeys.forEach(newKey => {
      pushOrSet(adjacencyMap, newKey, newRect).sort(RectangleComparator);
  });
  return true;
};

const extractMin = (list, toVal) => (
    list[0] && list.reduce((min, el) => {
        const val = toVal(el);
        return val < min[0] ? [val, el] : min;
    }, [toVal(list[0]), list[0]])[1]
);

const sortedGroupings = (iterator, toKey, Comparator) => (
    [...groupingBy([...iterator].sort(Comparator),toKey)]
);

const pairs = iterator => {
    const list = [...iterator];
    if (list.length <= 1) {
        return [];
    }
    return list.reduce((result, next, index, src) => {
        if (index % 2 === 0)
            result.push(src.slice(index, index + 2));
        return result;
    }, [])
};

// Invert.Context(...).invert
class ViewContext {
  constructor(rectangles: Iterator<Rectangle>, width: number, height: number) {
    this.rectangles = rectangles;
    this.width = width;
    this.height = height;
  }

  rectangles: Iterator<Rectangle>;
  width: number;
  height: number;

  /** Returns the set of rectangles that is contained by two or more rectangles */
      // TODO: This can be O(n log n)
  intersects = () => (
      pairs(this.rectangles).map(pair => ({
          top: Math.max(pair[0].top, pair[1].top),
          left: Math.max(pair[0].left, pair[1].left),
          right: Math.min((pair[0].left + pair[0].width), (pair[1].left + pair[1].width)),
          bottom: Math.min((pair[0].top + pair[0].height), (pair[1].top + pair[1].height)),
      })).filter(({top, left, right, bottom}) => ( bottom > top && right > left)).map(({top, left, right, bottom}) => ({
          top,
          left,
          width: right - left,
          height: bottom - top
      })));

  /** Return the set of rectangles not containing the original set.
   *  If any of the original rectangles intersect, then the behavior is undefined. */
  invert = () => {
    const { rectangles, width, height }= this;
      const rects = [...rectangles].map(rectangle => (
          {...rectangle,
              right: rectangle.left + rectangle.width,
              bottom: rectangle.top + rectangle.height}));

      const ToKey = rectangle => rectangle.top;
      // Sort rectangles by decreasing top, then decreasing left ( So last element is top-left most element )
      const queue = sortedGroupings(rectangles, ToKey, RectangleComparator);
      // Trivial case when there are no rectangles to invert, so just return the container
      if (!queue.length)
      {
          return [{top: 0, left: 0, width, height}];
      }


      const createLeftRect = (rect: Rectangle, rectHeight: number): Rectangle => (
          {
              top: rect.top,
              left: 0,
              width: rect.left,
              height: rectHeight}
      );

      // Returns a list with the height of all rectangles reduced by a set amount
      const shorten = (rectangles, difference) => (
          rectangles.map(rect => ({
              ...rect,
              top: rect.top + difference,
              height: rect.height - difference
          })).filter(({height: rectHeight}) => rectHeight > 0)
      );

      const createRightRect = (rect: Rectangle, rectHeight: number): Rectangle => (
          {top: rect.top, left: rect.left + rect.width, width: width - (rect.left + rect.width ), height: rectHeight}
      );

      //
      // Two cases
      // - Rectangle aren't enclosing each other
      // Trivial to handle
      // - Rectangle is enclosed on the top (A peak)
      // Render the top portion enclosing the other, then replace so the top's are equal
      // - Rectangle is enclosed on the bottom (A plateau))
      // Render the top portion enclosing the other, then replace so top is equal to other top + height

      // The set of rectangles to output
      const outputList = [];

      // For the trivial rectangles above and below the fold
      const topMost = queue[queue.length - 1][0];
      const bottomMost = extractMin(rects, rectangle => -rectangle.bottom);
      if (queue.length > 0 ) {
          if ( topMost.top > 0 ) {
              outputList.push({
                  top: 0,
                  left: 0,
                  height: topMost.top,
                  width,
              });
          }
          if (bottomMost.top + bottomMost.height < height) {
              outputList.push({
                  top: bottomMost.top + bottomMost.height,
                  left: 0,
                  height: height - (bottomMost.top + bottomMost.height) ,
                  width,
              });
          }
      }

      while (queue.length > 0) {
          const top = queue.length - 1;
          const currentLevel = queue[top];
          const nextLevel = queue[top - 1];
          // Peak case:
          if (currentLevel.length === 1) {
              // If there is only one level, then the difference is the current height
              const difference =  (queue.length > 1) ? nextLevel[0].top - currentLevel[0].top : currentLevel[0].height;
              // There is nothing immediately to the left or right.
              if (currentLevel[0].left > 0 && difference > 0) {
                  outputList.push(createLeftRect(currentLevel[0], difference));
              }
              const right = currentLevel[0].left + currentLevel[0].width;
              if (right < width && difference > 0) {
                  outputList.push(createRightRect(currentLevel[0], difference));
              }

              // Case where next rectangle is completely disjoint. Add the rectangle below
              if (difference > currentLevel[0].height) {
                  outputList.push({
                      top: currentLevel[0].top,
                      left: currentLevel[0].left,
                      width: currentLevel[0].width,
                      height: difference,
                  });
                  queue.pop();
              }
              else if (difference > 0 && difference < currentLevel[0].height)   {
                  // Replace peak with a plateau
                  const plateau = {
                      left: currentLevel[0].left,
                      width: currentLevel[0].width,
                      top: currentLevel[0].top + difference,
                      height: currentLevel[0].height - difference
                  };

                  queue.pop();
                  nextLevel.push(plateau);
                  // TODO: This should be a binary search + insert
                  nextLevel.sort(RectangleComparator);
              }
              else if (difference === 0 || difference === currentLevel[0].height) {
                  queue.pop();
              }
          }
          else if (currentLevel.length > 1)             {
              const leftMost = currentLevel[currentLevel.length - 1];
              const rightMost = currentLevel[0];
              const minRect = extractMin(currentLevel, rect => rect.height);
              const rectHeight = queue.length > 1 ? Math.min(minRect.height, nextLevel[0].top - minRect.top) : minRect.height;
              const unbounded = rectHeight === minRect.height;
              //Special cases for first and last, where it extends out to boundaries
              if (leftMost.left > 0) {
                  outputList.push(createLeftRect(leftMost, rectHeight));
              }
              if (rightMost.left + rightMost.width < width) {
                  outputList.push(createRightRect(rightMost, rectHeight));
              }

              for (let i = currentLevel.length - 1; i > 0; i--) {
                  const first = currentLevel[i];
                  const second = currentLevel[i - 1];
                  const right = first.left + first.width;
                  const marginWidth = second.left - right;
                  if (marginWidth > 0) {
                      outputList.push({
                          top: minRect.top,
                          left: right,
                          width: marginWidth,
                          height: rectHeight,
                      });
                  }
              }


              if (unbounded) {
                  // Bottom boundary caused by rectangle on same level
                  const minIndex = currentLevel.findIndex(rect => rect === minRect);
                  currentLevel.splice(minIndex, 1);
              }
              const newCurrentLevel = shorten(currentLevel, rectHeight);
              if (newCurrentLevel.length === 0) {
                  if (queue.length > 1)   {
                      // Make rectangle below in case everything cancels
                      const newTop = currentLevel[0].top + rectHeight;
                      const newHeight = nextLevel[0].top - newTop;
                      if (newHeight > 0) {
                          outputList.push({
                              top: newTop,
                              left: 0,
                              width,
                              height: nextLevel[0].top - newTop,
                          });
                      }
                  }
                  queue.pop();
              }
              else if (!unbounded || (queue.length > 1 && nextLevel[0].top === newCurrentLevel[0].top)) {
                  queue[top - 1] = queue[top - 1].concat(newCurrentLevel).sort(RectangleComparator);
                  queue.pop();
              }
              else {
                  queue[top] = newCurrentLevel;
              }

          }
      }

      let outputStream = outputList;
      // Determines which rectangles are adjacent to which other rectangles by hashing sides.
      // Since rectangles don't intersect, they must necessarily be adjacent
      const adjacencyMap = new Map();
      while (outputStream.length > 0) {
          const rectangle = outputStream.pop();
          const adjacentSets = computeKeys(rectangle).map(key => pushOrSet(adjacencyMap, key, rectangle));
          adjacentSets.forEach(adjacentSet => mergeRectangles(adjacentSet, adjacencyMap));
      }


      const processed = [...new Map([...adjacencyMap.values()].filter(rects => rects.length > 0).map(rects => [JSON.stringify(rects[0]), rects[0]])).values()];
      console.log(processed);
      return processed;
  };
};

export const Context = (rectangles: Iterator<Rectangle>, width: number, height: number) => new ViewContext(rectangles, width, height);

