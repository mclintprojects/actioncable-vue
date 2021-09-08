const addObjectDotKeys = () => {
  Object.keys = (function () {
    "use strict";
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const hasDontEnumBug = Object.prototype.propertyIsEnumerable.call(
      !{ toString: null },
      "toString",
    );
    const dontEnums = [
      "toString",
      "toLocaleString",
      "valueOf",
      "hasOwnProperty",
      "isPrototypeOf",
      "propertyIsEnumerable",
      "constructor",
    ];
    const dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (
        typeof obj !== "function" &&
        (typeof obj !== "object" || obj === null)
      ) {
        throw new TypeError("Object.keys called on non-object");
      }

      const result = [];
      let prop;
      let i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  })();
};

const addObjectDotEntries = () => {
  Object.entries = function (obj) {
    const ownProps = Object.keys(obj);
    let i = ownProps.length;
    const resArray = new Array(i); // preallocate the Array
    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };
};

export default () => {
  if (!Object.keys) {
    addObjectDotKeys();
  }

  if (!Object.entries) {
    addObjectDotEntries();
  }
};
