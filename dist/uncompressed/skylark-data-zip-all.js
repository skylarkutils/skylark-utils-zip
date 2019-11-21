/**
 * skylark-data-zip - A skylark wrapper for jszip.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0-beta
 * @link www.skylarkjs.org
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx/skylark");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-langx/_attach',[],function(){
    return  function attach(obj1,path,obj2) {
        if (typeof path == "string") {
            path = path.split(".");//[path]
        };
        var length = path.length,
            ns=obj1,
            i=0,
            name = path[i++];

        while (i < length) {
            ns = ns[name] = ns[name] || {};
            name = path[i++];
        }

        return ns[name] = obj2;
    }
});
define('skylark-langx/skylark',[
    "./_attach"
], function(_attach) {
    var skylark = {
    	attach : function(path,obj) {
    		return _attach(skylark,path,obj);
    	}
    };
    return skylark;
});

define('skylark-langx/types',[
],function(){
    var toString = {}.toString;
    
    var type = (function() {
        var class2type = {};

        // Populate the class2type map
        "Boolean Number String Function Array Date RegExp Object Error Symbol".split(" ").forEach(function(name) {
            class2type["[object " + name + "]"] = name.toLowerCase();
        });

        return function type(obj) {
            return obj == null ? String(obj) :
                class2type[toString.call(obj)] || "object";
        };
    })();

    function isArray(object) {
        return object && object.constructor === Array;
    }


    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function/string/element and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * isArrayLike([1, 2, 3])
     * // => true
     *
     * isArrayLike(document.body.children)
     * // => false
     *
     * isArrayLike('abc')
     * // => true
     *
     * isArrayLike(Function)
     * // => false
     */    
    function isArrayLike(obj) {
        return !isString(obj) && !isHtmlNode(obj) && typeof obj.length == 'number' && !isFunction(obj);
    }

    /**
     * Checks if `value` is classified as a boolean primitive or object.
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
     * @example
     *
     * isBoolean(false)
     * // => true
     *
     * isBoolean(null)
     * // => false
     */
    function isBoolean(obj) {
        return typeof(obj) === "boolean";
    }

    function isDefined(obj) {
        return typeof obj !== 'undefined';
    }

    function isDocument(obj) {
        return obj != null && obj.nodeType == obj.DOCUMENT_NODE;
    }

    function isEmptyObject(obj) {
        var name;
        for (name in obj) {
            if (obj[name] !== null) {
                return false;
            }
        }
        return true;
    }


    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * isFunction(parseInt)
     * // => true
     *
     * isFunction(/abc/)
     * // => false
     */
    function isFunction(value) {
        return type(value) == "function";
    }

    function isHtmlNode(obj) {
        return obj && obj.nodeType; // obj instanceof Node; //Consider the elements in IFRAME
    }

    function isInstanceOf( /*Object*/ value, /*Type*/ type) {
        //Tests whether the value is an instance of a type.
        if (value === undefined) {
            return false;
        } else if (value === null || type == Object) {
            return true;
        } else if (typeof value === "number") {
            return type === Number;
        } else if (typeof value === "string") {
            return type === String;
        } else if (typeof value === "boolean") {
            return type === Boolean;
        } else if (typeof value === "string") {
            return type === String;
        } else {
            return (value instanceof type) || (value && value.isInstanceOf ? value.isInstanceOf(type) : false);
        }
    }

    function isNull(value) {
      return type(value) === "null";
    }

    function isNumber(obj) {
        return typeof obj == 'number';
    }

    function isObject(obj) {
        return type(obj) == "object";
    }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype;
    }

    function isString(obj) {
        return typeof obj === 'string';
    }

    function isWindow(obj) {
        return obj && obj == obj.window;
    }

    function isSameOrigin(href) {
        if (href) {
            var origin = location.protocol + '//' + location.hostname;
            if (location.port) {
                origin += ':' + location.port;
            }
            return href.startsWith(origin);
        }
    }

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike(value) && objectToString.call(value) == symbolTag);
    }

    function isUndefined(value) {
      return value === undefined
    }

    return {

        isArray: isArray,

        isArrayLike: isArrayLike,

        isBoolean: isBoolean,

        isDefined: isDefined,

        isDocument: isDocument,

        isEmpty : isEmptyObject,

        isEmptyObject: isEmptyObject,

        isFunction: isFunction,

        isHtmlNode: isHtmlNode,

        isNull: isNull,

        isNumber: isNumber,

        isNumeric: isNumber,

        isObject: isObject,

        isPlainObject: isPlainObject,

        isString: isString,

        isSameOrigin: isSameOrigin,

        isSymbol : isSymbol,

        isUndefined: isUndefined,

        isWindow: isWindow,

        type: type
    };

});
define('skylark-langx/arrays',[
	"./types"
],function(types,objects){
	var filter = Array.prototype.filter,
		isArrayLike = types.isArrayLike;

    /**
     * The base implementation of `_.findIndex` and `_.findLastIndex` without
     * support for iteratee shorthands.
     *
     * @param {Array} array The array to inspect.
     * @param {Function} predicate The function invoked per iteration.
     * @param {number} fromIndex The index to search from.
     * @param {boolean} [fromRight] Specify iterating from right to left.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
      var length = array.length,
          index = fromIndex + (fromRight ? 1 : -1);

      while ((fromRight ? index-- : ++index < length)) {
        if (predicate(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
     *
     * @param {Array} array The array to inspect.
     * @param {*} value The value to search for.
     * @param {number} fromIndex The index to search from.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function baseIndexOf(array, value, fromIndex) {
      if (value !== value) {
        return baseFindIndex(array, baseIsNaN, fromIndex);
      }
      var index = fromIndex - 1,
          length = array.length;

      while (++index < length) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `isNaN` without support for number objects.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
     */
    function baseIsNaN(value) {
      return value !== value;
    }


    function compact(array) {
        return filter.call(array, function(item) {
            return item != null;
        });
    }

    function filter2(array,func) {
      return filter.call(array,func);
    }

    function flatten(array) {
        if (isArrayLike(array)) {
            var result = [];
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                if (isArrayLike(item)) {
                    for (var j = 0; j < item.length; j++) {
                        result.push(item[j]);
                    }
                } else {
                    result.push(item);
                }
            }
            return result;
        } else {
            return array;
        }
        //return array.length > 0 ? concat.apply([], array) : array;
    }

    function grep(array, callback) {
        var out = [];

        each(array, function(i, item) {
            if (callback(item, i)) {
                out.push(item);
            }
        });

        return out;
    }

    function inArray(item, array) {
        if (!array) {
            return -1;
        }
        var i;

        if (array.indexOf) {
            return array.indexOf(item);
        }

        i = array.length;
        while (i--) {
            if (array[i] === item) {
                return i;
            }
        }

        return -1;
    }

    function makeArray(obj, offset, startWith) {
       if (isArrayLike(obj) ) {
        return (startWith || []).concat(Array.prototype.slice.call(obj, offset || 0));
      }

      // array of single index
      return [ obj ];             
    }


    function forEach (arr, fn) {
      if (arr.forEach) return arr.forEach(fn)
      for (var i = 0; i < arr.length; i++) fn(arr[i], i);
    }

    function map(elements, callback) {
        var value, values = [],
            i, key
        if (isArrayLike(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback.call(elements[i], elements[i], i);
                if (value != null) values.push(value)
            }
        else
            for (key in elements) {
                value = callback.call(elements[key], elements[key], key);
                if (value != null) values.push(value)
            }
        return flatten(values)
    }


    function merge( first, second ) {
      var l = second.length,
          i = first.length,
          j = 0;

      if ( typeof l === "number" ) {
        for ( ; j < l; j++ ) {
          first[ i++ ] = second[ j ];
        }
      } else {
        while ( second[j] !== undefined ) {
          first[ i++ ] = second[ j++ ];
        }
      }

      first.length = i;

      return first;
    }

    function reduce(array,callback,initialValue) {
        return Array.prototype.reduce.call(array,callback,initialValue);
    }

    function uniq(array) {
        return filter.call(array, function(item, idx) {
            return array.indexOf(item) == idx;
        })
    }

    return {
        baseFindIndex: baseFindIndex,

        baseIndexOf : baseIndexOf,
        
        compact: compact,

        first : function(items,n) {
            if (n) {
                return items.slice(0,n);
            } else {
                return items[0];
            }
        },

        filter : filter2,
        
        flatten: flatten,

        inArray: inArray,

        makeArray: makeArray,

        merge : merge,

        forEach : forEach,

        map : map,
        
        reduce : reduce,

        uniq : uniq

    }
});
define('skylark-langx/numbers',[
	"./types"
],function(types){
	var isObject = types.isObject,
		isSymbol = types.isSymbol;

	var INFINITY = 1 / 0,
	    MAX_SAFE_INTEGER = 9007199254740991,
	    MAX_INTEGER = 1.7976931348623157e+308,
	    NAN = 0 / 0;

	/** Used to match leading and trailing whitespace. */
	var reTrim = /^\s+|\s+$/g;

	/** Used to detect bad signed hexadecimal string values. */
	var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

	/** Used to detect binary string values. */
	var reIsBinary = /^0b[01]+$/i;

	/** Used to detect octal string values. */
	var reIsOctal = /^0o[0-7]+$/i;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/** Built-in method references without a dependency on `root`. */
	var freeParseInt = parseInt;

	/**
	 * Converts `value` to a finite number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.12.0
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted number.
	 * @example
	 *
	 * _.toFinite(3.2);
	 * // => 3.2
	 *
	 * _.toFinite(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toFinite(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toFinite('3.2');
	 * // => 3.2
	 */
	function toFinite(value) {
	  if (!value) {
	    return value === 0 ? value : 0;
	  }
	  value = toNumber(value);
	  if (value === INFINITY || value === -INFINITY) {
	    var sign = (value < 0 ? -1 : 1);
	    return sign * MAX_INTEGER;
	  }
	  return value === value ? value : 0;
	}

	/**
	 * Converts `value` to an integer.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
	 *
	 * @static
	 * @memberOf _
	 * @param {*} value The value to convert.
	 * @returns {number} Returns the converted integer.
	 * @example
	 *
	 * _.toInteger(3.2);
	 * // => 3
	 *
	 * _.toInteger(Number.MIN_VALUE);
	 * // => 0
	 *
	 * _.toInteger(Infinity);
	 * // => 1.7976931348623157e+308
	 *
	 * _.toInteger('3.2');
	 * // => 3
	 */
	function toInteger(value) {
	  var result = toFinite(value),
	      remainder = result % 1;

	  return result === result ? (remainder ? result - remainder : result) : 0;
	}	

	/**
	 * Converts `value` to a number.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to process.
	 * @returns {number} Returns the number.
	 * @example
	 *
	 * _.toNumber(3.2);
	 * // => 3.2
	 *
	 * _.toNumber(Number.MIN_VALUE);
	 * // => 5e-324
	 *
	 * _.toNumber(Infinity);
	 * // => Infinity
	 *
	 * _.toNumber('3.2');
	 * // => 3.2
	 */
	function toNumber(value) {
	  if (typeof value == 'number') {
	    return value;
	  }
	  if (isSymbol(value)) {
	    return NAN;
	  }
	  if (isObject(value)) {
	    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
	    value = isObject(other) ? (other + '') : other;
	  }
	  if (typeof value != 'string') {
	    return value === 0 ? value : +value;
	  }
	  value = value.replace(reTrim, '');
	  var isBinary = reIsBinary.test(value);
	  return (isBinary || reIsOctal.test(value))
	    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
	    : (reIsBadHex.test(value) ? NAN : +value);
	}

	return  {
		toFinite : toFinite,
		toNumber : toNumber,
		toInteger : toInteger
	}
});
define('skylark-langx/objects',[
    "./_attach",
	"./types",
    "./numbers"
],function(_attach,types,numbers){
	var hasOwnProperty = Object.prototype.hasOwnProperty,
        slice = Array.prototype.slice,
        isBoolean = types.isBoolean,
        isFunction = types.isFunction,
		isObject = types.isObject,
		isPlainObject = types.isPlainObject,
		isArray = types.isArray,
        isArrayLike = types.isArrayLike,
        isString = types.isString,
        toInteger = numbers.toInteger;

     // An internal function for creating assigner functions.
    function createAssigner(keysFunc, defaults) {
        return function(obj) {
          var length = arguments.length;
          if (defaults) obj = Object(obj);  
          if (length < 2 || obj == null) return obj;
          for (var index = 1; index < length; index++) {
            var source = arguments[index],
                keys = keysFunc(source),
                l = keys.length;
            for (var i = 0; i < l; i++) {
              var key = keys[i];
              if (!defaults || obj[key] === void 0) obj[key] = source[key];
            }
          }
          return obj;
       };
    }

    // Internal recursive comparison function for `isEqual`.
    var eq, deepEq;
    var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

    eq = function(a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a === 1 / b;
        // `null` or `undefined` only equal to itself (strict comparison).
        if (a == null || b == null) return false;
        // `NaN`s are equivalent, but non-reflexive.
        if (a !== a) return b !== b;
        // Exhaust primitive checks
        var type = typeof a;
        if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
        return deepEq(a, b, aStack, bStack);
    };

    // Internal recursive comparison function for `isEqual`.
    deepEq = function(a, b, aStack, bStack) {
        // Unwrap any wrapped objects.
        //if (a instanceof _) a = a._wrapped;
        //if (b instanceof _) b = b._wrapped;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;
        switch (className) {
            // Strings, numbers, regular expressions, dates, and booleans are compared by value.
            case '[object RegExp]':
            // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return '' + a === '' + b;
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive.
                // Object(NaN) is equivalent to NaN.
                if (+a !== +a) return +b !== +b;
                // An `egal` comparison is performed for other numeric values.
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a === +b;
            case '[object Symbol]':
                return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
        }

        var areArrays = className === '[object Array]';
        if (!areArrays) {
            if (typeof a != 'object' || typeof b != 'object') return false;
            // Objects with different constructors are not equivalent, but `Object`s or `Array`s
            // from different frames are.
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && !(isFunction(aCtor) && aCtor instanceof aCtor &&
                               isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
                return false;
            }
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

        // Initializing stack of traversed objects.
        // It's done here since we only need them for objects and arrays comparison.
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] === a) return bStack[length] === b;
        }

        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);

        // Recursively compare objects and arrays.
        if (areArrays) {
            // Compare array lengths to determine if a deep comparison is necessary.
            length = a.length;
            if (length !== b.length) return false;
            // Deep compare the contents, ignoring non-numeric properties.
            while (length--) {
                if (!eq(a[length], b[length], aStack, bStack)) return false;
            }
        } else {
            // Deep compare objects.
            var keys = Object.keys(a), key;
            length = keys.length;
            // Ensure that both objects contain the same number of properties before comparing deep equality.
            if (Object.keys(b).length !== length) return false;
            while (length--) {
                // Deep compare each member
                key = keys[length];
                if (!(b[key]!==undefined && eq(a[key], b[key], aStack, bStack))) return false;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return true;
    };

    // Retrieve all the property names of an object.
    function allKeys(obj) {
        if (!isObject(obj)) return [];
        var keys = [];
        for (var key in obj) keys.push(key);
        return keys;
    }

    function each(obj, callback) {
        var length, key, i, undef, value;

        if (obj) {
            length = obj.length;

            if (length === undef) {
                // Loop object items
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        value = obj[key];
                        if (callback.call(value, key, value) === false) {
                            break;
                        }
                    }
                }
            } else {
                // Loop array items
                for (i = 0; i < length; i++) {
                    value = obj[i];
                    if (callback.call(value, i, value) === false) {
                        break;
                    }
                }
            }
        }

        return this;
    }

    function extend(target) {
        var deep, args = slice.call(arguments, 1);
        if (typeof target == 'boolean') {
            deep = target
            target = args.shift()
        }
        if (args.length == 0) {
            args = [target];
            target = this;
        }
        args.forEach(function(arg) {
            mixin(target, arg, deep);
        });
        return target;
    }

    // Retrieve the names of an object's own properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`.
    function keys(obj) {
        if (isObject(obj)) return [];
        var keys = [];
        for (var key in obj) if (has(obj, key)) keys.push(key);
        return keys;
    }

    function has(obj, path) {
        if (!isArray(path)) {
            return obj != null && hasOwnProperty.call(obj, path);
        }
        var length = path.length;
        for (var i = 0; i < length; i++) {
            var key = path[i];
            if (obj == null || !hasOwnProperty.call(obj, key)) {
                return false;
            }
            obj = obj[key];
        }
        return !!length;
    }

    /**
     * Checks if `value` is in `collection`. If `collection` is a string, it's
     * checked for a substring of `value`, otherwise
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * is used for equality comparisons. If `fromIndex` is negative, it's used as
     * the offset from the end of `collection`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Collection
     * @param {Array|Object|string} collection The collection to inspect.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=0] The index to search from.
     * @param- {Object} [guard] Enables use as an iteratee for methods like `_.reduce`.
     * @returns {boolean} Returns `true` if `value` is found, else `false`.
     * @example
     *
     * _.includes([1, 2, 3], 1);
     * // => true
     *
     * _.includes([1, 2, 3], 1, 2);
     * // => false
     *
     * _.includes({ 'a': 1, 'b': 2 }, 1);
     * // => true
     *
     * _.includes('abcd', 'bc');
     * // => true
     */
    function includes(collection, value, fromIndex, guard) {
      collection = isArrayLike(collection) ? collection : values(collection);
      fromIndex = (fromIndex && !guard) ? toInteger(fromIndex) : 0;

      var length = collection.length;
      if (fromIndex < 0) {
        fromIndex = nativeMax(length + fromIndex, 0);
      }
      return isString(collection)
        ? (fromIndex <= length && collection.indexOf(value, fromIndex) > -1)
        : (!!length && baseIndexOf(collection, value, fromIndex) > -1);
    }


   // Perform a deep comparison to check if two objects are equal.
    function isEqual(a, b) {
        return eq(a, b);
    }

    // Returns whether an object has a given set of `key:value` pairs.
    function isMatch(object, attrs) {
        var keys = keys(attrs), length = keys.length;
        if (object == null) return !length;
        var obj = Object(object);
        for (var i = 0; i < length; i++) {
          var key = keys[i];
          if (attrs[key] !== obj[key] || !(key in obj)) return false;
        }
        return true;
    }    

    function _mixin(target, source, deep, safe) {
        for (var key in source) {
            //if (!source.hasOwnProperty(key)) {
            //    continue;
            //}
            if (safe && target[key] !== undefined) {
                continue;
            }
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                    target[key] = {};
                }
                if (isArray(source[key]) && !isArray(target[key])) {
                    target[key] = [];
                }
                _mixin(target[key], source[key], deep, safe);
            } else if (source[key] !== undefined) {
                target[key] = source[key]
            }
        }
        return target;
    }

    function _parseMixinArgs(args) {
        var params = slice.call(arguments, 0),
            target = params.shift(),
            deep = false;
        if (isBoolean(params[params.length - 1])) {
            deep = params.pop();
        }

        return {
            target: target,
            sources: params,
            deep: deep
        };
    }

    function mixin() {
        var args = _parseMixinArgs.apply(this, arguments);

        args.sources.forEach(function(source) {
            _mixin(args.target, source, args.deep, false);
        });
        return args.target;
    }

   // Return a copy of the object without the blacklisted properties.
    function omit(obj, prop1,prop2) {
        if (!obj) {
            return null;
        }
        var result = mixin({},obj);
        for(var i=1;i<arguments.length;i++) {
            var pn = arguments[i];
            if (pn in obj) {
                delete result[pn];
            }
        }
        return result;

    }

   // Return a copy of the object only containing the whitelisted properties.
    function pick(obj,prop1,prop2) {
        if (!obj) {
            return null;
        }
        var result = {};
        for(var i=1;i<arguments.length;i++) {
            var pn = arguments[i];
            if (pn in obj) {
                result[pn] = obj[pn];
            }
        }
        return result;
    }

    function removeItem(items, item) {
        if (isArray(items)) {
            var idx = items.indexOf(item);
            if (idx != -1) {
                items.splice(idx, 1);
            }
        } else if (isPlainObject(items)) {
            for (var key in items) {
                if (items[key] == item) {
                    delete items[key];
                    break;
                }
            }
        }

        return this;
    }

    function result(obj, path, fallback) {
        if (!isArray(path)) {
            path = path.split(".");//[path]
        };
        var length = path.length;
        if (!length) {
          return isFunction(fallback) ? fallback.call(obj) : fallback;
        }
        for (var i = 0; i < length; i++) {
          var prop = obj == null ? void 0 : obj[path[i]];
          if (prop === void 0) {
            prop = fallback;
            i = length; // Ensure we don't continue iterating.
          }
          obj = isFunction(prop) ? prop.call(obj) : prop;
        }

        return obj;
    }

    function safeMixin() {
        var args = _parseMixinArgs.apply(this, arguments);

        args.sources.forEach(function(source) {
            _mixin(args.target, source, args.deep, true);
        });
        return args.target;
    }

    // Retrieve the values of an object's properties.
    function values(obj) {
        var keys = allKeys(obj);
        var length = keys.length;
        var values = Array(length);
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }
        return values;
    }

    function clone( /*anything*/ src,checkCloneMethod) {
        var copy;
        if (src === undefined || src === null) {
            copy = src;
        } else if (checkCloneMethod && src.clone) {
            copy = src.clone();
        } else if (isArray(src)) {
            copy = [];
            for (var i = 0; i < src.length; i++) {
                copy.push(clone(src[i]));
            }
        } else if (isPlainObject(src)) {
            copy = {};
            for (var key in src) {
                copy[key] = clone(src[key]);
            }
        } else {
            copy = src;
        }

        return copy;

    }

    return {
        allKeys: allKeys,

        attach : _attach,

        clone: clone,

        defaults : createAssigner(allKeys, true),

        each : each,

        extend : extend,

        has: has,

        isEqual: isEqual,   

        includes: includes,

        isMatch: isMatch,

        keys: keys,

        mixin: mixin,

        omit: omit,

        pick: pick,

        removeItem: removeItem,

        result : result,
        
        safeMixin: safeMixin,

        values: values
    };



});
define('skylark-langx/klass',[
    "./arrays",
    "./objects",
    "./types"
],function(arrays,objects,types){
    var uniq = arrays.uniq,
        has = objects.has,
        mixin = objects.mixin,
        isArray = types.isArray,
        isDefined = types.isDefined;

/* for reference 
 function klass(props,parent) {
    var ctor = function(){
        this._construct();
    };
    ctor.prototype = props;
    if (parent) {
        ctor._proto_ = parent;
        props.__proto__ = parent.prototype;
    }
    return ctor;
}

// Type some JavaScript code here.
let animal = klass({
  _construct(){
      this.name = this.name + ",hi";
  },
    
  name: "Animal",
  eat() {         // [[HomeObject]] == animal
    alert(`${this.name} eats.`);
  }
    
    
});


let rabbit = klass({
  name: "Rabbit",
  _construct(){
      super._construct();
  },
  eat() {         // [[HomeObject]] == rabbit
    super.eat();
  }
},animal);

let longEar = klass({
  name: "Long Ear",
  eat() {         // [[HomeObject]] == longEar
    super.eat();
  }
},rabbit);
*/
    
    function inherit(ctor, base) {
        var f = function() {};
        f.prototype = base.prototype;

        ctor.prototype = new f();
    }

    var f1 = function() {
        function extendClass(ctor, props, options) {
            // Copy the properties to the prototype of the class.
            var proto = ctor.prototype,
                _super = ctor.superclass.prototype,
                noOverrided = options && options.noOverrided,
                overrides = options && options.overrides || {};

            for (var name in props) {
                if (name === "constructor") {
                    continue;
                }

                // Check if we're overwriting an existing function
                var prop = props[name];
                if (typeof props[name] == "function") {
                    proto[name] =  !prop._constructor && !noOverrided && typeof _super[name] == "function" ?
                          (function(name, fn, superFn) {
                            return function() {
                                var tmp = this.overrided;

                                // Add a new ._super() method that is the same method
                                // but on the super-class
                                this.overrided = superFn;

                                // The method only need to be bound temporarily, so we
                                // remove it when we're done executing
                                var ret = fn.apply(this, arguments);

                                this.overrided = tmp;

                                return ret;
                            };
                        })(name, prop, _super[name]) :
                        prop;
                } else if (types.isPlainObject(prop) && prop!==null && (prop.get)) {
                    Object.defineProperty(proto,name,prop);
                } else {
                    proto[name] = prop;
                }
            }
            return ctor;
        }

        function serialMixins(ctor,mixins) {
            var result = [];

            mixins.forEach(function(mixin){
                if (has(mixin,"__mixins__")) {
                     throw new Error("nested mixins");
                }
                var clss = [];
                while (mixin) {
                    clss.unshift(mixin);
                    mixin = mixin.superclass;
                }
                result = result.concat(clss);
            });

            result = uniq(result);

            result = result.filter(function(mixin){
                var cls = ctor;
                while (cls) {
                    if (mixin === cls) {
                        return false;
                    }
                    if (has(cls,"__mixins__")) {
                        var clsMixines = cls["__mixins__"];
                        for (var i=0; i<clsMixines.length;i++) {
                            if (clsMixines[i]===mixin) {
                                return false;
                            }
                        }
                    }
                    cls = cls.superclass;
                }
                return true;
            });

            if (result.length>0) {
                return result;
            } else {
                return false;
            }
        }

        function mergeMixins(ctor,mixins) {
            var newCtor =ctor;
            for (var i=0;i<mixins.length;i++) {
                var xtor = new Function();
                xtor.prototype = Object.create(newCtor.prototype);
                xtor.__proto__ = newCtor;
                xtor.superclass = null;
                mixin(xtor.prototype,mixins[i].prototype);
                xtor.prototype.__mixin__ = mixins[i];
                newCtor = xtor;
            }

            return newCtor;
        }

        function _constructor ()  {
            if (this._construct) {
                return this._construct.apply(this, arguments);
            } else  if (this.init) {
                return this.init.apply(this, arguments);
            }
        }

        return function createClass(props, parent, mixins,options) {
            if (isArray(parent)) {
                options = mixins;
                mixins = parent;
                parent = null;
            }
            parent = parent || Object;

            if (isDefined(mixins) && !isArray(mixins)) {
                options = mixins;
                mixins = false;
            }

            var innerParent = parent;

            if (mixins) {
                mixins = serialMixins(innerParent,mixins);
            }

            if (mixins) {
                innerParent = mergeMixins(innerParent,mixins);
            }

            var klassName = props.klassName || "",
                ctor = new Function(
                    "return function " + klassName + "() {" +
                    "var inst = this," +
                    " ctor = arguments.callee;" +
                    "if (!(inst instanceof ctor)) {" +
                    "inst = Object.create(ctor.prototype);" +
                    "}" +
                    "return ctor._constructor.apply(inst, arguments) || inst;" + 
                    "}"
                )();


            // Populate our constructed prototype object
            ctor.prototype = Object.create(innerParent.prototype);

            // Enforce the constructor to be what we expect
            ctor.prototype.constructor = ctor;
            ctor.superclass = parent;

            // And make this class extendable
            ctor.__proto__ = innerParent;


            if (!ctor._constructor) {
                ctor._constructor = _constructor;
            } 

            if (mixins) {
                ctor.__mixins__ = mixins;
            }

            if (!ctor.partial) {
                ctor.partial = function(props, options) {
                    return extendClass(this, props, options);
                };
            }
            if (!ctor.inherit) {
                ctor.inherit = function(props, mixins,options) {
                    return createClass(props, this, mixins,options);
                };
            }

            ctor.partial(props, options);

            return ctor;
        };
    }

    var createClass = f1();

    return createClass;
});
define('skylark-langx/ArrayStore',[
    "./klass"
],function(klass){
    var SimpleQueryEngine = function(query, options){
        // summary:
        //      Simple query engine that matches using filter functions, named filter
        //      functions or objects by name-value on a query object hash
        //
        // description:
        //      The SimpleQueryEngine provides a way of getting a QueryResults through
        //      the use of a simple object hash as a filter.  The hash will be used to
        //      match properties on data objects with the corresponding value given. In
        //      other words, only exact matches will be returned.
        //
        //      This function can be used as a template for more complex query engines;
        //      for example, an engine can be created that accepts an object hash that
        //      contains filtering functions, or a string that gets evaluated, etc.
        //
        //      When creating a new dojo.store, simply set the store's queryEngine
        //      field as a reference to this function.
        //
        // query: Object
        //      An object hash with fields that may match fields of items in the store.
        //      Values in the hash will be compared by normal == operator, but regular expressions
        //      or any object that provides a test() method are also supported and can be
        //      used to match strings by more complex expressions
        //      (and then the regex's or object's test() method will be used to match values).
        //
        // options: dojo/store/api/Store.QueryOptions?
        //      An object that contains optional information such as sort, start, and count.
        //
        // returns: Function
        //      A function that caches the passed query under the field "matches".  See any
        //      of the "query" methods on dojo.stores.
        //
        // example:
        //      Define a store with a reference to this engine, and set up a query method.
        //
        //  |   var myStore = function(options){
        //  |       //  ...more properties here
        //  |       this.queryEngine = SimpleQueryEngine;
        //  |       //  define our query method
        //  |       this.query = function(query, options){
        //  |           return QueryResults(this.queryEngine(query, options)(this.data));
        //  |       };
        //  |   };

        // create our matching query function
        switch(typeof query){
            default:
                throw new Error("Can not query with a " + typeof query);
            case "object": case "undefined":
                var queryObject = query;
                query = function(object){
                    for(var key in queryObject){
                        var required = queryObject[key];
                        if(required && required.test){
                            // an object can provide a test method, which makes it work with regex
                            if(!required.test(object[key], object)){
                                return false;
                            }
                        }else if(required != object[key]){
                            return false;
                        }
                    }
                    return true;
                };
                break;
            case "string":
                // named query
                if(!this[query]){
                    throw new Error("No filter function " + query + " was found in store");
                }
                query = this[query];
                // fall through
            case "function":
                // fall through
        }
        
        function filter(arr, callback, thisObject){
            // summary:
            //      Returns a new Array with those items from arr that match the
            //      condition implemented by callback.
            // arr: Array
            //      the array to iterate over.
            // callback: Function|String
            //      a function that is invoked with three arguments (item,
            //      index, array). The return of this function is expected to
            //      be a boolean which determines whether the passed-in item
            //      will be included in the returned array.
            // thisObject: Object?
            //      may be used to scope the call to callback
            // returns: Array
            // description:
            //      This function corresponds to the JavaScript 1.6 Array.filter() method, with one difference: when
            //      run over sparse arrays, this implementation passes the "holes" in the sparse array to
            //      the callback function with a value of undefined. JavaScript 1.6's filter skips the holes in the sparse array.
            //      For more details, see:
            //      https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference/Objects/Array/filter
            // example:
            //  | // returns [2, 3, 4]
            //  | array.filter([1, 2, 3, 4], function(item){ return item>1; });

            // TODO: do we need "Ctr" here like in map()?
            var i = 0, l = arr && arr.length || 0, out = [], value;
            if(l && typeof arr == "string") arr = arr.split("");
            if(typeof callback == "string") callback = cache[callback] || buildFn(callback);
            if(thisObject){
                for(; i < l; ++i){
                    value = arr[i];
                    if(callback.call(thisObject, value, i, arr)){
                        out.push(value);
                    }
                }
            }else{
                for(; i < l; ++i){
                    value = arr[i];
                    if(callback(value, i, arr)){
                        out.push(value);
                    }
                }
            }
            return out; // Array
        }

        function execute(array){
            // execute the whole query, first we filter
            var results = filter(array, query);
            // next we sort
            var sortSet = options && options.sort;
            if(sortSet){
                results.sort(typeof sortSet == "function" ? sortSet : function(a, b){
                    for(var sort, i=0; sort = sortSet[i]; i++){
                        var aValue = a[sort.attribute];
                        var bValue = b[sort.attribute];
                        // valueOf enables proper comparison of dates
                        aValue = aValue != null ? aValue.valueOf() : aValue;
                        bValue = bValue != null ? bValue.valueOf() : bValue;
                        if (aValue != bValue){
                            // modified by lwf 2016/07/09
                            //return !!sort.descending == (aValue == null || aValue > bValue) ? -1 : 1;
                            return !!sort.descending == (aValue == null || aValue > bValue) ? -1 : 1;
                        }
                    }
                    return 0;
                });
            }
            // now we paginate
            if(options && (options.start || options.count)){
                var total = results.length;
                results = results.slice(options.start || 0, (options.start || 0) + (options.count || Infinity));
                results.total = total;
            }
            return results;
        }
        execute.matches = query;
        return execute;
    };

    var QueryResults = function(results){
        // summary:
        //      A function that wraps the results of a store query with additional
        //      methods.
        // description:
        //      QueryResults is a basic wrapper that allows for array-like iteration
        //      over any kind of returned data from a query.  While the simplest store
        //      will return a plain array of data, other stores may return deferreds or
        //      promises; this wrapper makes sure that *all* results can be treated
        //      the same.
        //
        //      Additional methods include `forEach`, `filter` and `map`.
        // results: Array|dojo/promise/Promise
        //      The result set as an array, or a promise for an array.
        // returns:
        //      An array-like object that can be used for iterating over.
        // example:
        //      Query a store and iterate over the results.
        //
        //  |   store.query({ prime: true }).forEach(function(item){
        //  |       //  do something
        //  |   });

        if(!results){
            return results;
        }

        var isPromise = !!results.then;
        // if it is a promise it may be frozen
        if(isPromise){
            results = Object.delegate(results);
        }
        function addIterativeMethod(method){
            // Always add the iterative methods so a QueryResults is
            // returned whether the environment is ES3 or ES5
            results[method] = function(){
                var args = arguments;
                var result = Deferred.when(results, function(results){
                    //Array.prototype.unshift.call(args, results);
                    return QueryResults(Array.prototype[method].apply(results, args));
                });
                // forEach should only return the result of when()
                // when we're wrapping a promise
                if(method !== "forEach" || isPromise){
                    return result;
                }
            };
        }

        addIterativeMethod("forEach");
        addIterativeMethod("filter");
        addIterativeMethod("map");
        if(results.total == null){
            results.total = Deferred.when(results, function(results){
                return results.length;
            });
        }
        return results; // Object
    };

    var ArrayStore = klass({
        "klassName": "ArrayStore",

        "queryEngine": SimpleQueryEngine,
        
        "idProperty": "id",


        get: function(id){
            // summary:
            //      Retrieves an object by its identity
            // id: Number
            //      The identity to use to lookup the object
            // returns: Object
            //      The object in the store that matches the given id.
            return this.data[this.index[id]];
        },

        getIdentity: function(object){
            return object[this.idProperty];
        },

        put: function(object, options){
            var data = this.data,
                index = this.index,
                idProperty = this.idProperty;
            var id = object[idProperty] = (options && "id" in options) ? options.id : idProperty in object ? object[idProperty] : Math.random();
            if(id in index){
                // object exists
                if(options && options.overwrite === false){
                    throw new Error("Object already exists");
                }
                // replace the entry in data
                data[index[id]] = object;
            }else{
                // add the new object
                index[id] = data.push(object) - 1;
            }
            return id;
        },

        add: function(object, options){
            (options = options || {}).overwrite = false;
            // call put with overwrite being false
            return this.put(object, options);
        },

        remove: function(id){
            // summary:
            //      Deletes an object by its identity
            // id: Number
            //      The identity to use to delete the object
            // returns: Boolean
            //      Returns true if an object was removed, falsy (undefined) if no object matched the id
            var index = this.index;
            var data = this.data;
            if(id in index){
                data.splice(index[id], 1);
                // now we have to reindex
                this.setData(data);
                return true;
            }
        },
        query: function(query, options){
            // summary:
            //      Queries the store for objects.
            // query: Object
            //      The query to use for retrieving objects from the store.
            // options: dojo/store/api/Store.QueryOptions?
            //      The optional arguments to apply to the resultset.
            // returns: dojo/store/api/Store.QueryResults
            //      The results of the query, extended with iterative methods.
            //
            // example:
            //      Given the following store:
            //
            //  |   var store = new Memory({
            //  |       data: [
            //  |           {id: 1, name: "one", prime: false },
            //  |           {id: 2, name: "two", even: true, prime: true},
            //  |           {id: 3, name: "three", prime: true},
            //  |           {id: 4, name: "four", even: true, prime: false},
            //  |           {id: 5, name: "five", prime: true}
            //  |       ]
            //  |   });
            //
            //  ...find all items where "prime" is true:
            //
            //  |   var results = store.query({ prime: true });
            //
            //  ...or find all items where "even" is true:
            //
            //  |   var results = store.query({ even: true });
            return QueryResults(this.queryEngine(query, options)(this.data));
        },

        setData: function(data){
            // summary:
            //      Sets the given data as the source for this store, and indexes it
            // data: Object[]
            //      An array of objects to use as the source of data.
            if(data.items){
                // just for convenience with the data format IFRS expects
                this.idProperty = data.identifier || this.idProperty;
                data = this.data = data.items;
            }else{
                this.data = data;
            }
            this.index = {};
            for(var i = 0, l = data.length; i < l; i++){
                this.index[data[i][this.idProperty]] = i;
            }
        },

        init: function(options) {
            for(var i in options){
                this[i] = options[i];
            }
            this.setData(this.data || []);
        }

    });

	return ArrayStore;
});
define('skylark-langx/aspect',[
],function(){

  var undefined, nextId = 0;
    function advise(dispatcher, type, advice, receiveArguments){
        var previous = dispatcher[type];
        var around = type == "around";
        var signal;
        if(around){
            var advised = advice(function(){
                return previous.advice(this, arguments);
            });
            signal = {
                remove: function(){
                    if(advised){
                        advised = dispatcher = advice = null;
                    }
                },
                advice: function(target, args){
                    return advised ?
                        advised.apply(target, args) :  // called the advised function
                        previous.advice(target, args); // cancelled, skip to next one
                }
            };
        }else{
            // create the remove handler
            signal = {
                remove: function(){
                    if(signal.advice){
                        var previous = signal.previous;
                        var next = signal.next;
                        if(!next && !previous){
                            delete dispatcher[type];
                        }else{
                            if(previous){
                                previous.next = next;
                            }else{
                                dispatcher[type] = next;
                            }
                            if(next){
                                next.previous = previous;
                            }
                        }

                        // remove the advice to signal that this signal has been removed
                        dispatcher = advice = signal.advice = null;
                    }
                },
                id: nextId++,
                advice: advice,
                receiveArguments: receiveArguments
            };
        }
        if(previous && !around){
            if(type == "after"){
                // add the listener to the end of the list
                // note that we had to change this loop a little bit to workaround a bizarre IE10 JIT bug
                while(previous.next && (previous = previous.next)){}
                previous.next = signal;
                signal.previous = previous;
            }else if(type == "before"){
                // add to beginning
                dispatcher[type] = signal;
                signal.next = previous;
                previous.previous = signal;
            }
        }else{
            // around or first one just replaces
            dispatcher[type] = signal;
        }
        return signal;
    }
    function aspect(type){
        return function(target, methodName, advice, receiveArguments){
            var existing = target[methodName], dispatcher;
            if(!existing || existing.target != target){
                // no dispatcher in place
                target[methodName] = dispatcher = function(){
                    var executionId = nextId;
                    // before advice
                    var args = arguments;
                    var before = dispatcher.before;
                    while(before){
                        args = before.advice.apply(this, args) || args;
                        before = before.next;
                    }
                    // around advice
                    if(dispatcher.around){
                        var results = dispatcher.around.advice(this, args);
                    }
                    // after advice
                    var after = dispatcher.after;
                    while(after && after.id < executionId){
                        if(after.receiveArguments){
                            var newResults = after.advice.apply(this, args);
                            // change the return value only if a new value was returned
                            results = newResults === undefined ? results : newResults;
                        }else{
                            results = after.advice.call(this, results, args);
                        }
                        after = after.next;
                    }
                    return results;
                };
                if(existing){
                    dispatcher.around = {advice: function(target, args){
                        return existing.apply(target, args);
                    }};
                }
                dispatcher.target = target;
            }
            var results = advise((dispatcher || existing), type, advice, receiveArguments);
            advice = null;
            return results;
        };
    }

    return {
        after: aspect("after"),
 
        around: aspect("around"),
        
        before: aspect("before")
    };
});
define('skylark-langx/funcs',[
    "./objects",
	"./types"
],function(objects,types){
	var mixin = objects.mixin,
        slice = Array.prototype.slice,
        isFunction = types.isFunction,
        isString = types.isString;

    function defer(fn) {
        if (requestAnimationFrame) {
            requestAnimationFrame(fn);
        } else {
            setTimeoutout(fn);
        }
        return this;
    }

    function noop() {
    }

    function proxy(fn, context) {
        var args = (2 in arguments) && slice.call(arguments, 2)
        if (isFunction(fn)) {
            var proxyFn = function() {
                return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments);
            }
            return proxyFn;
        } else if (isString(context)) {
            if (args) {
                args.unshift(fn[context], fn)
                return proxy.apply(null, args)
            } else {
                return proxy(fn[context], fn);
            }
        } else {
            throw new TypeError("expected function");
        }
    }

    function debounce(fn, wait) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                fn.apply(context, args);
            };
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
   
    var delegate = (function() {
        // boodman/crockford delegation w/ cornford optimization
        function TMP() {}
        return function(obj, props) {
            TMP.prototype = obj;
            var tmp = new TMP();
            TMP.prototype = null;
            if (props) {
                mixin(tmp, props);
            }
            return tmp; // Object
        };
    })();

  var templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };


  function template(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = objects.defaults({}, settings,templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offset.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    var render;
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

    return {
        debounce: debounce,

        delegate: delegate,

        defer: defer,

        noop : noop,

        proxy: proxy,

        returnTrue: function() {
            return true;
        },

        returnFalse: function() {
            return false;
        },

        templateSettings : templateSettings,
        template : template
    };
});
define('skylark-langx/Deferred',[
    "./arrays",
	"./funcs",
    "./objects"
],function(arrays,funcs,objects){
    "use strict";
    
    var  PGLISTENERS = Symbol ? Symbol() : '__pglisteners',
         PGNOTIFIES = Symbol ? Symbol() : '__pgnotifies';

    var slice = Array.prototype.slice,
        proxy = funcs.proxy,
        makeArray = arrays.makeArray,
        result = objects.result,
        mixin = objects.mixin;

    mixin(Promise.prototype,{
        always: function(handler) {
            //this.done(handler);
            //this.fail(handler);
            this.then(handler,handler);
            return this;
        },
        done : function() {
            for (var i = 0;i<arguments.length;i++) {
                this.then(arguments[i]);
            }
            return this;
        },
        fail : function(handler) { 
            //return mixin(Promise.prototype.catch.call(this,handler),added);
            //return this.then(null,handler);
            this.catch(handler);
            return this;
         }
    });


    var Deferred = function() {
        var self = this,
            p = this.promise = new Promise(function(resolve, reject) {
                self._resolve = resolve;
                self._reject = reject;
            });

        wrapPromise(p,self);

        this[PGLISTENERS] = [];
        this[PGNOTIFIES] = [];

        //this.resolve = Deferred.prototype.resolve.bind(this);
        //this.reject = Deferred.prototype.reject.bind(this);
        //this.progress = Deferred.prototype.progress.bind(this);

    };

    function wrapPromise(p,d) {
        var   added = {
                state : function() {
                    if (d.isResolved()) {
                        return 'resolved';
                    }
                    if (d.isRejected()) {
                        return 'rejected';
                    }
                    return 'pending';
                },
                then : function(onResolved,onRejected,onProgress) {
                    if (onProgress) {
                        this.progress(onProgress);
                    }
                    return wrapPromise(Promise.prototype.then.call(this,
                            onResolved && function(args) {
                                if (args && args.__ctx__ !== undefined) {
                                    return onResolved.apply(args.__ctx__,args);
                                } else {
                                    return onResolved(args);
                                }
                            },
                            onRejected && function(args){
                                if (args && args.__ctx__ !== undefined) {
                                    return onRejected.apply(args.__ctx__,args);
                                } else {
                                    return onRejected(args);
                                }
                            }));
                },
                progress : function(handler) {
                    d[PGNOTIFIES].forEach(function (value) {
                        handler(value);
                    });
                    d[PGLISTENERS].push(handler);
                    return this;
                }

            };

        added.pipe = added.then;
        return mixin(p,added);

    }

    Deferred.prototype.resolve = function(value) {
        var args = slice.call(arguments);
        return this.resolveWith(null,args);
    };

    Deferred.prototype.resolveWith = function(context,args) {
        args = args ? makeArray(args) : []; 
        args.__ctx__ = context;
        this._resolve(args);
        this._resolved = true;
        return this;
    };

    Deferred.prototype.notify = function(value) {
        try {
            this[PGNOTIFIES].push(value);

            return this[PGLISTENERS].forEach(function (listener) {
                return listener(value);
            });
        } catch (error) {
          this.reject(error);
        }
        return this;
    };

    Deferred.prototype.reject = function(reason) {
        var args = slice.call(arguments);
        return this.rejectWith(null,args);
    };

    Deferred.prototype.rejectWith = function(context,args) {
        args = args ? makeArray(args) : []; 
        args.__ctx__ = context;
        this._reject(args);
        this._rejected = true;
        return this;
    };

    Deferred.prototype.isResolved = function() {
        return !!this._resolved;
    };

    Deferred.prototype.isRejected = function() {
        return !!this._rejected;
    };

    Deferred.prototype.then = function(callback, errback, progback) {
        var p = result(this,"promise");
        return p.then(callback, errback, progback);
    };

    Deferred.prototype.progress = function(progback){
        var p = result(this,"promise");
        return p.progress(progback);
    };
   
    Deferred.prototype.catch = function(errback) {
        var p = result(this,"promise");
        return p.catch(errback);
    };


    Deferred.prototype.done  = function() {
        var p = result(this,"promise");
        return p.done.apply(p,arguments);
    };

    Deferred.prototype.fail = function(errback) {
        var p = result(this,"promise");
        return p.fail(errback);
    };


    Deferred.all = function(array) {
        //return wrapPromise(Promise.all(array));
        var d = new Deferred();
        Promise.all(array).then(d.resolve.bind(d),d.reject.bind(d));
        return result(d,"promise");
    };

    Deferred.first = function(array) {
        return wrapPromise(Promise.race(array));
    };


    Deferred.when = function(valueOrPromise, callback, errback, progback) {
        var receivedPromise = valueOrPromise && typeof valueOrPromise.then === "function";
        var nativePromise = receivedPromise && valueOrPromise instanceof Promise;

        if (!receivedPromise) {
            if (arguments.length > 1) {
                return callback ? callback(valueOrPromise) : valueOrPromise;
            } else {
                return new Deferred().resolve(valueOrPromise);
            }
        } else if (!nativePromise) {
            var deferred = new Deferred(valueOrPromise.cancel);
            valueOrPromise.then(proxy(deferred.resolve,deferred), proxy(deferred.reject,deferred), deferred.notify);
            valueOrPromise = deferred.promise;
        }

        if (callback || errback || progback) {
            return valueOrPromise.then(callback, errback, progback);
        }
        return valueOrPromise;
    };

    Deferred.reject = function(err) {
        var d = new Deferred();
        d.reject(err);
        return d.promise;
    };

    Deferred.resolve = function(data) {
        var d = new Deferred();
        d.resolve.apply(d,arguments);
        return d.promise;
    };

    Deferred.immediate = Deferred.resolve;

    return Deferred;
});
define('skylark-langx/async',[
    "./Deferred",
    "./objects"
],function(Deferred,objects){
    var each = objects.each;
    
    var async = {
        parallel : function(arr,args,ctx) {
            var rets = [];
            ctx = ctx || null;
            args = args || [];

            each(arr,function(i,func){
                rets.push(func.apply(ctx,args));
            });

            return Deferred.all(rets);
        },

        series : function(arr,args,ctx) {
            var rets = [],
                d = new Deferred(),
                p = d.promise;

            ctx = ctx || null;
            args = args || [];

            d.resolve();
            each(arr,function(i,func){
                p = p.then(function(){
                    return func.apply(ctx,args);
                });
                rets.push(p);
            });

            return Deferred.all(rets);
        },

        waterful : function(arr,args,ctx) {
            var d = new Deferred(),
                p = d.promise;

            ctx = ctx || null;
            args = args || [];

            d.resolveWith(ctx,args);

            each(arr,function(i,func){
                p = p.then(func);
            });
            return p;
        }
    };

	return async;	
});
define('skylark-langx/datetimes',[],function(){
     function parseMilliSeconds(str) {

        var strs = str.split(' ');
        var number = parseInt(strs[0]);

        if (isNaN(number)){
            return 0;
        }

        var min = 60000 * 60;

        switch (strs[1].trim().replace(/\./g, '')) {
            case 'minutes':
            case 'minute':
            case 'min':
            case 'mm':
            case 'm':
                return 60000 * number;
            case 'hours':
            case 'hour':
            case 'HH':
            case 'hh':
            case 'h':
            case 'H':
                return min * number;
            case 'seconds':
            case 'second':
            case 'sec':
            case 'ss':
            case 's':
                return 1000 * number;
            case 'days':
            case 'day':
            case 'DD':
            case 'dd':
            case 'd':
                return (min * 24) * number;
            case 'months':
            case 'month':
            case 'MM':
            case 'M':
                return (min * 24 * 28) * number;
            case 'weeks':
            case 'week':
            case 'W':
            case 'w':
                return (min * 24 * 7) * number;
            case 'years':
            case 'year':
            case 'yyyy':
            case 'yy':
            case 'y':
                return (min * 24 * 365) * number;
            default:
                return 0;
        }
    };
	
	return {
		parseMilliSeconds
	};
});
define('skylark-langx/Evented',[
    "./klass",
    "./arrays",
    "./objects",
    "./types"
],function(klass,arrays,objects,types){
    var slice = Array.prototype.slice,
        compact = arrays.compact,
        isDefined = types.isDefined,
        isPlainObject = types.isPlainObject,
        isFunction = types.isFunction,
        isString = types.isString,
        isEmptyObject = types.isEmptyObject,
        mixin = objects.mixin;

    function parse(event) {
        var segs = ("" + event).split(".");
        return {
            name: segs[0],
            ns: segs.slice(1).join(" ")
        };
    }

    var Evented = klass({
        on: function(events, selector, data, callback, ctx, /*used internally*/ one) {
            var self = this,
                _hub = this._hub || (this._hub = {});

            if (isPlainObject(events)) {
                ctx = callback;
                each(events, function(type, fn) {
                    self.on(type, selector, data, fn, ctx, one);
                });
                return this;
            }

            if (!isString(selector) && !isFunction(callback)) {
                ctx = callback;
                callback = data;
                data = selector;
                selector = undefined;
            }

            if (isFunction(data)) {
                ctx = callback;
                callback = data;
                data = null;
            }

            if (isString(events)) {
                events = events.split(/\s/)
            }

            events.forEach(function(event) {
                var parsed = parse(event),
                    name = parsed.name,
                    ns = parsed.ns;

                (_hub[name] || (_hub[name] = [])).push({
                    fn: callback,
                    selector: selector,
                    data: data,
                    ctx: ctx,
                    ns : ns,
                    one: one
                });
            });

            return this;
        },

        one: function(events, selector, data, callback, ctx) {
            return this.on(events, selector, data, callback, ctx, 1);
        },

        trigger: function(e /*,argument list*/ ) {
            if (!this._hub) {
                return this;
            }

            var self = this;

            if (isString(e)) {
                e = new CustomEvent(e);
            }

            Object.defineProperty(e,"target",{
                value : this
            });

            var args = slice.call(arguments, 1);
            if (isDefined(args)) {
                args = [e].concat(args);
            } else {
                args = [e];
            }
            [e.type || e.name, "all"].forEach(function(eventName) {
                var parsed = parse(eventName),
                    name = parsed.name,
                    ns = parsed.ns;

                var listeners = self._hub[name];
                if (!listeners) {
                    return;
                }

                var len = listeners.length,
                    reCompact = false;

                for (var i = 0; i < len; i++) {
                    var listener = listeners[i];
                    if (ns && (!listener.ns ||  !listener.ns.startsWith(ns))) {
                        continue;
                    }
                    if (e.data) {
                        if (listener.data) {
                            e.data = mixin({}, listener.data, e.data);
                        }
                    } else {
                        e.data = listener.data || null;
                    }
                    listener.fn.apply(listener.ctx, args);
                    if (listener.one) {
                        listeners[i] = null;
                        reCompact = true;
                    }
                }

                if (reCompact) {
                    self._hub[eventName] = compact(listeners);
                }

            });
            return this;
        },

        listened: function(event) {
            var evtArr = ((this._hub || (this._events = {}))[event] || []);
            return evtArr.length > 0;
        },

        listenTo: function(obj, event, callback, /*used internally*/ one) {
            if (!obj) {
                return this;
            }

            // Bind callbacks on obj,
            if (isString(callback)) {
                callback = this[callback];
            }

            if (one) {
                obj.one(event, callback, this);
            } else {
                obj.on(event, callback, this);
            }

            //keep track of them on listening.
            var listeningTo = this._listeningTo || (this._listeningTo = []),
                listening;

            for (var i = 0; i < listeningTo.length; i++) {
                if (listeningTo[i].obj == obj) {
                    listening = listeningTo[i];
                    break;
                }
            }
            if (!listening) {
                listeningTo.push(
                    listening = {
                        obj: obj,
                        events: {}
                    }
                );
            }
            var listeningEvents = listening.events,
                listeningEvent = listeningEvents[event] = listeningEvents[event] || [];
            if (listeningEvent.indexOf(callback) == -1) {
                listeningEvent.push(callback);
            }

            return this;
        },

        listenToOnce: function(obj, event, callback) {
            return this.listenTo(obj, event, callback, 1);
        },

        off: function(events, callback) {
            var _hub = this._hub || (this._hub = {});
            if (isString(events)) {
                events = events.split(/\s/)
            }

            events.forEach(function(event) {
                var parsed = parse(event),
                    name = parsed.name,
                    ns = parsed.ns;

                var evts = _hub[name];

                if (evts) {
                    var liveEvents = [];

                    if (callback || ns) {
                        for (var i = 0, len = evts.length; i < len; i++) {
                            
                            if (callback && evts[i].fn !== callback && evts[i].fn._ !== callback) {
                                liveEvents.push(evts[i]);
                                continue;
                            } 

                            if (ns && (!evts[i].ns || evts[i].ns.indexOf(ns)!=0)) {
                                liveEvents.push(evts[i]);
                                continue;
                            }
                        }
                    }

                    if (liveEvents.length) {
                        _hub[name] = liveEvents;
                    } else {
                        delete _hub[name];
                    }

                }
            });

            return this;
        },
        unlistenTo: function(obj, event, callback) {
            var listeningTo = this._listeningTo;
            if (!listeningTo) {
                return this;
            }
            for (var i = 0; i < listeningTo.length; i++) {
                var listening = listeningTo[i];

                if (obj && obj != listening.obj) {
                    continue;
                }

                var listeningEvents = listening.events;
                for (var eventName in listeningEvents) {
                    if (event && event != eventName) {
                        continue;
                    }

                    var listeningEvent = listeningEvents[eventName];

                    for (var j = 0; j < listeningEvent.length; j++) {
                        if (!callback || callback == listeningEvent[i]) {
                            listening.obj.off(eventName, listeningEvent[i], this);
                            listeningEvent[i] = null;
                        }
                    }

                    listeningEvent = listeningEvents[eventName] = compact(listeningEvent);

                    if (isEmptyObject(listeningEvent)) {
                        listeningEvents[eventName] = null;
                    }

                }

                if (isEmptyObject(listeningEvents)) {
                    listeningTo[i] = null;
                }
            }

            listeningTo = this._listeningTo = compact(listeningTo);
            if (isEmptyObject(listeningTo)) {
                this._listeningTo = null;
            }

            return this;
        }
    });

    return Evented;

});
define('skylark-langx/hoster',[
],function(){
	// The javascript host environment, brower and nodejs are supported.
	var hoster = {
		"isBrowser" : true, // default
		"isNode" : null,
		"global" : this,
		"browser" : null,
		"node" : null
	};

	if (typeof process == "object" && process.versions && process.versions.node && process.versions.v8) {
		hoster.isNode = true;
		hoster.isBrowser = false;
	}

	hoster.global = (function(){
		if (typeof global !== 'undefined' && typeof global !== 'function') {
			// global spec defines a reference to the global object called 'global'
			// https://github.com/tc39/proposal-global
			// `global` is also defined in NodeJS
			return global;
		} else if (typeof window !== 'undefined') {
			// window is defined in browsers
			return window;
		}
		else if (typeof self !== 'undefined') {
			// self is defined in WebWorkers
			return self;
		}
		return this;
	})();

	var _document = null;

	Object.defineProperty(hoster,"document",function(){
		if (!_document) {
			var w = typeof window === 'undefined' ? require('html-element') : window;
			_document = w.document;
		}

		return _document;
	});

	if (hoster.isBrowser) {
	    function uaMatch( ua ) {
		    ua = ua.toLowerCase();

		    var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
		      /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
		      /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
		      /(msie) ([\w.]+)/.exec( ua ) ||
		      ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
		      [];

		    return {
		      browser: match[ 1 ] || '',
		      version: match[ 2 ] || '0'
		    };
	  	};

	    var matched = uaMatch( navigator.userAgent );

	    var browser = hoster.browser = {};

	    if ( matched.browser ) {
	      browser[ matched.browser ] = true;
	      browser.version = matched.version;
	    }

	    // Chrome is Webkit, but Webkit is also Safari.
	    if ( browser.chrome ) {
	      browser.webkit = true;
	    } else if ( browser.webkit ) {
	      browser.safari = true;
	    }
	}

	return  hoster;
});
define('skylark-langx/strings',[
],function(){

     /*
     * Converts camel case into dashes.
     * @param {String} str
     * @return {String}
     * @exapmle marginTop -> margin-top
     */
    function dasherize(str) {
        return str.replace(/::/g, '/')
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .replace(/([a-z\d])([A-Z])/g, '$1_$2')
            .replace(/_/g, '-')
            .toLowerCase();
    }

    function deserializeValue(value) {
        try {
            return value ?
                value == "true" ||
                (value == "false" ? false :
                    value == "null" ? null :
                    +value + "" == value ? +value :
                    /^[\[\{]/.test(value) ? JSON.parse(value) :
                    value) : value;
        } catch (e) {
            return value;
        }
    }


    function trim(str) {
        return str == null ? "" : String.prototype.trim.call(str);
    }
    function substitute( /*String*/ template,
        /*Object|Array*/
        map,
        /*Function?*/
        transform,
        /*Object?*/
        thisObject) {
        // summary:
        //    Performs parameterized substitutions on a string. Throws an
        //    exception if any parameter is unmatched.
        // template:
        //    a string with expressions in the form `${key}` to be replaced or
        //    `${key:format}` which specifies a format function. keys are case-sensitive.
        // map:
        //    hash to search for substitutions
        // transform:
        //    a function to process all parameters before substitution takes


        thisObject = thisObject || window;
        transform = transform ?
            proxy(thisObject, transform) : function(v) {
                return v;
            };

        function getObject(key, map) {
            if (key.match(/\./)) {
                var retVal,
                    getValue = function(keys, obj) {
                        var _k = keys.pop();
                        if (_k) {
                            if (!obj[_k]) return null;
                            return getValue(keys, retVal = obj[_k]);
                        } else {
                            return retVal;
                        }
                    };
                return getValue(key.split(".").reverse(), map);
            } else {
                return map[key];
            }
        }

        return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,
            function(match, key, format) {
                var value = getObject(key, map);
                if (format) {
                    value = getObject(format, thisObject).call(thisObject, value, key);
                }
                return transform(value, key).toString();
            }); // String
    }

    var idCounter = 0;
    function uniqueId (prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    }

	return {
        camelCase: function(str) {
            return str.replace(/-([\da-z])/g, function(a) {
                return a.toUpperCase().replace('-', '');
            });
        },

        dasherize: dasherize,

        deserializeValue: deserializeValue,

        lowerFirst: function(str) {
            return str.charAt(0).toLowerCase() + str.slice(1);
        },

        serializeValue: function(value) {
            return JSON.stringify(value)
        },


        substitute: substitute,

        trim: trim,

        uniqueId: uniqueId,

        upperFirst: function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
	} ; 

});
define('skylark-langx/Xhr',[
    "./arrays",
    "./Deferred",
    "./Evented",
    "./objects",
    "./funcs",
    "./types"
],function(arrays,Deferred,Evented,objects,funcs,types){
    var each = objects.each,
        mixin = objects.mixin,
        noop = funcs.noop,
        isArray = types.isArray,
        isFunction = types.isFunction,
        isPlainObject = types.isPlainObject,
        type = types.type;
 
     var getAbsoluteUrl = (function() {
        var a;

        return function(url) {
            if (!a) a = document.createElement('a');
            a.href = url;

            return a.href;
        };
    })();
   
    var Xhr = (function(){
        var jsonpID = 0,
            key,
            name,
            rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            scriptTypeRE = /^(?:text|application)\/javascript/i,
            xmlTypeRE = /^(?:text|application)\/xml/i,
            jsonType = 'application/json',
            htmlType = 'text/html',
            blankRE = /^\s*$/;

        var XhrDefaultOptions = {
            async: true,

            // Default type of request
            type: 'GET',
            // Callback that is executed before request
            beforeSend: noop,
            // Callback that is executed if the request succeeds
            success: noop,
            // Callback that is executed the the server drops error
            error: noop,
            // Callback that is executed on request complete (both: error and success)
            complete: noop,
            // The context for the callbacks
            context: null,
            // Whether to trigger "global" Ajax events
            global: true,

            // MIME types mapping
            // IIS returns Javascript as "application/x-javascript"
            accepts: {
                script: 'text/javascript, application/javascript, application/x-javascript',
                json: 'application/json',
                xml: 'application/xml, text/xml',
                html: 'text/html',
                text: 'text/plain'
            },
            // Whether the request is to another domain
            crossDomain: false,
            // Default timeout
            timeout: 0,
            // Whether data should be serialized to string
            processData: true,
            // Whether the browser should be allowed to cache GET responses
            cache: true,

            xhrFields : {
                withCredentials : true
            }
        };

        function mimeToDataType(mime) {
            if (mime) {
                mime = mime.split(';', 2)[0];
            }
            if (mime) {
                if (mime == htmlType) {
                    return "html";
                } else if (mime == jsonType) {
                    return "json";
                } else if (scriptTypeRE.test(mime)) {
                    return "script";
                } else if (xmlTypeRE.test(mime)) {
                    return "xml";
                }
            }
            return "text";
        }

        function appendQuery(url, query) {
            if (query == '') return url
            return (url + '&' + query).replace(/[&?]{1,2}/, '?')
        }

        // serialize payload and append it to the URL for GET requests
        function serializeData(options) {
            options.data = options.data || options.query;
            if (options.processData && options.data && type(options.data) != "string") {
                options.data = param(options.data, options.traditional);
            }
            if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) {
                options.url = appendQuery(options.url, options.data);
                options.data = undefined;
            }
        }

        function serialize(params, obj, traditional, scope) {
            var t, array = isArray(obj),
                hash = isPlainObject(obj)
            each(obj, function(key, value) {
                t =type(value);
                if (scope) key = traditional ? scope :
                    scope + '[' + (hash || t == 'object' || t == 'array' ? key : '') + ']'
                // handle data in serializeArray() format
                if (!scope && array) params.add(value.name, value.value)
                // recurse into nested objects
                else if (t == "array" || (!traditional && t == "object"))
                    serialize(params, value, traditional, key)
                else params.add(key, value)
            })
        }

        var param = function(obj, traditional) {
            var params = []
            params.add = function(key, value) {
                if (isFunction(value)) value = value()
                if (value == null) value = ""
                this.push(escape(key) + '=' + escape(value))
            }
            serialize(params, obj, traditional)
            return params.join('&').replace(/%20/g, '+')
        };

        var Xhr = Evented.inherit({
            klassName : "Xhr",

            _request  : function(args) {
                var _ = this._,
                    self = this,
                    options = mixin({},XhrDefaultOptions,_.options,args),
                    xhr = _.xhr = new XMLHttpRequest();

                serializeData(options)

                var dataType = options.dataType || options.handleAs,
                    mime = options.mimeType || options.accepts[dataType],
                    headers = options.headers,
                    xhrFields = options.xhrFields,
                    isFormData = options.data && options.data instanceof FormData,
                    basicAuthorizationToken = options.basicAuthorizationToken,
                    type = options.type,
                    url = options.url,
                    async = options.async,
                    user = options.user , 
                    password = options.password,
                    deferred = new Deferred(),
                    contentType = isFormData ? false : 'application/x-www-form-urlencoded';

                if (xhrFields) {
                    for (name in xhrFields) {
                        xhr[name] = xhrFields[name];
                    }
                }

                if (mime && mime.indexOf(',') > -1) {
                    mime = mime.split(',', 2)[0];
                }
                if (mime && xhr.overrideMimeType) {
                    xhr.overrideMimeType(mime);
                }

                //if (dataType) {
                //    xhr.responseType = dataType;
                //}

                var finish = function() {
                    xhr.onloadend = noop;
                    xhr.onabort = noop;
                    xhr.onprogress = noop;
                    xhr.ontimeout = noop;
                    xhr = null;
                }
                var onloadend = function() {
                    var result, error = false
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && getAbsoluteUrl(url).startsWith('file:'))) {
                        dataType = dataType || mimeToDataType(options.mimeType || xhr.getResponseHeader('content-type'));

                        result = xhr.responseText;
                        try {
                            if (dataType == 'script') {
                                eval(result);
                            } else if (dataType == 'xml') {
                                result = xhr.responseXML;
                            } else if (dataType == 'json') {
                                result = blankRE.test(result) ? null : JSON.parse(result);
                            } else if (dataType == "blob") {
                                result = Blob([xhrObj.response]);
                            } else if (dataType == "arraybuffer") {
                                result = xhr.reponse;
                            }
                        } catch (e) { 
                            error = e;
                        }

                        if (error) {
                            deferred.reject(error,xhr.status,xhr);
                        } else {
                            deferred.resolve(result,xhr.status,xhr);
                        }
                    } else {
                        deferred.reject(new Error(xhr.statusText),xhr.status,xhr);
                    }
                    finish();
                };

                var onabort = function() {
                    if (deferred) {
                        deferred.reject(new Error("abort"),xhr.status,xhr);
                    }
                    finish();                 
                }
 
                var ontimeout = function() {
                    if (deferred) {
                        deferred.reject(new Error("timeout"),xhr.status,xhr);
                    }
                    finish();                 
                }

                var onprogress = function(evt) {
                    if (deferred) {
                        deferred.notify(evt,xhr.status,xhr);
                    }
                }

                xhr.onloadend = onloadend;
                xhr.onabort = onabort;
                xhr.ontimeout = ontimeout;
                xhr.onprogress = onprogress;

                xhr.open(type, url, async, user, password);
               
                if (headers) {
                    for ( var key in headers) {
                        var value = headers[key];
 
                        if(key.toLowerCase() === 'content-type'){
                            contentType = headers[hdr];
                        } else {
                           xhr.setRequestHeader(key, value);
                        }
                    }
                }   

                if  (contentType && contentType !== false){
                    xhr.setRequestHeader('Content-Type', contentType);
                }

                if(!headers || !('X-Requested-With' in headers)){
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                }


                //If basicAuthorizationToken is defined set its value into "Authorization" header
                if (basicAuthorizationToken) {
                    xhr.setRequestHeader("Authorization", basicAuthorizationToken);
                }

                xhr.send(options.data ? options.data : null);

                return deferred.promise;

            },

            "abort": function() {
                var _ = this._,
                    xhr = _.xhr;

                if (xhr) {
                    xhr.abort();
                }    
            },


            "request": function(args) {
                return this._request(args);
            },

            get : function(args) {
                args = args || {};
                args.type = "GET";
                return this._request(args);
            },

            post : function(args) {
                args = args || {};
                args.type = "POST";
                return this._request(args);
            },

            patch : function(args) {
                args = args || {};
                args.type = "PATCH";
                return this._request(args);
            },

            put : function(args) {
                args = args || {};
                args.type = "PUT";
                return this._request(args);
            },

            del : function(args) {
                args = args || {};
                args.type = "DELETE";
                return this._request(args);
            },

            "init": function(options) {
                this._ = {
                    options : options || {}
                };
            }
        });

        ["request","get","post","put","del","patch"].forEach(function(name){
            Xhr[name] = function(url,args) {
                var xhr = new Xhr({"url" : url});
                return xhr[name](args);
            };
        });

        Xhr.defaultOptions = XhrDefaultOptions;
        Xhr.param = param;

        return Xhr;
    })();

	return Xhr;	
});
define('skylark-langx/Restful',[
    "./Evented",
    "./objects",
    "./strings",
    "./Xhr"
],function(Evented,objects,strings,Xhr){
    var mixin = objects.mixin,
        substitute = strings.substitute;

    var Restful = Evented.inherit({
        "klassName" : "Restful",

        "idAttribute": "id",
        
        getBaseUrl : function(args) {
            //$$baseEndpoint : "/files/${fileId}/comments",
            var baseEndpoint = substitute(this.baseEndpoint,args),
                baseUrl = this.server + this.basePath + baseEndpoint;
            if (args[this.idAttribute]!==undefined) {
                baseUrl = baseUrl + "/" + args[this.idAttribute]; 
            }
            return baseUrl;
        },
        _head : function(args) {
            //get resource metadata .
            //args : id and other info for the resource ,ex
            //{
            //  "id" : 234,  // the own id, required
            //  "fileId"   : 2 // the parent resource id, option by resource
            //}
        },
        _get : function(args) {
            //get resource ,one or list .
            //args : id and other info for the resource ,ex
            //{
            //  "id" : 234,  // the own id, null if list
            //  "fileId"   : 2 // the parent resource id, option by resource
            //}
            return Xhr.get(this.getBaseUrl(args),args);
        },
        _post  : function(args,verb) {
            //create or move resource .
            //args : id and other info for the resource ,ex
            //{
            //  "id" : 234,  // the own id, required
            //  "data" : body // the own data,required
            //  "fileId"   : 2 // the parent resource id, option by resource
            //}
            //verb : the verb ,ex: copy,touch,trash,untrash,watch
            var url = this.getBaseUrl(args);
            if (verb) {
                url = url + "/" + verb;
            }
            return Xhr.post(url, args);
        },

        _put  : function(args,verb) {
            //update resource .
            //args : id and other info for the resource ,ex
            //{
            //  "id" : 234,  // the own id, required
            //  "data" : body // the own data,required
            //  "fileId"   : 2 // the parent resource id, option by resource
            //}
            //verb : the verb ,ex: copy,touch,trash,untrash,watch
            var url = this.getBaseUrl(args);
            if (verb) {
                url = url + "/" + verb;
            }
            return Xhr.put(url, args);
        },

        _delete : function(args) {
            //delete resource . 
            //args : id and other info for the resource ,ex
            //{
            //  "id" : 234,  // the own id, required
            //  "fileId"   : 2 // the parent resource id, option by resource
            //}         

            // HTTP request : DELETE http://center.utilhub.com/registry/v1/apps/{appid}
            var url = this.getBaseUrl(args);
            return Xhr.del(url);
        },

        _patch : function(args){
            //update resource metadata. 
            //args : id and other info for the resource ,ex
            //{
            //  "id" : 234,  // the own id, required
            //  "data" : body // the own data,required
            //  "fileId"   : 2 // the parent resource id, option by resource
            //}
            var url = this.getBaseUrl(args);
            return Xhr.patch(url, args);
        },
        query: function(params) {
            
            return this._post(params);
        },

        retrieve: function(params) {
            return this._get(params);
        },

        create: function(params) {
            return this._post(params);
        },

        update: function(params) {
            return this._put(params);
        },

        delete: function(params) {
            // HTTP request : DELETE http://center.utilhub.com/registry/v1/apps/{appid}
            return this._delete(params);
        },

        patch: function(params) {
           // HTTP request : PATCH http://center.utilhub.com/registry/v1/apps/{appid}
            return this._patch(params);
        },
        init: function(params) {
            mixin(this,params);
 //           this._xhr = XHRx();
       }
    });

    return Restful;
});
define('skylark-langx/Stateful',[
	"./Evented",
  "./strings",
  "./objects"
],function(Evented,strings,objects){
    var isEqual = objects.isEqual,
        mixin = objects.mixin,
        result = objects.result,
        isEmptyObject = objects.isEmptyObject,
        clone = objects.clone,
        uniqueId = strings.uniqueId;

    var Stateful = Evented.inherit({
        _construct : function(attributes, options) {
            var attrs = attributes || {};
            options || (options = {});
            this.cid = uniqueId(this.cidPrefix);
            this.attributes = {};
            if (options.collection) this.collection = options.collection;
            if (options.parse) attrs = this.parse(attrs, options) || {};
            var defaults = result(this, 'defaults');
            attrs = mixin({}, defaults, attrs);
            this.set(attrs, options);
            this.changed = {};
        },

        // A hash of attributes whose current and previous value differ.
        changed: null,

        // The value returned during the last failed validation.
        validationError: null,

        // The default name for the JSON `id` attribute is `"id"`. MongoDB and
        // CouchDB users may want to set this to `"_id"`.
        idAttribute: 'id',

        // The prefix is used to create the client id which is used to identify models locally.
        // You may want to override this if you're experiencing name clashes with model ids.
        cidPrefix: 'c',


        // Return a copy of the model's `attributes` object.
        toJSON: function(options) {
          return clone(this.attributes);
        },


        // Get the value of an attribute.
        get: function(attr) {
          return this.attributes[attr];
        },

        // Returns `true` if the attribute contains a value that is not null
        // or undefined.
        has: function(attr) {
          return this.get(attr) != null;
        },

        // Set a hash of model attributes on the object, firing `"change"`. This is
        // the core primitive operation of a model, updating the data and notifying
        // anyone who needs to know about the change in state. The heart of the beast.
        set: function(key, val, options) {
          if (key == null) return this;

          // Handle both `"key", value` and `{key: value}` -style arguments.
          var attrs;
          if (typeof key === 'object') {
            attrs = key;
            options = val;
          } else {
            (attrs = {})[key] = val;
          }

          options || (options = {});

          // Run validation.
          if (!this._validate(attrs, options)) return false;

          // Extract attributes and options.
          var unset      = options.unset;
          var silent     = options.silent;
          var changes    = [];
          var changing   = this._changing;
          this._changing = true;

          if (!changing) {
            this._previousAttributes = clone(this.attributes);
            this.changed = {};
          }

          var current = this.attributes;
          var changed = this.changed;
          var prev    = this._previousAttributes;

          // For each `set` attribute, update or delete the current value.
          for (var attr in attrs) {
            val = attrs[attr];
            if (!isEqual(current[attr], val)) changes.push(attr);
            if (!isEqual(prev[attr], val)) {
              changed[attr] = val;
            } else {
              delete changed[attr];
            }
            unset ? delete current[attr] : current[attr] = val;
          }

          // Update the `id`.
          if (this.idAttribute in attrs) this.id = this.get(this.idAttribute);

          // Trigger all relevant attribute changes.
          if (!silent) {
            if (changes.length) this._pending = options;
            for (var i = 0; i < changes.length; i++) {
              this.trigger('change:' + changes[i], this, current[changes[i]], options);
            }
          }

          // You might be wondering why there's a `while` loop here. Changes can
          // be recursively nested within `"change"` events.
          if (changing) return this;
          if (!silent) {
            while (this._pending) {
              options = this._pending;
              this._pending = false;
              this.trigger('change', this, options);
            }
          }
          this._pending = false;
          this._changing = false;
          return this;
        },

        // Remove an attribute from the model, firing `"change"`. `unset` is a noop
        // if the attribute doesn't exist.
        unset: function(attr, options) {
          return this.set(attr, void 0, mixin({}, options, {unset: true}));
        },

        // Clear all attributes on the model, firing `"change"`.
        clear: function(options) {
          var attrs = {};
          for (var key in this.attributes) attrs[key] = void 0;
          return this.set(attrs, mixin({}, options, {unset: true}));
        },

        // Determine if the model has changed since the last `"change"` event.
        // If you specify an attribute name, determine if that attribute has changed.
        hasChanged: function(attr) {
          if (attr == null) return !isEmptyObject(this.changed);
          return this.changed[attr] !== undefined;
        },

        // Return an object containing all the attributes that have changed, or
        // false if there are no changed attributes. Useful for determining what
        // parts of a view need to be updated and/or what attributes need to be
        // persisted to the server. Unset attributes will be set to undefined.
        // You can also pass an attributes object to diff against the model,
        // determining if there *would be* a change.
        changedAttributes: function(diff) {
          if (!diff) return this.hasChanged() ? clone(this.changed) : false;
          var old = this._changing ? this._previousAttributes : this.attributes;
          var changed = {};
          for (var attr in diff) {
            var val = diff[attr];
            if (isEqual(old[attr], val)) continue;
            changed[attr] = val;
          }
          return !isEmptyObject(changed) ? changed : false;
        },

        // Get the previous value of an attribute, recorded at the time the last
        // `"change"` event was fired.
        previous: function(attr) {
          if (attr == null || !this._previousAttributes) return null;
          return this._previousAttributes[attr];
        },

        // Get all of the attributes of the model at the time of the previous
        // `"change"` event.
        previousAttributes: function() {
          return clone(this._previousAttributes);
        },

        // Create a new model with identical attributes to this one.
        clone: function() {
          return new this.constructor(this.attributes);
        },

        // A model is new if it has never been saved to the server, and lacks an id.
        isNew: function() {
          return !this.has(this.idAttribute);
        },

        // Check if the model is currently in a valid state.
        isValid: function(options) {
          return this._validate({}, mixin({}, options, {validate: true}));
        },

        // Run validation against the next complete set of model attributes,
        // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
        _validate: function(attrs, options) {
          if (!options.validate || !this.validate) return true;
          attrs = mixin({}, this.attributes, attrs);
          var error = this.validationError = this.validate(attrs, options) || null;
          if (!error) return true;
          this.trigger('invalid', this, error, mixin(options, {validationError: error}));
          return false;
        }
    });

	return Stateful;
});
define('skylark-langx/topic',[
	"./Evented"
],function(Evented){
	var hub = new Evented();

	return {
	    publish: function(name, arg1,argn) {
	        var data = [].slice.call(arguments, 1);

	        return hub.trigger({
	            type : name,
	            data : data
	        });
	    },

        subscribe: function(name, listener,ctx) {
        	var handler = function(e){
                listener.apply(ctx,e.data);
            };
            hub.on(name, handler);
            return {
            	remove : function(){
            		hub.off(name,handler);
            	}
            }

        }

	}
});
define('skylark-langx/langx',[
    "./skylark",
    "./arrays",
    "./ArrayStore",
    "./aspect",
    "./async",
    "./datetimes",
    "./Deferred",
    "./Evented",
    "./funcs",
    "./hoster",
    "./klass",
    "./numbers",
    "./objects",
    "./Restful",
    "./Stateful",
    "./strings",
    "./topic",
    "./types",
    "./Xhr"
], function(skylark,arrays,ArrayStore,aspect,async,datetimes,Deferred,Evented,funcs,hoster,klass,numbers,objects,Restful,Stateful,strings,topic,types,Xhr) {
    "use strict";
    var toString = {}.toString,
        concat = Array.prototype.concat,
        indexOf = Array.prototype.indexOf,
        slice = Array.prototype.slice,
        filter = Array.prototype.filter,
        mixin = objects.mixin,
        safeMixin = objects.safeMixin,
        isFunction = types.isFunction;


    function createEvent(type, props) {
        var e = new CustomEvent(type, props);

        return safeMixin(e, props);
    }
    

    function funcArg(context, arg, idx, payload) {
        return isFunction(arg) ? arg.call(context, idx, payload) : arg;
    }

    function getQueryParams(url) {
        var url = url || window.location.href,
            segs = url.split("?"),
            params = {};

        if (segs.length > 1) {
            segs[1].split("&").forEach(function(queryParam) {
                var nv = queryParam.split('=');
                params[nv[0]] = nv[1];
            });
        }
        return params;
    }


    function toPixel(value) {
        // style values can be floats, client code may want
        // to round for integer pixels.
        return parseFloat(value) || 0;
    }


    var _uid = 1;

    function uid(obj) {
        return obj._uid || (obj._uid = _uid++);
    }

    function langx() {
        return langx;
    }

    mixin(langx, {
        createEvent : createEvent,

        funcArg: funcArg,

        getQueryParams: getQueryParams,

        toPixel: toPixel,

        uid: uid,

        URL: typeof window !== "undefined" ? window.URL || window.webkitURL : null

    });


    mixin(langx, arrays,aspect,datetimes,funcs,numbers,objects,strings,types,{
        ArrayStore : ArrayStore,

        async : async,
        
        Deferred: Deferred,

        Evented: Evented,

        hoster : hoster,

        klass : klass,

        Restful: Restful,
        
        Stateful: Stateful,

        topic : topic,

        Xhr: Xhr

    });

    return skylark.langx = langx;
});
define('skylark-data-zip/_stuk/jszip',[], function() {
/*!

JSZip v3.1.3 - A Javascript class for generating and reading zip files
<http://stuartk.com/jszip>

(c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/master/LICENSE.markdown.

JSZip uses the library pako released under the MIT license :
https://github.com/nodeca/pako/blob/master/LICENSE
*/

     function init(cache, registry, preloads) {
        function getModule(moduleId, u) {
            if (!registry[moduleId]) {
                if (!cache[moduleId]) {
                    var a = typeof require=="function"&&require;
                    if (!u && a) return a(moduleId, !0);
                    if (i) return i(moduleId, !0);
                    var f = new Error("Cannot find module '" + moduleId + "'");
                    throw f.code = "MODULE_NOT_FOUND", f
                }
                var module = registry[moduleId] = {
                    exports: {}
                };
                cache[moduleId][0].call(module.exports, function require(modulePath) {
                    var depId = cache[moduleId][1][modulePath];
                    return getModule(depId ? depId : modulePath)
                }, module, module.exports, init, cache, registry, preloads)
            }
            return registry[moduleId].exports;
        }
        var i = typeof require=="function"&&require;
        for (var j = 0; j < preloads.length; j++) {
            getModule(preloads[j]);
        }
        return getModule;
    }

    var cache = {
        1: [function(require, module, exports) {
            'use strict';
            var utils = require('./utils');
            var support = require('./support');
            // private property
            var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";


            // public method for encoding
            exports.encode = function(input) {
                var output = [];
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0,
                    len = input.length,
                    remainingBytes = len;

                var isArray = utils.getTypeOf(input) !== "string";
                while (i < input.length) {
                    remainingBytes = len - i;

                    if (!isArray) {
                        chr1 = input.charCodeAt(i++);
                        chr2 = i < len ? input.charCodeAt(i++) : 0;
                        chr3 = i < len ? input.charCodeAt(i++) : 0;
                    } else {
                        chr1 = input[i++];
                        chr2 = i < len ? input[i++] : 0;
                        chr3 = i < len ? input[i++] : 0;
                    }

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = remainingBytes > 1 ? (((chr2 & 15) << 2) | (chr3 >> 6)) : 64;
                    enc4 = remainingBytes > 2 ? (chr3 & 63) : 64;

                    output.push(_keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4));

                }

                return output.join("");
            };

            // public method for decoding
            exports.decode = function(input) {
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0,
                    resultIndex = 0;

                var dataUrlPrefix = "data:";

                if (input.substr(0, dataUrlPrefix.length) === dataUrlPrefix) {
                    // This is a common error: people give a data url
                    // (data:image/png;base64,iVBOR...) with a {base64: true} and
                    // wonders why things don't work.
                    // We can detect that the string input looks like a data url but we
                    // *can't* be sure it is one: removing everything up to the comma would
                    // be too dangerous.
                    throw new Error("Invalid base64 input, it looks like a data url.");
                }

                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

                var totalLength = input.length * 3 / 4;
                if (input.charAt(input.length - 1) === _keyStr.charAt(64)) {
                    totalLength--;
                }
                if (input.charAt(input.length - 2) === _keyStr.charAt(64)) {
                    totalLength--;
                }
                if (totalLength % 1 !== 0) {
                    // totalLength is not an integer, the length does not match a valid
                    // base64 content. That can happen if:
                    // - the input is not a base64 content
                    // - the input is *almost* a base64 content, with a extra chars at the
                    //   beginning or at the end
                    // - the input uses a base64 variant (base64url for example)
                    throw new Error("Invalid base64 input, bad content length.");
                }
                var output;
                if (support.uint8array) {
                    output = new Uint8Array(totalLength | 0);
                } else {
                    output = new Array(totalLength | 0);
                }

                while (i < input.length) {

                    enc1 = _keyStr.indexOf(input.charAt(i++));
                    enc2 = _keyStr.indexOf(input.charAt(i++));
                    enc3 = _keyStr.indexOf(input.charAt(i++));
                    enc4 = _keyStr.indexOf(input.charAt(i++));

                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;

                    output[resultIndex++] = chr1;

                    if (enc3 !== 64) {
                        output[resultIndex++] = chr2;
                    }
                    if (enc4 !== 64) {
                        output[resultIndex++] = chr3;
                    }

                }

                return output;
            };

        }, {
            "./support": 30,
            "./utils": 32
        }],
        2: [function(require, module, exports) {
            'use strict';

            var external = require("./external");
            var DataWorker = require('./stream/DataWorker');
            var DataLengthProbe = require('./stream/DataLengthProbe');
            var Crc32Probe = require('./stream/Crc32Probe');
            var DataLengthProbe = require('./stream/DataLengthProbe');

            /**
             * Represent a compressed object, with everything needed to decompress it.
             * @constructor
             * @param {number} compressedSize the size of the data compressed.
             * @param {number} uncompressedSize the size of the data after decompression.
             * @param {number} crc32 the crc32 of the decompressed file.
             * @param {object} compression the type of compression, see lib/compressions.js.
             * @param {String|ArrayBuffer|Uint8Array|Buffer} data the compressed data.
             */
            function CompressedObject(compressedSize, uncompressedSize, crc32, compression, data) {
                this.compressedSize = compressedSize;
                this.uncompressedSize = uncompressedSize;
                this.crc32 = crc32;
                this.compression = compression;
                this.compressedContent = data;
            }

            CompressedObject.prototype = {
                /**
                 * Create a worker to get the uncompressed content.
                 * @return {GenericWorker} the worker.
                 */
                getContentWorker: function() {
                    var worker = new DataWorker(external.Promise.resolve(this.compressedContent))
                        .pipe(this.compression.uncompressWorker())
                        .pipe(new DataLengthProbe("data_length"));

                    var that = this;
                    worker.on("end", function() {
                        if (this.streamInfo['data_length'] !== that.uncompressedSize) {
                            throw new Error("Bug : uncompressed data size mismatch");
                        }
                    });
                    return worker;
                },
                /**
                 * Create a worker to get the compressed content.
                 * @return {GenericWorker} the worker.
                 */
                getCompressedWorker: function() {
                    return new DataWorker(external.Promise.resolve(this.compressedContent))
                        .withStreamInfo("compressedSize", this.compressedSize)
                        .withStreamInfo("uncompressedSize", this.uncompressedSize)
                        .withStreamInfo("crc32", this.crc32)
                        .withStreamInfo("compression", this.compression);
                }
            };

            /**
             * Chain the given worker with other workers to compress the content with the
             * given compresion.
             * @param {GenericWorker} uncompressedWorker the worker to pipe.
             * @param {Object} compression the compression object.
             * @param {Object} compressionOptions the options to use when compressing.
             * @return {GenericWorker} the new worker compressing the content.
             */
            CompressedObject.createWorkerFrom = function(uncompressedWorker, compression, compressionOptions) {
                return uncompressedWorker
                    .pipe(new Crc32Probe())
                    .pipe(new DataLengthProbe("uncompressedSize"))
                    .pipe(compression.compressWorker(compressionOptions))
                    .pipe(new DataLengthProbe("compressedSize"))
                    .withStreamInfo("compression", compression);
            };

            module.exports = CompressedObject;
        }, {
            "./external": 6,
            "./stream/Crc32Probe": 25,
            "./stream/DataLengthProbe": 26,
            "./stream/DataWorker": 27
        }],
        3: [function(require, module, exports) {
            'use strict';

            var GenericWorker = require("./stream/GenericWorker");

            exports.STORE = {
                magic: "\x00\x00",
                compressWorker: function(compressionOptions) {
                    return new GenericWorker("STORE compression");
                },
                uncompressWorker: function() {
                    return new GenericWorker("STORE decompression");
                }
            };
            exports.DEFLATE = require('./flate');

        }, {
            "./flate": 7,
            "./stream/GenericWorker": 28
        }],
        4: [function(require, module, exports) {
            'use strict';

            var utils = require('./utils');

            /**
             * The following functions come from pako, from pako/lib/zlib/crc32.js
             * released under the MIT license, see pako https://github.com/nodeca/pako/
             */

            // Use ordinary array, since untyped makes no boost here
            function makeTable() {
                var c, table = [];

                for (var n = 0; n < 256; n++) {
                    c = n;
                    for (var k = 0; k < 8; k++) {
                        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
                    }
                    table[n] = c;
                }

                return table;
            }

            // Create table on load. Just 255 signed longs. Not a problem.
            var crcTable = makeTable();


            function crc32(crc, buf, len, pos) {
                var t = crcTable,
                    end = pos + len;

                crc = crc ^ (-1);

                for (var i = pos; i < end; i++) {
                    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
                }

                return (crc ^ (-1)); // >>> 0;
            }

            // That's all for the pako functions.

            /**
             * Compute the crc32 of a string.
             * This is almost the same as the function crc32, but for strings. Using the
             * same function for the two use cases leads to horrible performances.
             * @param {Number} crc the starting value of the crc.
             * @param {String} str the string to use.
             * @param {Number} len the length of the string.
             * @param {Number} pos the starting position for the crc32 computation.
             * @return {Number} the computed crc32.
             */
            function crc32str(crc, str, len, pos) {
                var t = crcTable,
                    end = pos + len;

                crc = crc ^ (-1);

                for (var i = pos; i < end; i++) {
                    crc = (crc >>> 8) ^ t[(crc ^ str.charCodeAt(i)) & 0xFF];
                }

                return (crc ^ (-1)); // >>> 0;
            }

            module.exports = function crc32wrapper(input, crc) {
                if (typeof input === "undefined" || !input.length) {
                    return 0;
                }

                var isArray = utils.getTypeOf(input) !== "string";

                if (isArray) {
                    return crc32(crc | 0, input, input.length, 0);
                } else {
                    return crc32str(crc | 0, input, input.length, 0);
                }
            };

        }, {
            "./utils": 32
        }],
        5: [function(require, module, exports) {
            'use strict';
            exports.base64 = false;
            exports.binary = false;
            exports.dir = false;
            exports.createFolders = true;
            exports.date = null;
            exports.compression = null;
            exports.compressionOptions = null;
            exports.comment = null;
            exports.unixPermissions = null;
            exports.dosPermissions = null;

        }, {}],
        6: [function(require, module, exports) {
            /* global Promise */
            'use strict';

            // load the global object first:
            // - it should be better integrated in the system (unhandledRejection in node)
            // - the environment may have a custom Promise implementation (see zone.js)
            var ES6Promise = null;
            if (typeof Promise !== "undefined") {
                ES6Promise = Promise;
            } else {
                ES6Promise = require("lie");
            }

            /**
             * Let the user use/change some implementations.
             */
            module.exports = {
                Promise: ES6Promise
            };

        }, {
            "lie": 58
        }],
        7: [function(require, module, exports) {
            'use strict';
            var USE_TYPEDARRAY = (typeof Uint8Array !== 'undefined') && (typeof Uint16Array !== 'undefined') && (typeof Uint32Array !== 'undefined');

            var pako = require("pako");
            var utils = require("./utils");
            var GenericWorker = require("./stream/GenericWorker");

            var ARRAY_TYPE = USE_TYPEDARRAY ? "uint8array" : "array";

            exports.magic = "\x08\x00";

            /**
             * Create a worker that uses pako to inflate/deflate.
             * @constructor
             * @param {String} action the name of the pako function to call : either "Deflate" or "Inflate".
             * @param {Object} options the options to use when (de)compressing.
             */
            function FlateWorker(action, options) {
                GenericWorker.call(this, "FlateWorker/" + action);

                this._pako = null;
                this._pakoAction = action;
                this._pakoOptions = options;
                // the `meta` object from the last chunk received
                // this allow this worker to pass around metadata
                this.meta = {};
            }

            utils.inherits(FlateWorker, GenericWorker);

            /**
             * @see GenericWorker.processChunk
             */
            FlateWorker.prototype.processChunk = function(chunk) {
                this.meta = chunk.meta;
                if (this._pako === null) {
                    this._createPako();
                }
                this._pako.push(utils.transformTo(ARRAY_TYPE, chunk.data), false);
            };

            /**
             * @see GenericWorker.flush
             */
            FlateWorker.prototype.flush = function() {
                GenericWorker.prototype.flush.call(this);
                if (this._pako === null) {
                    this._createPako();
                }
                this._pako.push([], true);
            };
            /**
             * @see GenericWorker.cleanUp
             */
            FlateWorker.prototype.cleanUp = function() {
                GenericWorker.prototype.cleanUp.call(this);
                this._pako = null;
            };

            /**
             * Create the _pako object.
             * TODO: lazy-loading this object isn't the best solution but it's the
             * quickest. The best solution is to lazy-load the worker list. See also the
             * issue #446.
             */
            FlateWorker.prototype._createPako = function() {
                this._pako = new pako[this._pakoAction]({
                    raw: true,
                    level: this._pakoOptions.level || -1 // default compression
                });
                var self = this;
                this._pako.onData = function(data) {
                    self.push({
                        data: data,
                        meta: self.meta
                    });
                };
            };

            exports.compressWorker = function(compressionOptions) {
                return new FlateWorker("Deflate", compressionOptions);
            };
            exports.uncompressWorker = function() {
                return new FlateWorker("Inflate", {});
            };

        }, {
            "./stream/GenericWorker": 28,
            "./utils": 32,
            "pako": 59
        }],
        8: [function(require, module, exports) {
            'use strict';

            var utils = require('../utils');
            var GenericWorker = require('../stream/GenericWorker');
            var utf8 = require('../utf8');
            var crc32 = require('../crc32');
            var signature = require('../signature');

            /**
             * Transform an integer into a string in hexadecimal.
             * @private
             * @param {number} dec the number to convert.
             * @param {number} bytes the number of bytes to generate.
             * @returns {string} the result.
             */
            var decToHex = function(dec, bytes) {
                var hex = "",
                    i;
                for (i = 0; i < bytes; i++) {
                    hex += String.fromCharCode(dec & 0xff);
                    dec = dec >>> 8;
                }
                return hex;
            };

            /**
             * Generate the UNIX part of the external file attributes.
             * @param {Object} unixPermissions the unix permissions or null.
             * @param {Boolean} isDir true if the entry is a directory, false otherwise.
             * @return {Number} a 32 bit integer.
             *
             * adapted from http://unix.stackexchange.com/questions/14705/the-zip-formats-external-file-attribute :
             *
             * TTTTsstrwxrwxrwx0000000000ADVSHR
             * ^^^^____________________________ file type, see zipinfo.c (UNX_*)
             *     ^^^_________________________ setuid, setgid, sticky
             *        ^^^^^^^^^________________ permissions
             *                 ^^^^^^^^^^______ not used ?
             *                           ^^^^^^ DOS attribute bits : Archive, Directory, Volume label, System file, Hidden, Read only
             */
            var generateUnixExternalFileAttr = function(unixPermissions, isDir) {

                var result = unixPermissions;
                if (!unixPermissions) {
                    // I can't use octal values in strict mode, hence the hexa.
                    //  040775 => 0x41fd
                    // 0100664 => 0x81b4
                    result = isDir ? 0x41fd : 0x81b4;
                }
                return (result & 0xFFFF) << 16;
            };

            /**
             * Generate the DOS part of the external file attributes.
             * @param {Object} dosPermissions the dos permissions or null.
             * @param {Boolean} isDir true if the entry is a directory, false otherwise.
             * @return {Number} a 32 bit integer.
             *
             * Bit 0     Read-Only
             * Bit 1     Hidden
             * Bit 2     System
             * Bit 3     Volume Label
             * Bit 4     Directory
             * Bit 5     Archive
             */
            var generateDosExternalFileAttr = function(dosPermissions, isDir) {

                // the dir flag is already set for compatibility
                return (dosPermissions || 0) & 0x3F;
            };

            /**
             * Generate the various parts used in the construction of the final zip file.
             * @param {Object} streamInfo the hash with informations about the compressed file.
             * @param {Boolean} streamedContent is the content streamed ?
             * @param {Boolean} streamingEnded is the stream finished ?
             * @param {number} offset the current offset from the start of the zip file.
             * @param {String} platform let's pretend we are this platform (change platform dependents fields)
             * @param {Function} encodeFileName the function to encode the file name / comment.
             * @return {Object} the zip parts.
             */
            var generateZipParts = function(streamInfo, streamedContent, streamingEnded, offset, platform, encodeFileName) {
                var file = streamInfo['file'],
                    compression = streamInfo['compression'],
                    useCustomEncoding = encodeFileName !== utf8.utf8encode,
                    encodedFileName = utils.transformTo("string", encodeFileName(file.name)),
                    utfEncodedFileName = utils.transformTo("string", utf8.utf8encode(file.name)),
                    comment = file.comment,
                    encodedComment = utils.transformTo("string", encodeFileName(comment)),
                    utfEncodedComment = utils.transformTo("string", utf8.utf8encode(comment)),
                    useUTF8ForFileName = utfEncodedFileName.length !== file.name.length,
                    useUTF8ForComment = utfEncodedComment.length !== comment.length,
                    dosTime,
                    dosDate,
                    extraFields = "",
                    unicodePathExtraField = "",
                    unicodeCommentExtraField = "",
                    dir = file.dir,
                    date = file.date;


                var dataInfo = {
                    crc32: 0,
                    compressedSize: 0,
                    uncompressedSize: 0
                };

                // if the content is streamed, the sizes/crc32 are only available AFTER
                // the end of the stream.
                if (!streamedContent || streamingEnded) {
                    dataInfo.crc32 = streamInfo['crc32'];
                    dataInfo.compressedSize = streamInfo['compressedSize'];
                    dataInfo.uncompressedSize = streamInfo['uncompressedSize'];
                }

                var bitflag = 0;
                if (streamedContent) {
                    // Bit 3: the sizes/crc32 are set to zero in the local header.
                    // The correct values are put in the data descriptor immediately
                    // following the compressed data.
                    bitflag |= 0x0008;
                }
                if (!useCustomEncoding && (useUTF8ForFileName || useUTF8ForComment)) {
                    // Bit 11: Language encoding flag (EFS).
                    bitflag |= 0x0800;
                }


                var extFileAttr = 0;
                var versionMadeBy = 0;
                if (dir) {
                    // dos or unix, we set the dos dir flag
                    extFileAttr |= 0x00010;
                }
                if (platform === "UNIX") {
                    versionMadeBy = 0x031E; // UNIX, version 3.0
                    extFileAttr |= generateUnixExternalFileAttr(file.unixPermissions, dir);
                } else { // DOS or other, fallback to DOS
                    versionMadeBy = 0x0014; // DOS, version 2.0
                    extFileAttr |= generateDosExternalFileAttr(file.dosPermissions, dir);
                }

                // date
                // @see http://www.delorie.com/djgpp/doc/rbinter/it/52/13.html
                // @see http://www.delorie.com/djgpp/doc/rbinter/it/65/16.html
                // @see http://www.delorie.com/djgpp/doc/rbinter/it/66/16.html

                dosTime = date.getUTCHours();
                dosTime = dosTime << 6;
                dosTime = dosTime | date.getUTCMinutes();
                dosTime = dosTime << 5;
                dosTime = dosTime | date.getUTCSeconds() / 2;

                dosDate = date.getUTCFullYear() - 1980;
                dosDate = dosDate << 4;
                dosDate = dosDate | (date.getUTCMonth() + 1);
                dosDate = dosDate << 5;
                dosDate = dosDate | date.getUTCDate();

                if (useUTF8ForFileName) {
                    // set the unicode path extra field. unzip needs at least one extra
                    // field to correctly handle unicode path, so using the path is as good
                    // as any other information. This could improve the situation with
                    // other archive managers too.
                    // This field is usually used without the utf8 flag, with a non
                    // unicode path in the header (winrar, winzip). This helps (a bit)
                    // with the messy Windows' default compressed folders feature but
                    // breaks on p7zip which doesn't seek the unicode path extra field.
                    // So for now, UTF-8 everywhere !
                    unicodePathExtraField =
                        // Version
                        decToHex(1, 1) +
                        // NameCRC32
                        decToHex(crc32(encodedFileName), 4) +
                        // UnicodeName
                        utfEncodedFileName;

                    extraFields +=
                        // Info-ZIP Unicode Path Extra Field
                        "\x75\x70" +
                        // size
                        decToHex(unicodePathExtraField.length, 2) +
                        // content
                        unicodePathExtraField;
                }

                if (useUTF8ForComment) {

                    unicodeCommentExtraField =
                        // Version
                        decToHex(1, 1) +
                        // CommentCRC32
                        decToHex(crc32(encodedComment), 4) +
                        // UnicodeName
                        utfEncodedComment;

                    extraFields +=
                        // Info-ZIP Unicode Path Extra Field
                        "\x75\x63" +
                        // size
                        decToHex(unicodeCommentExtraField.length, 2) +
                        // content
                        unicodeCommentExtraField;
                }

                var header = "";

                // version needed to extract
                header += "\x0A\x00";
                // general purpose bit flag
                header += decToHex(bitflag, 2);
                // compression method
                header += compression.magic;
                // last mod file time
                header += decToHex(dosTime, 2);
                // last mod file date
                header += decToHex(dosDate, 2);
                // crc-32
                header += decToHex(dataInfo.crc32, 4);
                // compressed size
                header += decToHex(dataInfo.compressedSize, 4);
                // uncompressed size
                header += decToHex(dataInfo.uncompressedSize, 4);
                // file name length
                header += decToHex(encodedFileName.length, 2);
                // extra field length
                header += decToHex(extraFields.length, 2);


                var fileRecord = signature.LOCAL_FILE_HEADER + header + encodedFileName + extraFields;

                var dirRecord = signature.CENTRAL_FILE_HEADER +
                    // version made by (00: DOS)
                    decToHex(versionMadeBy, 2) +
                    // file header (common to file and central directory)
                    header +
                    // file comment length
                    decToHex(encodedComment.length, 2) +
                    // disk number start
                    "\x00\x00" +
                    // internal file attributes TODO
                    "\x00\x00" +
                    // external file attributes
                    decToHex(extFileAttr, 4) +
                    // relative offset of local header
                    decToHex(offset, 4) +
                    // file name
                    encodedFileName +
                    // extra field
                    extraFields +
                    // file comment
                    encodedComment;

                return {
                    fileRecord: fileRecord,
                    dirRecord: dirRecord
                };
            };

            /**
             * Generate the EOCD record.
             * @param {Number} entriesCount the number of entries in the zip file.
             * @param {Number} centralDirLength the length (in bytes) of the central dir.
             * @param {Number} localDirLength the length (in bytes) of the local dir.
             * @param {String} comment the zip file comment as a binary string.
             * @param {Function} encodeFileName the function to encode the comment.
             * @return {String} the EOCD record.
             */
            var generateCentralDirectoryEnd = function(entriesCount, centralDirLength, localDirLength, comment, encodeFileName) {
                var dirEnd = "";
                var encodedComment = utils.transformTo("string", encodeFileName(comment));

                // end of central dir signature
                dirEnd = signature.CENTRAL_DIRECTORY_END +
                    // number of this disk
                    "\x00\x00" +
                    // number of the disk with the start of the central directory
                    "\x00\x00" +
                    // total number of entries in the central directory on this disk
                    decToHex(entriesCount, 2) +
                    // total number of entries in the central directory
                    decToHex(entriesCount, 2) +
                    // size of the central directory   4 bytes
                    decToHex(centralDirLength, 4) +
                    // offset of start of central directory with respect to the starting disk number
                    decToHex(localDirLength, 4) +
                    // .ZIP file comment length
                    decToHex(encodedComment.length, 2) +
                    // .ZIP file comment
                    encodedComment;

                return dirEnd;
            };

            /**
             * Generate data descriptors for a file entry.
             * @param {Object} streamInfo the hash generated by a worker, containing informations
             * on the file entry.
             * @return {String} the data descriptors.
             */
            var generateDataDescriptors = function(streamInfo) {
                var descriptor = "";
                descriptor = signature.DATA_DESCRIPTOR +
                    // crc-32                          4 bytes
                    decToHex(streamInfo['crc32'], 4) +
                    // compressed size                 4 bytes
                    decToHex(streamInfo['compressedSize'], 4) +
                    // uncompressed size               4 bytes
                    decToHex(streamInfo['uncompressedSize'], 4);

                return descriptor;
            };


            /**
             * A worker to concatenate other workers to create a zip file.
             * @param {Boolean} streamFiles `true` to stream the content of the files,
             * `false` to accumulate it.
             * @param {String} comment the comment to use.
             * @param {String} platform the platform to use, "UNIX" or "DOS".
             * @param {Function} encodeFileName the function to encode file names and comments.
             */
            function ZipFileWorker(streamFiles, comment, platform, encodeFileName) {
                GenericWorker.call(this, "ZipFileWorker");
                // The number of bytes written so far. This doesn't count accumulated chunks.
                this.bytesWritten = 0;
                // The comment of the zip file
                this.zipComment = comment;
                // The platform "generating" the zip file.
                this.zipPlatform = platform;
                // the function to encode file names and comments.
                this.encodeFileName = encodeFileName;
                // Should we stream the content of the files ?
                this.streamFiles = streamFiles;
                // If `streamFiles` is false, we will need to accumulate the content of the
                // files to calculate sizes / crc32 (and write them *before* the content).
                // This boolean indicates if we are accumulating chunks (it will change a lot
                // during the lifetime of this worker).
                this.accumulate = false;
                // The buffer receiving chunks when accumulating content.
                this.contentBuffer = [];
                // The list of generated directory records.
                this.dirRecords = [];
                // The offset (in bytes) from the beginning of the zip file for the current source.
                this.currentSourceOffset = 0;
                // The total number of entries in this zip file.
                this.entriesCount = 0;
                // the name of the file currently being added, null when handling the end of the zip file.
                // Used for the emited metadata.
                this.currentFile = null;



                this._sources = [];
            }
            utils.inherits(ZipFileWorker, GenericWorker);

            /**
             * @see GenericWorker.push
             */
            ZipFileWorker.prototype.push = function(chunk) {

                var currentFilePercent = chunk.meta.percent || 0;
                var entriesCount = this.entriesCount;
                var remainingFiles = this._sources.length;

                if (this.accumulate) {
                    this.contentBuffer.push(chunk);
                } else {
                    this.bytesWritten += chunk.data.length;

                    GenericWorker.prototype.push.call(this, {
                        data: chunk.data,
                        meta: {
                            currentFile: this.currentFile,
                            percent: entriesCount ? (currentFilePercent + 100 * (entriesCount - remainingFiles - 1)) / entriesCount : 100
                        }
                    });
                }
            };

            /**
             * The worker started a new source (an other worker).
             * @param {Object} streamInfo the streamInfo object from the new source.
             */
            ZipFileWorker.prototype.openedSource = function(streamInfo) {
                this.currentSourceOffset = this.bytesWritten;
                this.currentFile = streamInfo['file'].name;

                var streamedContent = this.streamFiles && !streamInfo['file'].dir;

                // don't stream folders (because they don't have any content)
                if (streamedContent) {
                    var record = generateZipParts(streamInfo, streamedContent, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
                    this.push({
                        data: record.fileRecord,
                        meta: {
                            percent: 0
                        }
                    });
                } else {
                    // we need to wait for the whole file before pushing anything
                    this.accumulate = true;
                }
            };

            /**
             * The worker finished a source (an other worker).
             * @param {Object} streamInfo the streamInfo object from the finished source.
             */
            ZipFileWorker.prototype.closedSource = function(streamInfo) {
                this.accumulate = false;
                var streamedContent = this.streamFiles && !streamInfo['file'].dir;
                var record = generateZipParts(streamInfo, streamedContent, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);

                this.dirRecords.push(record.dirRecord);
                if (streamedContent) {
                    // after the streamed file, we put data descriptors
                    this.push({
                        data: generateDataDescriptors(streamInfo),
                        meta: {
                            percent: 100
                        }
                    });
                } else {
                    // the content wasn't streamed, we need to push everything now
                    // first the file record, then the content
                    this.push({
                        data: record.fileRecord,
                        meta: {
                            percent: 0
                        }
                    });
                    while (this.contentBuffer.length) {
                        this.push(this.contentBuffer.shift());
                    }
                }
                this.currentFile = null;
            };

            /**
             * @see GenericWorker.flush
             */
            ZipFileWorker.prototype.flush = function() {

                var localDirLength = this.bytesWritten;
                for (var i = 0; i < this.dirRecords.length; i++) {
                    this.push({
                        data: this.dirRecords[i],
                        meta: {
                            percent: 100
                        }
                    });
                }
                var centralDirLength = this.bytesWritten - localDirLength;

                var dirEnd = generateCentralDirectoryEnd(this.dirRecords.length, centralDirLength, localDirLength, this.zipComment, this.encodeFileName);

                this.push({
                    data: dirEnd,
                    meta: {
                        percent: 100
                    }
                });
            };

            /**
             * Prepare the next source to be read.
             */
            ZipFileWorker.prototype.prepareNextSource = function() {
                this.previous = this._sources.shift();
                this.openedSource(this.previous.streamInfo);
                if (this.isPaused) {
                    this.previous.pause();
                } else {
                    this.previous.resume();
                }
            };

            /**
             * @see GenericWorker.registerPrevious
             */
            ZipFileWorker.prototype.registerPrevious = function(previous) {
                this._sources.push(previous);
                var self = this;

                previous.on('data', function(chunk) {
                    self.processChunk(chunk);
                });
                previous.on('end', function() {
                    self.closedSource(self.previous.streamInfo);
                    if (self._sources.length) {
                        self.prepareNextSource();
                    } else {
                        self.end();
                    }
                });
                previous.on('error', function(e) {
                    self.error(e);
                });
                return this;
            };

            /**
             * @see GenericWorker.resume
             */
            ZipFileWorker.prototype.resume = function() {
                if (!GenericWorker.prototype.resume.call(this)) {
                    return false;
                }

                if (!this.previous && this._sources.length) {
                    this.prepareNextSource();
                    return true;
                }
                if (!this.previous && !this._sources.length && !this.generatedError) {
                    this.end();
                    return true;
                }
            };

            /**
             * @see GenericWorker.error
             */
            ZipFileWorker.prototype.error = function(e) {
                var sources = this._sources;
                if (!GenericWorker.prototype.error.call(this, e)) {
                    return false;
                }
                for (var i = 0; i < sources.length; i++) {
                    try {
                        sources[i].error(e);
                    } catch (e) {
                        // the `error` exploded, nothing to do
                    }
                }
                return true;
            };

            /**
             * @see GenericWorker.lock
             */
            ZipFileWorker.prototype.lock = function() {
                GenericWorker.prototype.lock.call(this);
                var sources = this._sources;
                for (var i = 0; i < sources.length; i++) {
                    sources[i].lock();
                }
            };

            module.exports = ZipFileWorker;

        }, {
            "../crc32": 4,
            "../signature": 23,
            "../stream/GenericWorker": 28,
            "../utf8": 31,
            "../utils": 32
        }],
        9: [function(require, module, exports) {
            'use strict';

            var compressions = require('../compressions');
            var ZipFileWorker = require('./ZipFileWorker');

            /**
             * Find the compression to use.
             * @param {String} fileCompression the compression defined at the file level, if any.
             * @param {String} zipCompression the compression defined at the load() level.
             * @return {Object} the compression object to use.
             */
            var getCompression = function(fileCompression, zipCompression) {

                var compressionName = fileCompression || zipCompression;
                var compression = compressions[compressionName];
                if (!compression) {
                    throw new Error(compressionName + " is not a valid compression method !");
                }
                return compression;
            };

            /**
             * Create a worker to generate a zip file.
             * @param {JSZip} zip the JSZip instance at the right root level.
             * @param {Object} options to generate the zip file.
             * @param {String} comment the comment to use.
             */
            exports.generateWorker = function(zip, options, comment) {

                var zipFileWorker = new ZipFileWorker(options.streamFiles, comment, options.platform, options.encodeFileName);
                var entriesCount = 0;
                try {

                    zip.forEach(function(relativePath, file) {
                        entriesCount++;
                        var compression = getCompression(file.options.compression, options.compression);
                        var compressionOptions = file.options.compressionOptions || options.compressionOptions || {};
                        var dir = file.dir,
                            date = file.date;

                        file._compressWorker(compression, compressionOptions)
                            .withStreamInfo("file", {
                                name: relativePath,
                                dir: dir,
                                date: date,
                                comment: file.comment || "",
                                unixPermissions: file.unixPermissions,
                                dosPermissions: file.dosPermissions
                            })
                            .pipe(zipFileWorker);
                    });
                    zipFileWorker.entriesCount = entriesCount;
                } catch (e) {
                    zipFileWorker.error(e);
                }

                return zipFileWorker;
            };

        }, {
            "../compressions": 3,
            "./ZipFileWorker": 8
        }],
        10: [function(require, module, exports) {
            'use strict';

            /**
             * Representation a of zip file in js
             * @constructor
             */
            function JSZip() {
                // if this constructor is used without `new`, it adds `new` before itself:
                if (!(this instanceof JSZip)) {
                    return new JSZip();
                }

                if (arguments.length) {
                    throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
                }

                // object containing the files :
                // {
                //   "folder/" : {...},
                //   "folder/data.txt" : {...}
                // }
                this.files = {};

                this.comment = null;

                // Where we are in the hierarchy
                this.root = "";
                this.clone = function() {
                    var newObj = new JSZip();
                    for (var i in this) {
                        if (typeof this[i] !== "function") {
                            newObj[i] = this[i];
                        }
                    }
                    return newObj;
                };
            }
            JSZip.prototype = require('./object');
            JSZip.prototype.loadAsync = require('./load');
            JSZip.support = require('./support');
            JSZip.defaults = require('./defaults');

            // TODO find a better way to handle this version,
            // a require('package.json').version doesn't work with webpack, see #327
            JSZip.version = "3.1.3";

            JSZip.loadAsync = function(content, options) {
                return new JSZip().loadAsync(content, options);
            };

            JSZip.external = require("./external");
            module.exports = JSZip;

        }, {
            "./defaults": 5,
            "./external": 6,
            "./load": 11,
            "./object": 15,
            "./support": 30
        }],
        11: [function(require, module, exports) {
            'use strict';
            var utils = require('./utils');
            var external = require("./external");
            var utf8 = require('./utf8');
            var utils = require('./utils');
            var ZipEntries = require('./zipEntries');
            var Crc32Probe = require('./stream/Crc32Probe');
            var nodejsUtils = require("./nodejsUtils");

            /**
             * Check the CRC32 of an entry.
             * @param {ZipEntry} zipEntry the zip entry to check.
             * @return {Promise} the result.
             */
            function checkEntryCRC32(zipEntry) {
                return new external.Promise(function(resolve, reject) {
                    var worker = zipEntry.decompressed.getContentWorker().pipe(new Crc32Probe());
                    worker.on("error", function(e) {
                            reject(e);
                        })
                        .on("end", function() {
                            if (worker.streamInfo.crc32 !== zipEntry.decompressed.crc32) {
                                reject(new Error("Corrupted zip : CRC32 mismatch"));
                            } else {
                                resolve();
                            }
                        })
                        .resume();
                });
            }

            module.exports = function(data, options) {
                var zip = this;
                options = utils.extend(options || {}, {
                    base64: false,
                    checkCRC32: false,
                    optimizedBinaryString: false,
                    createFolders: false,
                    decodeFileName: utf8.utf8decode
                });

                if (nodejsUtils.isNode && nodejsUtils.isStream(data)) {
                    return external.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file."));
                }

                return utils.prepareContent("the loaded zip file", data, true, options.optimizedBinaryString, options.base64)
                    .then(function(data) {
                        var zipEntries = new ZipEntries(options);
                        zipEntries.load(data);
                        return zipEntries;
                    }).then(function checkCRC32(zipEntries) {
                        var promises = [external.Promise.resolve(zipEntries)];
                        var files = zipEntries.files;
                        if (options.checkCRC32) {
                            for (var i = 0; i < files.length; i++) {
                                promises.push(checkEntryCRC32(files[i]));
                            }
                        }
                        return external.Promise.all(promises);
                    }).then(function addFiles(results) {
                        var zipEntries = results.shift();
                        var files = zipEntries.files;
                        for (var i = 0; i < files.length; i++) {
                            var input = files[i];
                            zip.file(input.fileNameStr, input.decompressed, {
                                binary: true,
                                optimizedBinaryString: true,
                                date: input.date,
                                dir: input.dir,
                                comment: input.fileCommentStr.length ? input.fileCommentStr : null,
                                unixPermissions: input.unixPermissions,
                                dosPermissions: input.dosPermissions,
                                createFolders: options.createFolders
                            });
                        }
                        if (zipEntries.zipComment.length) {
                            zip.comment = zipEntries.zipComment;
                        }

                        return zip;
                    });
            };

        }, {
            "./external": 6,
            "./nodejsUtils": 14,
            "./stream/Crc32Probe": 25,
            "./utf8": 31,
            "./utils": 32,
            "./zipEntries": 33
        }],
        12: [function(require, module, exports) {
            "use strict";

            var utils = require('../utils');
            var GenericWorker = require('../stream/GenericWorker');

            /**
             * A worker that use a nodejs stream as source.
             * @constructor
             * @param {String} filename the name of the file entry for this stream.
             * @param {Readable} stream the nodejs stream.
             */
            function NodejsStreamInputAdapter(filename, stream) {
                GenericWorker.call(this, "Nodejs stream input adapter for " + filename);
                this._upstreamEnded = false;
                this._bindStream(stream);
            }

            utils.inherits(NodejsStreamInputAdapter, GenericWorker);

            /**
             * Prepare the stream and bind the callbacks on it.
             * Do this ASAP on node 0.10 ! A lazy binding doesn't always work.
             * @param {Stream} stream the nodejs stream to use.
             */
            NodejsStreamInputAdapter.prototype._bindStream = function(stream) {
                var self = this;
                this._stream = stream;
                stream.pause();
                stream
                    .on("data", function(chunk) {
                        self.push({
                            data: chunk,
                            meta: {
                                percent: 0
                            }
                        });
                    })
                    .on("error", function(e) {
                        if (self.isPaused) {
                            this.generatedError = e;
                        } else {
                            self.error(e);
                        }
                    })
                    .on("end", function() {
                        if (self.isPaused) {
                            self._upstreamEnded = true;
                        } else {
                            self.end();
                        }
                    });
            };
            NodejsStreamInputAdapter.prototype.pause = function() {
                if (!GenericWorker.prototype.pause.call(this)) {
                    return false;
                }
                this._stream.pause();
                return true;
            };
            NodejsStreamInputAdapter.prototype.resume = function() {
                if (!GenericWorker.prototype.resume.call(this)) {
                    return false;
                }

                if (this._upstreamEnded) {
                    this.end();
                } else {
                    this._stream.resume();
                }

                return true;
            };

            module.exports = NodejsStreamInputAdapter;

        }, {
            "../stream/GenericWorker": 28,
            "../utils": 32
        }],
        13: [function(require, module, exports) {
            'use strict';

            var Readable = require('readable-stream').Readable;

            var utils = require('../utils');
            utils.inherits(NodejsStreamOutputAdapter, Readable);

            /**
             * A nodejs stream using a worker as source.
             * @see the SourceWrapper in http://nodejs.org/api/stream.html
             * @constructor
             * @param {StreamHelper} helper the helper wrapping the worker
             * @param {Object} options the nodejs stream options
             * @param {Function} updateCb the update callback.
             */
            function NodejsStreamOutputAdapter(helper, options, updateCb) {
                Readable.call(this, options);
                this._helper = helper;

                var self = this;
                helper.on("data", function(data, meta) {
                        if (!self.push(data)) {
                            self._helper.pause();
                        }
                        if (updateCb) {
                            updateCb(meta);
                        }
                    })
                    .on("error", function(e) {
                        self.emit('error', e);
                    })
                    .on("end", function() {
                        self.push(null);
                    });
            }


            NodejsStreamOutputAdapter.prototype._read = function() {
                this._helper.resume();
            };

            module.exports = NodejsStreamOutputAdapter;

        }, {
            "../utils": 32,
            "readable-stream": 16
        }],
        14: [function(require, module, exports) {
            'use strict';

            module.exports = {
                /**
                 * True if this is running in Nodejs, will be undefined in a browser.
                 * In a browser, browserify won't include this file and the whole module
                 * will be resolved an empty object.
                 */
                isNode: typeof Buffer !== "undefined",
                /**
                 * Create a new nodejs Buffer.
                 * @param {Object} data the data to pass to the constructor.
                 * @param {String} encoding the encoding to use.
                 * @return {Buffer} a new Buffer.
                 */
                newBuffer: function(data, encoding) {
                    return new Buffer(data, encoding);
                },
                /**
                 * Find out if an object is a Buffer.
                 * @param {Object} b the object to test.
                 * @return {Boolean} true if the object is a Buffer, false otherwise.
                 */
                isBuffer: function(b) {
                    return Buffer.isBuffer(b);
                },

                isStream: function(obj) {
                    return obj &&
                        typeof obj.on === "function" &&
                        typeof obj.pause === "function" &&
                        typeof obj.resume === "function";
                }
            };

        }, {}],
        15: [function(require, module, exports) {
            'use strict';
            var utf8 = require('./utf8');
            var utils = require('./utils');
            var GenericWorker = require('./stream/GenericWorker');
            var StreamHelper = require('./stream/StreamHelper');
            var defaults = require('./defaults');
            var CompressedObject = require('./compressedObject');
            var ZipObject = require('./zipObject');
            var generate = require("./generate");
            var nodejsUtils = require("./nodejsUtils");
            var NodejsStreamInputAdapter = require("./nodejs/NodejsStreamInputAdapter");


            /**
             * Add a file in the current folder.
             * @private
             * @param {string} name the name of the file
             * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data of the file
             * @param {Object} originalOptions the options of the file
             * @return {Object} the new file.
             */
            var fileAdd = function(name, data, originalOptions) {
                // be sure sub folders exist
                var dataType = utils.getTypeOf(data),
                    parent;


                /*
                 * Correct options.
                 */

                var o = utils.extend(originalOptions || {}, defaults);
                o.date = o.date || new Date();
                if (o.compression !== null) {
                    o.compression = o.compression.toUpperCase();
                }

                if (typeof o.unixPermissions === "string") {
                    o.unixPermissions = parseInt(o.unixPermissions, 8);
                }

                // UNX_IFDIR  0040000 see zipinfo.c
                if (o.unixPermissions && (o.unixPermissions & 0x4000)) {
                    o.dir = true;
                }
                // Bit 4    Directory
                if (o.dosPermissions && (o.dosPermissions & 0x0010)) {
                    o.dir = true;
                }

                if (o.dir) {
                    name = forceTrailingSlash(name);
                }
                if (o.createFolders && (parent = parentFolder(name))) {
                    folderAdd.call(this, parent, true);
                }

                var isUnicodeString = dataType === "string" && o.binary === false && o.base64 === false;
                if (!originalOptions || typeof originalOptions.binary === "undefined") {
                    o.binary = !isUnicodeString;
                }


                var isCompressedEmpty = (data instanceof CompressedObject) && data.uncompressedSize === 0;

                if (isCompressedEmpty || o.dir || !data || data.length === 0) {
                    o.base64 = false;
                    o.binary = true;
                    data = "";
                    o.compression = "STORE";
                    dataType = "string";
                }

                /*
                 * Convert content to fit.
                 */

                var zipObjectContent = null;
                if (data instanceof CompressedObject || data instanceof GenericWorker) {
                    zipObjectContent = data;
                } else if (nodejsUtils.isNode && nodejsUtils.isStream(data)) {
                    zipObjectContent = new NodejsStreamInputAdapter(name, data);
                } else {
                    zipObjectContent = utils.prepareContent(name, data, o.binary, o.optimizedBinaryString, o.base64);
                }

                var object = new ZipObject(name, zipObjectContent, o);
                this.files[name] = object;
                /*
                TODO: we can't throw an exception because we have async promises
                (we can have a promise of a Date() for example) but returning a
                promise is useless because file(name, data) returns the JSZip
                object for chaining. Should we break that to allow the user
                to catch the error ?

                return external.Promise.resolve(zipObjectContent)
                .then(function () {
                    return object;
                });
                */
            };

            /**
             * Find the parent folder of the path.
             * @private
             * @param {string} path the path to use
             * @return {string} the parent folder, or ""
             */
            var parentFolder = function(path) {
                if (path.slice(-1) === '/') {
                    path = path.substring(0, path.length - 1);
                }
                var lastSlash = path.lastIndexOf('/');
                return (lastSlash > 0) ? path.substring(0, lastSlash) : "";
            };

            /**
             * Returns the path with a slash at the end.
             * @private
             * @param {String} path the path to check.
             * @return {String} the path with a trailing slash.
             */
            var forceTrailingSlash = function(path) {
                // Check the name ends with a /
                if (path.slice(-1) !== "/") {
                    path += "/"; // IE doesn't like substr(-1)
                }
                return path;
            };

            /**
             * Add a (sub) folder in the current folder.
             * @private
             * @param {string} name the folder's name
             * @param {boolean=} [createFolders] If true, automatically create sub
             *  folders. Defaults to false.
             * @return {Object} the new folder.
             */
            var folderAdd = function(name, createFolders) {
                createFolders = (typeof createFolders !== 'undefined') ? createFolders : defaults.createFolders;

                name = forceTrailingSlash(name);

                // Does this folder already exist?
                if (!this.files[name]) {
                    fileAdd.call(this, name, null, {
                        dir: true,
                        createFolders: createFolders
                    });
                }
                return this.files[name];
            };

            /**
             * Cross-window, cross-Node-context regular expression detection
             * @param  {Object}  object Anything
             * @return {Boolean}        true if the object is a regular expression,
             * false otherwise
             */
            function isRegExp(object) {
                return Object.prototype.toString.call(object) === "[object RegExp]";
            }

            // return the actual prototype of JSZip
            var out = {
                /**
                 * @see loadAsync
                 */
                load: function() {
                    throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
                },


                /**
                 * Call a callback function for each entry at this folder level.
                 * @param {Function} cb the callback function:
                 * function (relativePath, file) {...}
                 * It takes 2 arguments : the relative path and the file.
                 */
                forEach: function(cb) {
                    var filename, relativePath, file;
                    for (filename in this.files) {
                        if (!this.files.hasOwnProperty(filename)) {
                            continue;
                        }
                        file = this.files[filename];
                        relativePath = filename.slice(this.root.length, filename.length);
                        if (relativePath && filename.slice(0, this.root.length) === this.root) { // the file is in the current root
                            cb(relativePath, file); // TODO reverse the parameters ? need to be clean AND consistent with the filter search fn...
                        }
                    }
                },

                /**
                 * Filter nested files/folders with the specified function.
                 * @param {Function} search the predicate to use :
                 * function (relativePath, file) {...}
                 * It takes 2 arguments : the relative path and the file.
                 * @return {Array} An array of matching elements.
                 */
                filter: function(search) {
                    var result = [];
                    this.forEach(function(relativePath, entry) {
                        if (search(relativePath, entry)) { // the file matches the function
                            result.push(entry);
                        }

                    });
                    return result;
                },

                /**
                 * Add a file to the zip file, or search a file.
                 * @param   {string|RegExp} name The name of the file to add (if data is defined),
                 * the name of the file to find (if no data) or a regex to match files.
                 * @param   {String|ArrayBuffer|Uint8Array|Buffer} data  The file data, either raw or base64 encoded
                 * @param   {Object} o     File options
                 * @return  {JSZip|Object|Array} this JSZip object (when adding a file),
                 * a file (when searching by string) or an array of files (when searching by regex).
                 */
                file: function(name, data, o) {
                    if (arguments.length === 1) {
                        if (isRegExp(name)) {
                            var regexp = name;
                            return this.filter(function(relativePath, file) {
                                return !file.dir && regexp.test(relativePath);
                            });
                        } else { // text
                            var obj = this.files[this.root + name];
                            if (obj && !obj.dir) {
                                return obj;
                            } else {
                                return null;
                            }
                        }
                    } else { // more than one argument : we have data !
                        name = this.root + name;
                        fileAdd.call(this, name, data, o);
                    }
                    return this;
                },

                /**
                 * Add a directory to the zip file, or search.
                 * @param   {String|RegExp} arg The name of the directory to add, or a regex to search folders.
                 * @return  {JSZip} an object with the new directory as the root, or an array containing matching folders.
                 */
                folder: function(arg) {
                    if (!arg) {
                        return this;
                    }

                    if (isRegExp(arg)) {
                        return this.filter(function(relativePath, file) {
                            return file.dir && arg.test(relativePath);
                        });
                    }

                    // else, name is a new folder
                    var name = this.root + arg;
                    var newFolder = folderAdd.call(this, name);

                    // Allow chaining by returning a new object with this folder as the root
                    var ret = this.clone();
                    ret.root = newFolder.name;
                    return ret;
                },

                /**
                 * Delete a file, or a directory and all sub-files, from the zip
                 * @param {string} name the name of the file to delete
                 * @return {JSZip} this JSZip object
                 */
                remove: function(name) {
                    name = this.root + name;
                    var file = this.files[name];
                    if (!file) {
                        // Look for any folders
                        if (name.slice(-1) !== "/") {
                            name += "/";
                        }
                        file = this.files[name];
                    }

                    if (file && !file.dir) {
                        // file
                        delete this.files[name];
                    } else {
                        // maybe a folder, delete recursively
                        var kids = this.filter(function(relativePath, file) {
                            return file.name.slice(0, name.length) === name;
                        });
                        for (var i = 0; i < kids.length; i++) {
                            delete this.files[kids[i].name];
                        }
                    }

                    return this;
                },

                /**
                 * Generate the complete zip file
                 * @param {Object} options the options to generate the zip file :
                 * - compression, "STORE" by default.
                 * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
                 * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the zip file
                 */
                generate: function(options) {
                    throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
                },

                /**
                 * Generate the complete zip file as an internal stream.
                 * @param {Object} options the options to generate the zip file :
                 * - compression, "STORE" by default.
                 * - type, "base64" by default. Values are : string, base64, uint8array, arraybuffer, blob.
                 * @return {StreamHelper} the streamed zip file.
                 */
                generateInternalStream: function(options) {
                    var worker, opts = {};
                    try {
                        opts = utils.extend(options || {}, {
                            streamFiles: false,
                            compression: "STORE",
                            compressionOptions: null,
                            type: "",
                            platform: "DOS",
                            comment: null,
                            mimeType: 'application/zip',
                            encodeFileName: utf8.utf8encode
                        });

                        opts.type = opts.type.toLowerCase();
                        opts.compression = opts.compression.toUpperCase();

                        // "binarystring" is prefered but the internals use "string".
                        if (opts.type === "binarystring") {
                            opts.type = "string";
                        }

                        if (!opts.type) {
                            throw new Error("No output type specified.");
                        }

                        utils.checkSupport(opts.type);

                        // accept nodejs `process.platform`
                        if (
                            opts.platform === 'darwin' ||
                            opts.platform === 'freebsd' ||
                            opts.platform === 'linux' ||
                            opts.platform === 'sunos'
                        ) {
                            opts.platform = "UNIX";
                        }
                        if (opts.platform === 'win32') {
                            opts.platform = "DOS";
                        }

                        var comment = opts.comment || this.comment || "";
                        worker = generate.generateWorker(this, opts, comment);
                    } catch (e) {
                        worker = new GenericWorker("error");
                        worker.error(e);
                    }
                    return new StreamHelper(worker, opts.type || "string", opts.mimeType);
                },
                /**
                 * Generate the complete zip file asynchronously.
                 * @see generateInternalStream
                 */
                generateAsync: function(options, onUpdate) {
                    return this.generateInternalStream(options).accumulate(onUpdate);
                },
                /**
                 * Generate the complete zip file asynchronously.
                 * @see generateInternalStream
                 */
                generateNodeStream: function(options, onUpdate) {
                    options = options || {};
                    if (!options.type) {
                        options.type = "nodebuffer";
                    }
                    return this.generateInternalStream(options).toNodejsStream(onUpdate);
                }
            };
            module.exports = out;

        }, {
            "./compressedObject": 2,
            "./defaults": 5,
            "./generate": 9,
            "./nodejs/NodejsStreamInputAdapter": 12,
            "./nodejsUtils": 14,
            "./stream/GenericWorker": 28,
            "./stream/StreamHelper": 29,
            "./utf8": 31,
            "./utils": 32,
            "./zipObject": 35
        }],
        16: [function(require, module, exports) {
            /*
             * This file is used by module bundlers (browserify/webpack/etc) when
             * including a stream implementation. We use "readable-stream" to get a
             * consistent behavior between nodejs versions but bundlers often have a shim
             * for "stream". Using this shim greatly improve the compatibility and greatly
             * reduce the final size of the bundle (only one stream implementation, not
             * two).
             */
            module.exports = require("stream");

        }, {
            "stream": undefined
        }],
        17: [function(require, module, exports) {
            'use strict';
            var DataReader = require('./DataReader');
            var utils = require('../utils');

            function ArrayReader(data) {
                DataReader.call(this, data);
                for (var i = 0; i < this.data.length; i++) {
                    data[i] = data[i] & 0xFF;
                }
            }
            utils.inherits(ArrayReader, DataReader);
            /**
             * @see DataReader.byteAt
             */
            ArrayReader.prototype.byteAt = function(i) {
                return this.data[this.zero + i];
            };
            /**
             * @see DataReader.lastIndexOfSignature
             */
            ArrayReader.prototype.lastIndexOfSignature = function(sig) {
                var sig0 = sig.charCodeAt(0),
                    sig1 = sig.charCodeAt(1),
                    sig2 = sig.charCodeAt(2),
                    sig3 = sig.charCodeAt(3);
                for (var i = this.length - 4; i >= 0; --i) {
                    if (this.data[i] === sig0 && this.data[i + 1] === sig1 && this.data[i + 2] === sig2 && this.data[i + 3] === sig3) {
                        return i - this.zero;
                    }
                }

                return -1;
            };
            /**
             * @see DataReader.readAndCheckSignature
             */
            ArrayReader.prototype.readAndCheckSignature = function(sig) {
                var sig0 = sig.charCodeAt(0),
                    sig1 = sig.charCodeAt(1),
                    sig2 = sig.charCodeAt(2),
                    sig3 = sig.charCodeAt(3),
                    data = this.readData(4);
                return sig0 === data[0] && sig1 === data[1] && sig2 === data[2] && sig3 === data[3];
            };
            /**
             * @see DataReader.readData
             */
            ArrayReader.prototype.readData = function(size) {
                this.checkOffset(size);
                if (size === 0) {
                    return [];
                }
                var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
                this.index += size;
                return result;
            };
            module.exports = ArrayReader;

        }, {
            "../utils": 32,
            "./DataReader": 18
        }],
        18: [function(require, module, exports) {
            'use strict';
            var utils = require('../utils');

            function DataReader(data) {
                this.data = data; // type : see implementation
                this.length = data.length;
                this.index = 0;
                this.zero = 0;
            }
            DataReader.prototype = {
                /**
                 * Check that the offset will not go too far.
                 * @param {string} offset the additional offset to check.
                 * @throws {Error} an Error if the offset is out of bounds.
                 */
                checkOffset: function(offset) {
                    this.checkIndex(this.index + offset);
                },
                /**
                 * Check that the specifed index will not be too far.
                 * @param {string} newIndex the index to check.
                 * @throws {Error} an Error if the index is out of bounds.
                 */
                checkIndex: function(newIndex) {
                    if (this.length < this.zero + newIndex || newIndex < 0) {
                        throw new Error("End of data reached (data length = " + this.length + ", asked index = " + (newIndex) + "). Corrupted zip ?");
                    }
                },
                /**
                 * Change the index.
                 * @param {number} newIndex The new index.
                 * @throws {Error} if the new index is out of the data.
                 */
                setIndex: function(newIndex) {
                    this.checkIndex(newIndex);
                    this.index = newIndex;
                },
                /**
                 * Skip the next n bytes.
                 * @param {number} n the number of bytes to skip.
                 * @throws {Error} if the new index is out of the data.
                 */
                skip: function(n) {
                    this.setIndex(this.index + n);
                },
                /**
                 * Get the byte at the specified index.
                 * @param {number} i the index to use.
                 * @return {number} a byte.
                 */
                byteAt: function(i) {
                    // see implementations
                },
                /**
                 * Get the next number with a given byte size.
                 * @param {number} size the number of bytes to read.
                 * @return {number} the corresponding number.
                 */
                readInt: function(size) {
                    var result = 0,
                        i;
                    this.checkOffset(size);
                    for (i = this.index + size - 1; i >= this.index; i--) {
                        result = (result << 8) + this.byteAt(i);
                    }
                    this.index += size;
                    return result;
                },
                /**
                 * Get the next string with a given byte size.
                 * @param {number} size the number of bytes to read.
                 * @return {string} the corresponding string.
                 */
                readString: function(size) {
                    return utils.transformTo("string", this.readData(size));
                },
                /**
                 * Get raw data without conversion, <size> bytes.
                 * @param {number} size the number of bytes to read.
                 * @return {Object} the raw data, implementation specific.
                 */
                readData: function(size) {
                    // see implementations
                },
                /**
                 * Find the last occurence of a zip signature (4 bytes).
                 * @param {string} sig the signature to find.
                 * @return {number} the index of the last occurence, -1 if not found.
                 */
                lastIndexOfSignature: function(sig) {
                    // see implementations
                },
                /**
                 * Read the signature (4 bytes) at the current position and compare it with sig.
                 * @param {string} sig the expected signature
                 * @return {boolean} true if the signature matches, false otherwise.
                 */
                readAndCheckSignature: function(sig) {
                    // see implementations
                },
                /**
                 * Get the next date.
                 * @return {Date} the date.
                 */
                readDate: function() {
                    var dostime = this.readInt(4);
                    return new Date(Date.UTC(
                        ((dostime >> 25) & 0x7f) + 1980, // year
                        ((dostime >> 21) & 0x0f) - 1, // month
                        (dostime >> 16) & 0x1f, // day
                        (dostime >> 11) & 0x1f, // hour
                        (dostime >> 5) & 0x3f, // minute
                        (dostime & 0x1f) << 1)); // second
                }
            };
            module.exports = DataReader;

        }, {
            "../utils": 32
        }],
        19: [function(require, module, exports) {
            'use strict';
            var Uint8ArrayReader = require('./Uint8ArrayReader');
            var utils = require('../utils');

            function NodeBufferReader(data) {
                Uint8ArrayReader.call(this, data);
            }
            utils.inherits(NodeBufferReader, Uint8ArrayReader);

            /**
             * @see DataReader.readData
             */
            NodeBufferReader.prototype.readData = function(size) {
                this.checkOffset(size);
                var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
                this.index += size;
                return result;
            };
            module.exports = NodeBufferReader;

        }, {
            "../utils": 32,
            "./Uint8ArrayReader": 21
        }],
        20: [function(require, module, exports) {
            'use strict';
            var DataReader = require('./DataReader');
            var utils = require('../utils');

            function StringReader(data) {
                DataReader.call(this, data);
            }
            utils.inherits(StringReader, DataReader);
            /**
             * @see DataReader.byteAt
             */
            StringReader.prototype.byteAt = function(i) {
                return this.data.charCodeAt(this.zero + i);
            };
            /**
             * @see DataReader.lastIndexOfSignature
             */
            StringReader.prototype.lastIndexOfSignature = function(sig) {
                return this.data.lastIndexOf(sig) - this.zero;
            };
            /**
             * @see DataReader.readAndCheckSignature
             */
            StringReader.prototype.readAndCheckSignature = function(sig) {
                var data = this.readData(4);
                return sig === data;
            };
            /**
             * @see DataReader.readData
             */
            StringReader.prototype.readData = function(size) {
                this.checkOffset(size);
                // this will work because the constructor applied the "& 0xff" mask.
                var result = this.data.slice(this.zero + this.index, this.zero + this.index + size);
                this.index += size;
                return result;
            };
            module.exports = StringReader;

        }, {
            "../utils": 32,
            "./DataReader": 18
        }],
        21: [function(require, module, exports) {
            'use strict';
            var ArrayReader = require('./ArrayReader');
            var utils = require('../utils');

            function Uint8ArrayReader(data) {
                ArrayReader.call(this, data);
            }
            utils.inherits(Uint8ArrayReader, ArrayReader);
            /**
             * @see DataReader.readData
             */
            Uint8ArrayReader.prototype.readData = function(size) {
                this.checkOffset(size);
                if (size === 0) {
                    // in IE10, when using subarray(idx, idx), we get the array [0x00] instead of [].
                    return new Uint8Array(0);
                }
                var result = this.data.subarray(this.zero + this.index, this.zero + this.index + size);
                this.index += size;
                return result;
            };
            module.exports = Uint8ArrayReader;

        }, {
            "../utils": 32,
            "./ArrayReader": 17
        }],
        22: [function(require, module, exports) {
            'use strict';

            var utils = require('../utils');
            var support = require('../support');
            var ArrayReader = require('./ArrayReader');
            var StringReader = require('./StringReader');
            var NodeBufferReader = require('./NodeBufferReader');
            var Uint8ArrayReader = require('./Uint8ArrayReader');

            /**
             * Create a reader adapted to the data.
             * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data to read.
             * @return {DataReader} the data reader.
             */
            module.exports = function(data) {
                var type = utils.getTypeOf(data);
                utils.checkSupport(type);
                if (type === "string" && !support.uint8array) {
                    return new StringReader(data);
                }
                if (type === "nodebuffer") {
                    return new NodeBufferReader(data);
                }
                if (support.uint8array) {
                    return new Uint8ArrayReader(utils.transformTo("uint8array", data));
                }
                return new ArrayReader(utils.transformTo("array", data));
            };

        }, {
            "../support": 30,
            "../utils": 32,
            "./ArrayReader": 17,
            "./NodeBufferReader": 19,
            "./StringReader": 20,
            "./Uint8ArrayReader": 21
        }],
        23: [function(require, module, exports) {
            'use strict';
            exports.LOCAL_FILE_HEADER = "PK\x03\x04";
            exports.CENTRAL_FILE_HEADER = "PK\x01\x02";
            exports.CENTRAL_DIRECTORY_END = "PK\x05\x06";
            exports.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x06\x07";
            exports.ZIP64_CENTRAL_DIRECTORY_END = "PK\x06\x06";
            exports.DATA_DESCRIPTOR = "PK\x07\x08";

        }, {}],
        24: [function(require, module, exports) {
            'use strict';

            var GenericWorker = require('./GenericWorker');
            var utils = require('../utils');

            /**
             * A worker which convert chunks to a specified type.
             * @constructor
             * @param {String} destType the destination type.
             */
            function ConvertWorker(destType) {
                GenericWorker.call(this, "ConvertWorker to " + destType);
                this.destType = destType;
            }
            utils.inherits(ConvertWorker, GenericWorker);

            /**
             * @see GenericWorker.processChunk
             */
            ConvertWorker.prototype.processChunk = function(chunk) {
                this.push({
                    data: utils.transformTo(this.destType, chunk.data),
                    meta: chunk.meta
                });
            };
            module.exports = ConvertWorker;

        }, {
            "../utils": 32,
            "./GenericWorker": 28
        }],
        25: [function(require, module, exports) {
            'use strict';

            var GenericWorker = require('./GenericWorker');
            var crc32 = require('../crc32');
            var utils = require('../utils');

            /**
             * A worker which calculate the crc32 of the data flowing through.
             * @constructor
             */
            function Crc32Probe() {
                GenericWorker.call(this, "Crc32Probe");
                this.withStreamInfo("crc32", 0);
            }
            utils.inherits(Crc32Probe, GenericWorker);

            /**
             * @see GenericWorker.processChunk
             */
            Crc32Probe.prototype.processChunk = function(chunk) {
                this.streamInfo.crc32 = crc32(chunk.data, this.streamInfo.crc32 || 0);
                this.push(chunk);
            };
            module.exports = Crc32Probe;

        }, {
            "../crc32": 4,
            "../utils": 32,
            "./GenericWorker": 28
        }],
        26: [function(require, module, exports) {
            'use strict';

            var utils = require('../utils');
            var GenericWorker = require('./GenericWorker');

            /**
             * A worker which calculate the total length of the data flowing through.
             * @constructor
             * @param {String} propName the name used to expose the length
             */
            function DataLengthProbe(propName) {
                GenericWorker.call(this, "DataLengthProbe for " + propName);
                this.propName = propName;
                this.withStreamInfo(propName, 0);
            }
            utils.inherits(DataLengthProbe, GenericWorker);

            /**
             * @see GenericWorker.processChunk
             */
            DataLengthProbe.prototype.processChunk = function(chunk) {
                if (chunk) {
                    var length = this.streamInfo[this.propName] || 0;
                    this.streamInfo[this.propName] = length + chunk.data.length;
                }
                GenericWorker.prototype.processChunk.call(this, chunk);
            };
            module.exports = DataLengthProbe;


        }, {
            "../utils": 32,
            "./GenericWorker": 28
        }],
        27: [function(require, module, exports) {
            'use strict';

            var utils = require('../utils');
            var GenericWorker = require('./GenericWorker');

            // the size of the generated chunks
            // TODO expose this as a public variable
            var DEFAULT_BLOCK_SIZE = 16 * 1024;

            /**
             * A worker that reads a content and emits chunks.
             * @constructor
             * @param {Promise} dataP the promise of the data to split
             */
            function DataWorker(dataP) {
                GenericWorker.call(this, "DataWorker");
                var self = this;
                this.dataIsReady = false;
                this.index = 0;
                this.max = 0;
                this.data = null;
                this.type = "";

                this._tickScheduled = false;

                dataP.then(function(data) {
                    self.dataIsReady = true;
                    self.data = data;
                    self.max = data && data.length || 0;
                    self.type = utils.getTypeOf(data);
                    if (!self.isPaused) {
                        self._tickAndRepeat();
                    }
                }, function(e) {
                    self.error(e);
                });
            }

            utils.inherits(DataWorker, GenericWorker);

            /**
             * @see GenericWorker.cleanUp
             */
            DataWorker.prototype.cleanUp = function() {
                GenericWorker.prototype.cleanUp.call(this);
                this.data = null;
            };

            /**
             * @see GenericWorker.resume
             */
            DataWorker.prototype.resume = function() {
                if (!GenericWorker.prototype.resume.call(this)) {
                    return false;
                }

                if (!this._tickScheduled && this.dataIsReady) {
                    this._tickScheduled = true;
                    utils.delay(this._tickAndRepeat, [], this);
                }
                return true;
            };

            /**
             * Trigger a tick a schedule an other call to this function.
             */
            DataWorker.prototype._tickAndRepeat = function() {
                this._tickScheduled = false;
                if (this.isPaused || this.isFinished) {
                    return;
                }
                this._tick();
                if (!this.isFinished) {
                    utils.delay(this._tickAndRepeat, [], this);
                    this._tickScheduled = true;
                }
            };

            /**
             * Read and push a chunk.
             */
            DataWorker.prototype._tick = function() {

                if (this.isPaused || this.isFinished) {
                    return false;
                }

                var size = DEFAULT_BLOCK_SIZE;
                var data = null,
                    nextIndex = Math.min(this.max, this.index + size);
                if (this.index >= this.max) {
                    // EOF
                    return this.end();
                } else {
                    switch (this.type) {
                        case "string":
                            data = this.data.substring(this.index, nextIndex);
                            break;
                        case "uint8array":
                            data = this.data.subarray(this.index, nextIndex);
                            break;
                        case "array":
                        case "nodebuffer":
                            data = this.data.slice(this.index, nextIndex);
                            break;
                    }
                    this.index = nextIndex;
                    return this.push({
                        data: data,
                        meta: {
                            percent: this.max ? this.index / this.max * 100 : 0
                        }
                    });
                }
            };

            module.exports = DataWorker;

        }, {
            "../utils": 32,
            "./GenericWorker": 28
        }],
        28: [function(require, module, exports) {
            'use strict';

            /**
             * A worker that does nothing but passing chunks to the next one. This is like
             * a nodejs stream but with some differences. On the good side :
             * - it works on IE 6-9 without any issue / polyfill
             * - it weights less than the full dependencies bundled with browserify
             * - it forwards errors (no need to declare an error handler EVERYWHERE)
             *
             * A chunk is an object with 2 attributes : `meta` and `data`. The former is an
             * object containing anything (`percent` for example), see each worker for more
             * details. The latter is the real data (String, Uint8Array, etc).
             *
             * @constructor
             * @param {String} name the name of the stream (mainly used for debugging purposes)
             */
            function GenericWorker(name) {
                // the name of the worker
                this.name = name || "default";
                // an object containing metadata about the workers chain
                this.streamInfo = {};
                // an error which happened when the worker was paused
                this.generatedError = null;
                // an object containing metadata to be merged by this worker into the general metadata
                this.extraStreamInfo = {};
                // true if the stream is paused (and should not do anything), false otherwise
                this.isPaused = true;
                // true if the stream is finished (and should not do anything), false otherwise
                this.isFinished = false;
                // true if the stream is locked to prevent further structure updates (pipe), false otherwise
                this.isLocked = false;
                // the event listeners
                this._listeners = {
                    'data': [],
                    'end': [],
                    'error': []
                };
                // the previous worker, if any
                this.previous = null;
            }

            GenericWorker.prototype = {
                /**
                 * Push a chunk to the next workers.
                 * @param {Object} chunk the chunk to push
                 */
                push: function(chunk) {
                    this.emit("data", chunk);
                },
                /**
                 * End the stream.
                 * @return {Boolean} true if this call ended the worker, false otherwise.
                 */
                end: function() {
                    if (this.isFinished) {
                        return false;
                    }

                    this.flush();
                    try {
                        this.emit("end");
                        this.cleanUp();
                        this.isFinished = true;
                    } catch (e) {
                        this.emit("error", e);
                    }
                    return true;
                },
                /**
                 * End the stream with an error.
                 * @param {Error} e the error which caused the premature end.
                 * @return {Boolean} true if this call ended the worker with an error, false otherwise.
                 */
                error: function(e) {
                    if (this.isFinished) {
                        return false;
                    }

                    if (this.isPaused) {
                        this.generatedError = e;
                    } else {
                        this.isFinished = true;

                        this.emit("error", e);

                        // in the workers chain exploded in the middle of the chain,
                        // the error event will go downward but we also need to notify
                        // workers upward that there has been an error.
                        if (this.previous) {
                            this.previous.error(e);
                        }

                        this.cleanUp();
                    }
                    return true;
                },
                /**
                 * Add a callback on an event.
                 * @param {String} name the name of the event (data, end, error)
                 * @param {Function} listener the function to call when the event is triggered
                 * @return {GenericWorker} the current object for chainability
                 */
                on: function(name, listener) {
                    this._listeners[name].push(listener);
                    return this;
                },
                /**
                 * Clean any references when a worker is ending.
                 */
                cleanUp: function() {
                    this.streamInfo = this.generatedError = this.extraStreamInfo = null;
                    this._listeners = [];
                },
                /**
                 * Trigger an event. This will call registered callback with the provided arg.
                 * @param {String} name the name of the event (data, end, error)
                 * @param {Object} arg the argument to call the callback with.
                 */
                emit: function(name, arg) {
                    if (this._listeners[name]) {
                        for (var i = 0; i < this._listeners[name].length; i++) {
                            this._listeners[name][i].call(this, arg);
                        }
                    }
                },
                /**
                 * Chain a worker with an other.
                 * @param {Worker} next the worker receiving events from the current one.
                 * @return {worker} the next worker for chainability
                 */
                pipe: function(next) {
                    return next.registerPrevious(this);
                },
                /**
                 * Same as `pipe` in the other direction.
                 * Using an API with `pipe(next)` is very easy.
                 * Implementing the API with the point of view of the next one registering
                 * a source is easier, see the ZipFileWorker.
                 * @param {Worker} previous the previous worker, sending events to this one
                 * @return {Worker} the current worker for chainability
                 */
                registerPrevious: function(previous) {
                    if (this.isLocked) {
                        throw new Error("The stream '" + this + "' has already been used.");
                    }

                    // sharing the streamInfo...
                    this.streamInfo = previous.streamInfo;
                    // ... and adding our own bits
                    this.mergeStreamInfo();
                    this.previous = previous;
                    var self = this;
                    previous.on('data', function(chunk) {
                        self.processChunk(chunk);
                    });
                    previous.on('end', function() {
                        self.end();
                    });
                    previous.on('error', function(e) {
                        self.error(e);
                    });
                    return this;
                },
                /**
                 * Pause the stream so it doesn't send events anymore.
                 * @return {Boolean} true if this call paused the worker, false otherwise.
                 */
                pause: function() {
                    if (this.isPaused || this.isFinished) {
                        return false;
                    }
                    this.isPaused = true;

                    if (this.previous) {
                        this.previous.pause();
                    }
                    return true;
                },
                /**
                 * Resume a paused stream.
                 * @return {Boolean} true if this call resumed the worker, false otherwise.
                 */
                resume: function() {
                    if (!this.isPaused || this.isFinished) {
                        return false;
                    }
                    this.isPaused = false;

                    // if true, the worker tried to resume but failed
                    var withError = false;
                    if (this.generatedError) {
                        this.error(this.generatedError);
                        withError = true;
                    }
                    if (this.previous) {
                        this.previous.resume();
                    }

                    return !withError;
                },
                /**
                 * Flush any remaining bytes as the stream is ending.
                 */
                flush: function() {},
                /**
                 * Process a chunk. This is usually the method overridden.
                 * @param {Object} chunk the chunk to process.
                 */
                processChunk: function(chunk) {
                    this.push(chunk);
                },
                /**
                 * Add a key/value to be added in the workers chain streamInfo once activated.
                 * @param {String} key the key to use
                 * @param {Object} value the associated value
                 * @return {Worker} the current worker for chainability
                 */
                withStreamInfo: function(key, value) {
                    this.extraStreamInfo[key] = value;
                    this.mergeStreamInfo();
                    return this;
                },
                /**
                 * Merge this worker's streamInfo into the chain's streamInfo.
                 */
                mergeStreamInfo: function() {
                    for (var key in this.extraStreamInfo) {
                        if (!this.extraStreamInfo.hasOwnProperty(key)) {
                            continue;
                        }
                        this.streamInfo[key] = this.extraStreamInfo[key];
                    }
                },

                /**
                 * Lock the stream to prevent further updates on the workers chain.
                 * After calling this method, all calls to pipe will fail.
                 */
                lock: function() {
                    if (this.isLocked) {
                        throw new Error("The stream '" + this + "' has already been used.");
                    }
                    this.isLocked = true;
                    if (this.previous) {
                        this.previous.lock();
                    }
                },

                /**
                 *
                 * Pretty print the workers chain.
                 */
                toString: function() {
                    var me = "Worker " + this.name;
                    if (this.previous) {
                        return this.previous + " -> " + me;
                    } else {
                        return me;
                    }
                }
            };

            module.exports = GenericWorker;

        }, {}],
        29: [function(require, module, exports) {
            'use strict';

            var utils = require('../utils');
            var ConvertWorker = require('./ConvertWorker');
            var GenericWorker = require('./GenericWorker');
            var base64 = require('../base64');
            var support = require("../support");
            var external = require("../external");

            var NodejsStreamOutputAdapter = null;
            if (support.nodestream) {
                try {
                    NodejsStreamOutputAdapter = require('../nodejs/NodejsStreamOutputAdapter');
                } catch (e) {}
            }

            /**
             * Apply the final transformation of the data. If the user wants a Blob for
             * example, it's easier to work with an U8intArray and finally do the
             * ArrayBuffer/Blob conversion.
             * @param {String} resultType the name of the final type
             * @param {String} chunkType the type of the data in the given array.
             * @param {Array} dataArray the array containing the data chunks to concatenate
             * @param {String|Uint8Array|Buffer} content the content to transform
             * @param {String} mimeType the mime type of the content, if applicable.
             * @return {String|Uint8Array|ArrayBuffer|Buffer|Blob} the content in the right format.
             */
            function transformZipOutput(resultType, chunkType, dataArray, mimeType) {
                var content = null;
                switch (resultType) {
                    case "blob":
                        return utils.newBlob(dataArray, mimeType);
                    case "base64":
                        content = concat(chunkType, dataArray);
                        return base64.encode(content);
                    default:
                        content = concat(chunkType, dataArray);
                        return utils.transformTo(resultType, content);
                }
            }

            /**
             * Concatenate an array of data of the given type.
             * @param {String} type the type of the data in the given array.
             * @param {Array} dataArray the array containing the data chunks to concatenate
             * @return {String|Uint8Array|Buffer} the concatenated data
             * @throws Error if the asked type is unsupported
             */
            function concat(type, dataArray) {
                var i, index = 0,
                    res = null,
                    totalLength = 0;
                for (i = 0; i < dataArray.length; i++) {
                    totalLength += dataArray[i].length;
                }
                switch (type) {
                    case "string":
                        return dataArray.join("");
                    case "array":
                        return Array.prototype.concat.apply([], dataArray);
                    case "uint8array":
                        res = new Uint8Array(totalLength);
                        for (i = 0; i < dataArray.length; i++) {
                            res.set(dataArray[i], index);
                            index += dataArray[i].length;
                        }
                        return res;
                    case "nodebuffer":
                        return Buffer.concat(dataArray);
                    default:
                        throw new Error("concat : unsupported type '" + type + "'");
                }
            }

            /**
             * Listen a StreamHelper, accumulate its content and concatenate it into a
             * complete block.
             * @param {StreamHelper} helper the helper to use.
             * @param {Function} updateCallback a callback called on each update. Called
             * with one arg :
             * - the metadata linked to the update received.
             * @return Promise the promise for the accumulation.
             */
            function accumulate(helper, updateCallback) {
                return new external.Promise(function(resolve, reject) {
                    var dataArray = [];
                    var chunkType = helper._internalType,
                        resultType = helper._outputType,
                        mimeType = helper._mimeType;
                    helper
                        .on('data', function(data, meta) {
                            dataArray.push(data);
                            if (updateCallback) {
                                updateCallback(meta);
                            }
                        })
                        .on('error', function(err) {
                            dataArray = [];
                            reject(err);
                        })
                        .on('end', function() {
                            try {
                                var result = transformZipOutput(resultType, chunkType, dataArray, mimeType);
                                resolve(result);
                            } catch (e) {
                                reject(e);
                            }
                            dataArray = [];
                        })
                        .resume();
                });
            }

            /**
             * An helper to easily use workers outside of JSZip.
             * @constructor
             * @param {Worker} worker the worker to wrap
             * @param {String} outputType the type of data expected by the use
             * @param {String} mimeType the mime type of the content, if applicable.
             */
            function StreamHelper(worker, outputType, mimeType) {
                var internalType = outputType;
                switch (outputType) {
                    case "blob":
                        internalType = "arraybuffer";
                        break;
                    case "arraybuffer":
                        internalType = "uint8array";
                        break;
                    case "base64":
                        internalType = "string";
                        break;
                }

                try {
                    // the type used internally
                    this._internalType = internalType;
                    // the type used to output results
                    this._outputType = outputType;
                    // the mime type
                    this._mimeType = mimeType;
                    utils.checkSupport(internalType);
                    this._worker = worker.pipe(new ConvertWorker(internalType));
                    // the last workers can be rewired without issues but we need to
                    // prevent any updates on previous workers.
                    worker.lock();
                } catch (e) {
                    this._worker = new GenericWorker("error");
                    this._worker.error(e);
                }
            }

            StreamHelper.prototype = {
                /**
                 * Listen a StreamHelper, accumulate its content and concatenate it into a
                 * complete block.
                 * @param {Function} updateCb the update callback.
                 * @return Promise the promise for the accumulation.
                 */
                accumulate: function(updateCb) {
                    return accumulate(this, updateCb);
                },
                /**
                 * Add a listener on an event triggered on a stream.
                 * @param {String} evt the name of the event
                 * @param {Function} fn the listener
                 * @return {StreamHelper} the current helper.
                 */
                on: function(evt, fn) {
                    var self = this;

                    if (evt === "data") {
                        this._worker.on(evt, function(chunk) {
                            fn.call(self, chunk.data, chunk.meta);
                        });
                    } else {
                        this._worker.on(evt, function() {
                            utils.delay(fn, arguments, self);
                        });
                    }
                    return this;
                },
                /**
                 * Resume the flow of chunks.
                 * @return {StreamHelper} the current helper.
                 */
                resume: function() {
                    utils.delay(this._worker.resume, [], this._worker);
                    return this;
                },
                /**
                 * Pause the flow of chunks.
                 * @return {StreamHelper} the current helper.
                 */
                pause: function() {
                    this._worker.pause();
                    return this;
                },
                /**
                 * Return a nodejs stream for this helper.
                 * @param {Function} updateCb the update callback.
                 * @return {NodejsStreamOutputAdapter} the nodejs stream.
                 */
                toNodejsStream: function(updateCb) {
                    utils.checkSupport("nodestream");
                    if (this._outputType !== "nodebuffer") {
                        // an object stream containing blob/arraybuffer/uint8array/string
                        // is strange and I don't know if it would be useful.
                        // I you find this comment and have a good usecase, please open a
                        // bug report !
                        throw new Error(this._outputType + " is not supported by this method");
                    }

                    return new NodejsStreamOutputAdapter(this, {
                        objectMode: this._outputType !== "nodebuffer"
                    }, updateCb);
                }
            };


            module.exports = StreamHelper;

        }, {
            "../base64": 1,
            "../external": 6,
            "../nodejs/NodejsStreamOutputAdapter": 13,
            "../support": 30,
            "../utils": 32,
            "./ConvertWorker": 24,
            "./GenericWorker": 28
        }],
        30: [function(require, module, exports) {
            'use strict';

            exports.base64 = true;
            exports.array = true;
            exports.string = true;
            exports.arraybuffer = typeof ArrayBuffer !== "undefined" && typeof Uint8Array !== "undefined";
            exports.nodebuffer = typeof Buffer !== "undefined";
            // contains true if JSZip can read/generate Uint8Array, false otherwise.
            exports.uint8array = typeof Uint8Array !== "undefined";

            if (typeof ArrayBuffer === "undefined") {
                exports.blob = false;
            } else {
                var buffer = new ArrayBuffer(0);
                try {
                    exports.blob = new Blob([buffer], {
                        type: "application/zip"
                    }).size === 0;
                } catch (e) {
                    try {
                        var Builder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
                        var builder = new Builder();
                        builder.append(buffer);
                        exports.blob = builder.getBlob('application/zip').size === 0;
                    } catch (e) {
                        exports.blob = false;
                    }
                }
            }

            try {
                exports.nodestream = !!require('readable-stream').Readable;
            } catch (e) {
                exports.nodestream = false;
            }

        }, {
            "readable-stream": 16
        }],
        31: [function(require, module, exports) {
            'use strict';

            var utils = require('./utils');
            var support = require('./support');
            var nodejsUtils = require('./nodejsUtils');
            var GenericWorker = require('./stream/GenericWorker');

            /**
             * The following functions come from pako, from pako/lib/utils/strings
             * released under the MIT license, see pako https://github.com/nodeca/pako/
             */

            // Table with utf8 lengths (calculated by first byte of sequence)
            // Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
            // because max possible codepoint is 0x10ffff
            var _utf8len = new Array(256);
            for (var i = 0; i < 256; i++) {
                _utf8len[i] = (i >= 252 ? 6 : i >= 248 ? 5 : i >= 240 ? 4 : i >= 224 ? 3 : i >= 192 ? 2 : 1);
            }
            _utf8len[254] = _utf8len[254] = 1; // Invalid sequence start

            // convert string to array (typed, when possible)
            var string2buf = function(str) {
                var buf, c, c2, m_pos, i, str_len = str.length,
                    buf_len = 0;

                // count binary size
                for (m_pos = 0; m_pos < str_len; m_pos++) {
                    c = str.charCodeAt(m_pos);
                    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
                        c2 = str.charCodeAt(m_pos + 1);
                        if ((c2 & 0xfc00) === 0xdc00) {
                            c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                            m_pos++;
                        }
                    }
                    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
                }

                // allocate buffer
                if (support.uint8array) {
                    buf = new Uint8Array(buf_len);
                } else {
                    buf = new Array(buf_len);
                }

                // convert
                for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
                    c = str.charCodeAt(m_pos);
                    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
                        c2 = str.charCodeAt(m_pos + 1);
                        if ((c2 & 0xfc00) === 0xdc00) {
                            c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                            m_pos++;
                        }
                    }
                    if (c < 0x80) {
                        /* one byte */
                        buf[i++] = c;
                    } else if (c < 0x800) {
                        /* two bytes */
                        buf[i++] = 0xC0 | (c >>> 6);
                        buf[i++] = 0x80 | (c & 0x3f);
                    } else if (c < 0x10000) {
                        /* three bytes */
                        buf[i++] = 0xE0 | (c >>> 12);
                        buf[i++] = 0x80 | (c >>> 6 & 0x3f);
                        buf[i++] = 0x80 | (c & 0x3f);
                    } else {
                        /* four bytes */
                        buf[i++] = 0xf0 | (c >>> 18);
                        buf[i++] = 0x80 | (c >>> 12 & 0x3f);
                        buf[i++] = 0x80 | (c >>> 6 & 0x3f);
                        buf[i++] = 0x80 | (c & 0x3f);
                    }
                }

                return buf;
            };

            // Calculate max possible position in utf8 buffer,
            // that will not break sequence. If that's not possible
            // - (very small limits) return max size as is.
            //
            // buf[] - utf8 bytes array
            // max   - length limit (mandatory);
            var utf8border = function(buf, max) {
                var pos;

                max = max || buf.length;
                if (max > buf.length) {
                    max = buf.length;
                }

                // go back from last position, until start of sequence found
                pos = max - 1;
                while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) {
                    pos--;
                }

                // Fuckup - very small and broken sequence,
                // return max, because we should return something anyway.
                if (pos < 0) {
                    return max;
                }

                // If we came to start of buffer - that means vuffer is too small,
                // return max too.
                if (pos === 0) {
                    return max;
                }

                return (pos + _utf8len[buf[pos]] > max) ? pos : max;
            };

            // convert array to string
            var buf2string = function(buf) {
                var str, i, out, c, c_len;
                var len = buf.length;

                // Reserve max possible length (2 words per char)
                // NB: by unknown reasons, Array is significantly faster for
                //     String.fromCharCode.apply than Uint16Array.
                var utf16buf = new Array(len * 2);

                for (out = 0, i = 0; i < len;) {
                    c = buf[i++];
                    // quick process ascii
                    if (c < 0x80) {
                        utf16buf[out++] = c;
                        continue;
                    }

                    c_len = _utf8len[c];
                    // skip 5 & 6 byte codes
                    if (c_len > 4) {
                        utf16buf[out++] = 0xfffd;
                        i += c_len - 1;
                        continue;
                    }

                    // apply mask on first byte
                    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
                    // join the rest
                    while (c_len > 1 && i < len) {
                        c = (c << 6) | (buf[i++] & 0x3f);
                        c_len--;
                    }

                    // terminated by end of string?
                    if (c_len > 1) {
                        utf16buf[out++] = 0xfffd;
                        continue;
                    }

                    if (c < 0x10000) {
                        utf16buf[out++] = c;
                    } else {
                        c -= 0x10000;
                        utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
                        utf16buf[out++] = 0xdc00 | (c & 0x3ff);
                    }
                }

                // shrinkBuf(utf16buf, out)
                if (utf16buf.length !== out) {
                    if (utf16buf.subarray) {
                        utf16buf = utf16buf.subarray(0, out);
                    } else {
                        utf16buf.length = out;
                    }
                }

                // return String.fromCharCode.apply(null, utf16buf);
                return utils.applyFromCharCode(utf16buf);
            };


            // That's all for the pako functions.


            /**
             * Transform a javascript string into an array (typed if possible) of bytes,
             * UTF-8 encoded.
             * @param {String} str the string to encode
             * @return {Array|Uint8Array|Buffer} the UTF-8 encoded string.
             */
            exports.utf8encode = function utf8encode(str) {
                if (support.nodebuffer) {
                    return nodejsUtils.newBuffer(str, "utf-8");
                }

                return string2buf(str);
            };


            /**
             * Transform a bytes array (or a representation) representing an UTF-8 encoded
             * string into a javascript string.
             * @param {Array|Uint8Array|Buffer} buf the data de decode
             * @return {String} the decoded string.
             */
            exports.utf8decode = function utf8decode(buf) {
                if (support.nodebuffer) {
                    return utils.transformTo("nodebuffer", buf).toString("utf-8");
                }

                buf = utils.transformTo(support.uint8array ? "uint8array" : "array", buf);

                return buf2string(buf);
            };

            /**
             * A worker to decode utf8 encoded binary chunks into string chunks.
             * @constructor
             */
            function Utf8DecodeWorker() {
                GenericWorker.call(this, "utf-8 decode");
                // the last bytes if a chunk didn't end with a complete codepoint.
                this.leftOver = null;
            }
            utils.inherits(Utf8DecodeWorker, GenericWorker);

            /**
             * @see GenericWorker.processChunk
             */
            Utf8DecodeWorker.prototype.processChunk = function(chunk) {

                var data = utils.transformTo(support.uint8array ? "uint8array" : "array", chunk.data);

                // 1st step, re-use what's left of the previous chunk
                if (this.leftOver && this.leftOver.length) {
                    if (support.uint8array) {
                        var previousData = data;
                        data = new Uint8Array(previousData.length + this.leftOver.length);
                        data.set(this.leftOver, 0);
                        data.set(previousData, this.leftOver.length);
                    } else {
                        data = this.leftOver.concat(data);
                    }
                    this.leftOver = null;
                }

                var nextBoundary = utf8border(data);
                var usableData = data;
                if (nextBoundary !== data.length) {
                    if (support.uint8array) {
                        usableData = data.subarray(0, nextBoundary);
                        this.leftOver = data.subarray(nextBoundary, data.length);
                    } else {
                        usableData = data.slice(0, nextBoundary);
                        this.leftOver = data.slice(nextBoundary, data.length);
                    }
                }

                this.push({
                    data: exports.utf8decode(usableData),
                    meta: chunk.meta
                });
            };

            /**
             * @see GenericWorker.flush
             */
            Utf8DecodeWorker.prototype.flush = function() {
                if (this.leftOver && this.leftOver.length) {
                    this.push({
                        data: exports.utf8decode(this.leftOver),
                        meta: {}
                    });
                    this.leftOver = null;
                }
            };
            exports.Utf8DecodeWorker = Utf8DecodeWorker;

            /**
             * A worker to endcode string chunks into utf8 encoded binary chunks.
             * @constructor
             */
            function Utf8EncodeWorker() {
                GenericWorker.call(this, "utf-8 encode");
            }
            utils.inherits(Utf8EncodeWorker, GenericWorker);

            /**
             * @see GenericWorker.processChunk
             */
            Utf8EncodeWorker.prototype.processChunk = function(chunk) {
                this.push({
                    data: exports.utf8encode(chunk.data),
                    meta: chunk.meta
                });
            };
            exports.Utf8EncodeWorker = Utf8EncodeWorker;

        }, {
            "./nodejsUtils": 14,
            "./stream/GenericWorker": 28,
            "./support": 30,
            "./utils": 32
        }],
        32: [function(require, module, exports) {
            'use strict';

            var support = require('./support');
            var base64 = require('./base64');
            var nodejsUtils = require('./nodejsUtils');
            var setImmediate = require('core-js/library/fn/set-immediate');
            var external = require("./external");


            /**
             * Convert a string that pass as a "binary string": it should represent a byte
             * array but may have > 255 char codes. Be sure to take only the first byte
             * and returns the byte array.
             * @param {String} str the string to transform.
             * @return {Array|Uint8Array} the string in a binary format.
             */
            function string2binary(str) {
                var result = null;
                if (support.uint8array) {
                    result = new Uint8Array(str.length);
                } else {
                    result = new Array(str.length);
                }
                return stringToArrayLike(str, result);
            }

            /**
             * Create a new blob with the given content and the given type.
             * @param {Array[String|ArrayBuffer]} parts the content to put in the blob. DO NOT use
             * an Uint8Array because the stock browser of android 4 won't accept it (it
             * will be silently converted to a string, "[object Uint8Array]").
             * @param {String} type the mime type of the blob.
             * @return {Blob} the created blob.
             */
            exports.newBlob = function(parts, type) {
                exports.checkSupport("blob");

                try {
                    // Blob constructor
                    return new Blob(parts, {
                        type: type
                    });
                } catch (e) {

                    try {
                        // deprecated, browser only, old way
                        var Builder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
                        var builder = new Builder();
                        for (var i = 0; i < parts.length; i++) {
                            builder.append(parts[i]);
                        }
                        return builder.getBlob(type);
                    } catch (e) {

                        // well, fuck ?!
                        throw new Error("Bug : can't construct the Blob.");
                    }
                }


            };
            /**
             * The identity function.
             * @param {Object} input the input.
             * @return {Object} the same input.
             */
            function identity(input) {
                return input;
            }

            /**
             * Fill in an array with a string.
             * @param {String} str the string to use.
             * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to fill in (will be mutated).
             * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated array.
             */
            function stringToArrayLike(str, array) {
                for (var i = 0; i < str.length; ++i) {
                    array[i] = str.charCodeAt(i) & 0xFF;
                }
                return array;
            }

            /**
             * An helper for the function arrayLikeToString.
             * This contains static informations and functions that
             * can be optimized by the browser JIT compiler.
             */
            var arrayToStringHelper = {
                /**
                 * Transform an array of int into a string, chunk by chunk.
                 * See the performances notes on arrayLikeToString.
                 * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
                 * @param {String} type the type of the array.
                 * @param {Integer} chunk the chunk size.
                 * @return {String} the resulting string.
                 * @throws Error if the chunk is too big for the stack.
                 */
                stringifyByChunk: function(array, type, chunk) {
                    var result = [],
                        k = 0,
                        len = array.length;
                    // shortcut
                    if (len <= chunk) {
                        return String.fromCharCode.apply(null, array);
                    }
                    while (k < len) {
                        if (type === "array" || type === "nodebuffer") {
                            result.push(String.fromCharCode.apply(null, array.slice(k, Math.min(k + chunk, len))));
                        } else {
                            result.push(String.fromCharCode.apply(null, array.subarray(k, Math.min(k + chunk, len))));
                        }
                        k += chunk;
                    }
                    return result.join("");
                },
                /**
                 * Call String.fromCharCode on every item in the array.
                 * This is the naive implementation, which generate A LOT of intermediate string.
                 * This should be used when everything else fail.
                 * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
                 * @return {String} the result.
                 */
                stringifyByChar: function(array) {
                    var resultStr = "";
                    for (var i = 0; i < array.length; i++) {
                        resultStr += String.fromCharCode(array[i]);
                    }
                    return resultStr;
                },
                applyCanBeUsed: {
                    /**
                     * true if the browser accepts to use String.fromCharCode on Uint8Array
                     */
                    uint8array: (function() {
                        try {
                            return support.uint8array && String.fromCharCode.apply(null, new Uint8Array(1)).length === 1;
                        } catch (e) {
                            return false;
                        }
                    })(),
                    /**
                     * true if the browser accepts to use String.fromCharCode on nodejs Buffer.
                     */
                    nodebuffer: (function() {
                        try {
                            return support.nodebuffer && String.fromCharCode.apply(null, nodejsUtils.newBuffer(1)).length === 1;
                        } catch (e) {
                            return false;
                        }
                    })()
                }
            };

            /**
             * Transform an array-like object to a string.
             * @param {Array|ArrayBuffer|Uint8Array|Buffer} array the array to transform.
             * @return {String} the result.
             */
            function arrayLikeToString(array) {
                // Performances notes :
                // --------------------
                // String.fromCharCode.apply(null, array) is the fastest, see
                // see http://jsperf.com/converting-a-uint8array-to-a-string/2
                // but the stack is limited (and we can get huge arrays !).
                //
                // result += String.fromCharCode(array[i]); generate too many strings !
                //
                // This code is inspired by http://jsperf.com/arraybuffer-to-string-apply-performance/2
                // TODO : we now have workers that split the work. Do we still need that ?
                var chunk = 65536,
                    type = exports.getTypeOf(array),
                    canUseApply = true;
                if (type === "uint8array") {
                    canUseApply = arrayToStringHelper.applyCanBeUsed.uint8array;
                } else if (type === "nodebuffer") {
                    canUseApply = arrayToStringHelper.applyCanBeUsed.nodebuffer;
                }

                if (canUseApply) {
                    while (chunk > 1) {
                        try {
                            return arrayToStringHelper.stringifyByChunk(array, type, chunk);
                        } catch (e) {
                            chunk = Math.floor(chunk / 2);
                        }
                    }
                }

                // no apply or chunk error : slow and painful algorithm
                // default browser on android 4.*
                return arrayToStringHelper.stringifyByChar(array);
            }

            exports.applyFromCharCode = arrayLikeToString;


            /**
             * Copy the data from an array-like to an other array-like.
             * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayFrom the origin array.
             * @param {Array|ArrayBuffer|Uint8Array|Buffer} arrayTo the destination array which will be mutated.
             * @return {Array|ArrayBuffer|Uint8Array|Buffer} the updated destination array.
             */
            function arrayLikeToArrayLike(arrayFrom, arrayTo) {
                for (var i = 0; i < arrayFrom.length; i++) {
                    arrayTo[i] = arrayFrom[i];
                }
                return arrayTo;
            }

            // a matrix containing functions to transform everything into everything.
            var transform = {};

            // string to ?
            transform["string"] = {
                "string": identity,
                "array": function(input) {
                    return stringToArrayLike(input, new Array(input.length));
                },
                "arraybuffer": function(input) {
                    return transform["string"]["uint8array"](input).buffer;
                },
                "uint8array": function(input) {
                    return stringToArrayLike(input, new Uint8Array(input.length));
                },
                "nodebuffer": function(input) {
                    return stringToArrayLike(input, nodejsUtils.newBuffer(input.length));
                }
            };

            // array to ?
            transform["array"] = {
                "string": arrayLikeToString,
                "array": identity,
                "arraybuffer": function(input) {
                    return (new Uint8Array(input)).buffer;
                },
                "uint8array": function(input) {
                    return new Uint8Array(input);
                },
                "nodebuffer": function(input) {
                    return nodejsUtils.newBuffer(input);
                }
            };

            // arraybuffer to ?
            transform["arraybuffer"] = {
                "string": function(input) {
                    return arrayLikeToString(new Uint8Array(input));
                },
                "array": function(input) {
                    return arrayLikeToArrayLike(new Uint8Array(input), new Array(input.byteLength));
                },
                "arraybuffer": identity,
                "uint8array": function(input) {
                    return new Uint8Array(input);
                },
                "nodebuffer": function(input) {
                    return nodejsUtils.newBuffer(new Uint8Array(input));
                }
            };

            // uint8array to ?
            transform["uint8array"] = {
                "string": arrayLikeToString,
                "array": function(input) {
                    return arrayLikeToArrayLike(input, new Array(input.length));
                },
                "arraybuffer": function(input) {
                    // copy the uint8array: DO NOT propagate the original ArrayBuffer, it
                    // can be way larger (the whole zip file for example).
                    var copy = new Uint8Array(input.length);
                    if (input.length) {
                        copy.set(input, 0);
                    }
                    return copy.buffer;
                },
                "uint8array": identity,
                "nodebuffer": function(input) {
                    return nodejsUtils.newBuffer(input);
                }
            };

            // nodebuffer to ?
            transform["nodebuffer"] = {
                "string": arrayLikeToString,
                "array": function(input) {
                    return arrayLikeToArrayLike(input, new Array(input.length));
                },
                "arraybuffer": function(input) {
                    return transform["nodebuffer"]["uint8array"](input).buffer;
                },
                "uint8array": function(input) {
                    return arrayLikeToArrayLike(input, new Uint8Array(input.length));
                },
                "nodebuffer": identity
            };

            /**
             * Transform an input into any type.
             * The supported output type are : string, array, uint8array, arraybuffer, nodebuffer.
             * If no output type is specified, the unmodified input will be returned.
             * @param {String} outputType the output type.
             * @param {String|Array|ArrayBuffer|Uint8Array|Buffer} input the input to convert.
             * @throws {Error} an Error if the browser doesn't support the requested output type.
             */
            exports.transformTo = function(outputType, input) {
                if (!input) {
                    // undefined, null, etc
                    // an empty string won't harm.
                    input = "";
                }
                if (!outputType) {
                    return input;
                }
                exports.checkSupport(outputType);
                var inputType = exports.getTypeOf(input);
                var result = transform[inputType][outputType](input);
                return result;
            };

            /**
             * Return the type of the input.
             * The type will be in a format valid for JSZip.utils.transformTo : string, array, uint8array, arraybuffer.
             * @param {Object} input the input to identify.
             * @return {String} the (lowercase) type of the input.
             */
            exports.getTypeOf = function(input) {
                if (typeof input === "string") {
                    return "string";
                }
                if (Object.prototype.toString.call(input) === "[object Array]") {
                    return "array";
                }
                if (support.nodebuffer && nodejsUtils.isBuffer(input)) {
                    return "nodebuffer";
                }
                if (support.uint8array && input instanceof Uint8Array) {
                    return "uint8array";
                }
                if (support.arraybuffer && input instanceof ArrayBuffer) {
                    return "arraybuffer";
                }
            };

            /**
             * Throw an exception if the type is not supported.
             * @param {String} type the type to check.
             * @throws {Error} an Error if the browser doesn't support the requested type.
             */
            exports.checkSupport = function(type) {
                var supported = support[type.toLowerCase()];
                if (!supported) {
                    throw new Error(type + " is not supported by this platform");
                }
            };

            exports.MAX_VALUE_16BITS = 65535;
            exports.MAX_VALUE_32BITS = -1; // well, "\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF" is parsed as -1

            /**
             * Prettify a string read as binary.
             * @param {string} str the string to prettify.
             * @return {string} a pretty string.
             */
            exports.pretty = function(str) {
                var res = '',
                    code, i;
                for (i = 0; i < (str || "").length; i++) {
                    code = str.charCodeAt(i);
                    res += '\\x' + (code < 16 ? "0" : "") + code.toString(16).toUpperCase();
                }
                return res;
            };

            /**
             * Defer the call of a function.
             * @param {Function} callback the function to call asynchronously.
             * @param {Array} args the arguments to give to the callback.
             */
            exports.delay = function(callback, args, self) {
                setImmediate(function() {
                    callback.apply(self || null, args || []);
                });
            };

            /**
             * Extends a prototype with an other, without calling a constructor with
             * side effects. Inspired by nodejs' `utils.inherits`
             * @param {Function} ctor the constructor to augment
             * @param {Function} superCtor the parent constructor to use
             */
            exports.inherits = function(ctor, superCtor) {
                var Obj = function() {};
                Obj.prototype = superCtor.prototype;
                ctor.prototype = new Obj();
            };

            /**
             * Merge the objects passed as parameters into a new one.
             * @private
             * @param {...Object} var_args All objects to merge.
             * @return {Object} a new object with the data of the others.
             */
            exports.extend = function() {
                var result = {},
                    i, attr;
                for (i = 0; i < arguments.length; i++) { // arguments is not enumerable in some browsers
                    for (attr in arguments[i]) {
                        if (arguments[i].hasOwnProperty(attr) && typeof result[attr] === "undefined") {
                            result[attr] = arguments[i][attr];
                        }
                    }
                }
                return result;
            };

            /**
             * Transform arbitrary content into a Promise.
             * @param {String} name a name for the content being processed.
             * @param {Object} inputData the content to process.
             * @param {Boolean} isBinary true if the content is not an unicode string
             * @param {Boolean} isOptimizedBinaryString true if the string content only has one byte per character.
             * @param {Boolean} isBase64 true if the string content is encoded with base64.
             * @return {Promise} a promise in a format usable by JSZip.
             */
            exports.prepareContent = function(name, inputData, isBinary, isOptimizedBinaryString, isBase64) {

                // if inputData is already a promise, this flatten it.
                var promise = external.Promise.resolve(inputData).then(function(data) {


                    var isBlob = support.blob && (data instanceof Blob || ['[object File]', '[object Blob]'].indexOf(Object.prototype.toString.call(data)) !== -1);

                    if (isBlob && typeof FileReader !== "undefined") {
                        return new external.Promise(function(resolve, reject) {
                            var reader = new FileReader();

                            reader.onload = function(e) {
                                resolve(e.target.result);
                            };
                            reader.onerror = function(e) {
                                reject(e.target.error);
                            };
                            reader.readAsArrayBuffer(data);
                        });
                    } else {
                        return data;
                    }
                });

                return promise.then(function(data) {
                    var dataType = exports.getTypeOf(data);

                    if (!dataType) {
                        return external.Promise.reject(
                            new Error("The data of '" + name + "' is in an unsupported format !")
                        );
                    }
                    // special case : it's way easier to work with Uint8Array than with ArrayBuffer
                    if (dataType === "arraybuffer") {
                        data = exports.transformTo("uint8array", data);
                    } else if (dataType === "string") {
                        if (isBase64) {
                            data = base64.decode(data);
                        } else if (isBinary) {
                            // optimizedBinaryString === true means that the file has already been filtered with a 0xFF mask
                            if (isOptimizedBinaryString !== true) {
                                // this is a string, not in a base64 format.
                                // Be sure that this is a correct "binary string"
                                data = string2binary(data);
                            }
                        }
                    }
                    return data;
                });
            };

        }, {
            "./base64": 1,
            "./external": 6,
            "./nodejsUtils": 14,
            "./support": 30,
            "core-js/library/fn/set-immediate": 36
        }],
        33: [function(require, module, exports) {
            'use strict';
            var readerFor = require('./reader/readerFor');
            var utils = require('./utils');
            var sig = require('./signature');
            var ZipEntry = require('./zipEntry');
            var utf8 = require('./utf8');
            var support = require('./support');
            //  class ZipEntries {{{
            /**
             * All the entries in the zip file.
             * @constructor
             * @param {Object} loadOptions Options for loading the stream.
             */
            function ZipEntries(loadOptions) {
                this.files = [];
                this.loadOptions = loadOptions;
            }
            ZipEntries.prototype = {
                /**
                 * Check that the reader is on the speficied signature.
                 * @param {string} expectedSignature the expected signature.
                 * @throws {Error} if it is an other signature.
                 */
                checkSignature: function(expectedSignature) {
                    if (!this.reader.readAndCheckSignature(expectedSignature)) {
                        this.reader.index -= 4;
                        var signature = this.reader.readString(4);
                        throw new Error("Corrupted zip or bug: unexpected signature " + "(" + utils.pretty(signature) + ", expected " + utils.pretty(expectedSignature) + ")");
                    }
                },
                /**
                 * Check if the given signature is at the given index.
                 * @param {number} askedIndex the index to check.
                 * @param {string} expectedSignature the signature to expect.
                 * @return {boolean} true if the signature is here, false otherwise.
                 */
                isSignature: function(askedIndex, expectedSignature) {
                    var currentIndex = this.reader.index;
                    this.reader.setIndex(askedIndex);
                    var signature = this.reader.readString(4);
                    var result = signature === expectedSignature;
                    this.reader.setIndex(currentIndex);
                    return result;
                },
                /**
                 * Read the end of the central directory.
                 */
                readBlockEndOfCentral: function() {
                    this.diskNumber = this.reader.readInt(2);
                    this.diskWithCentralDirStart = this.reader.readInt(2);
                    this.centralDirRecordsOnThisDisk = this.reader.readInt(2);
                    this.centralDirRecords = this.reader.readInt(2);
                    this.centralDirSize = this.reader.readInt(4);
                    this.centralDirOffset = this.reader.readInt(4);

                    this.zipCommentLength = this.reader.readInt(2);
                    // warning : the encoding depends of the system locale
                    // On a linux machine with LANG=en_US.utf8, this field is utf8 encoded.
                    // On a windows machine, this field is encoded with the localized windows code page.
                    var zipComment = this.reader.readData(this.zipCommentLength);
                    var decodeParamType = support.uint8array ? "uint8array" : "array";
                    // To get consistent behavior with the generation part, we will assume that
                    // this is utf8 encoded unless specified otherwise.
                    var decodeContent = utils.transformTo(decodeParamType, zipComment);
                    this.zipComment = this.loadOptions.decodeFileName(decodeContent);
                },
                /**
                 * Read the end of the Zip 64 central directory.
                 * Not merged with the method readEndOfCentral :
                 * The end of central can coexist with its Zip64 brother,
                 * I don't want to read the wrong number of bytes !
                 */
                readBlockZip64EndOfCentral: function() {
                    this.zip64EndOfCentralSize = this.reader.readInt(8);
                    this.reader.skip(4);
                    // this.versionMadeBy = this.reader.readString(2);
                    // this.versionNeeded = this.reader.readInt(2);
                    this.diskNumber = this.reader.readInt(4);
                    this.diskWithCentralDirStart = this.reader.readInt(4);
                    this.centralDirRecordsOnThisDisk = this.reader.readInt(8);
                    this.centralDirRecords = this.reader.readInt(8);
                    this.centralDirSize = this.reader.readInt(8);
                    this.centralDirOffset = this.reader.readInt(8);

                    this.zip64ExtensibleData = {};
                    var extraDataSize = this.zip64EndOfCentralSize - 44,
                        index = 0,
                        extraFieldId,
                        extraFieldLength,
                        extraFieldValue;
                    while (index < extraDataSize) {
                        extraFieldId = this.reader.readInt(2);
                        extraFieldLength = this.reader.readInt(4);
                        extraFieldValue = this.reader.readData(extraFieldLength);
                        this.zip64ExtensibleData[extraFieldId] = {
                            id: extraFieldId,
                            length: extraFieldLength,
                            value: extraFieldValue
                        };
                    }
                },
                /**
                 * Read the end of the Zip 64 central directory locator.
                 */
                readBlockZip64EndOfCentralLocator: function() {
                    this.diskWithZip64CentralDirStart = this.reader.readInt(4);
                    this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8);
                    this.disksCount = this.reader.readInt(4);
                    if (this.disksCount > 1) {
                        throw new Error("Multi-volumes zip are not supported");
                    }
                },
                /**
                 * Read the local files, based on the offset read in the central part.
                 */
                readLocalFiles: function() {
                    var i, file;
                    for (i = 0; i < this.files.length; i++) {
                        file = this.files[i];
                        this.reader.setIndex(file.localHeaderOffset);
                        this.checkSignature(sig.LOCAL_FILE_HEADER);
                        file.readLocalPart(this.reader);
                        file.handleUTF8();
                        file.processAttributes();
                    }
                },
                /**
                 * Read the central directory.
                 */
                readCentralDir: function() {
                    var file;

                    this.reader.setIndex(this.centralDirOffset);
                    while (this.reader.readAndCheckSignature(sig.CENTRAL_FILE_HEADER)) {
                        file = new ZipEntry({
                            zip64: this.zip64
                        }, this.loadOptions);
                        file.readCentralPart(this.reader);
                        this.files.push(file);
                    }

                    if (this.centralDirRecords !== this.files.length) {
                        if (this.centralDirRecords !== 0 && this.files.length === 0) {
                            // We expected some records but couldn't find ANY.
                            // This is really suspicious, as if something went wrong.
                            throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
                        } else {
                            // We found some records but not all.
                            // Something is wrong but we got something for the user: no error here.
                            // console.warn("expected", this.centralDirRecords, "records in central dir, got", this.files.length);
                        }
                    }
                },
                /**
                 * Read the end of central directory.
                 */
                readEndOfCentral: function() {
                    var offset = this.reader.lastIndexOfSignature(sig.CENTRAL_DIRECTORY_END);
                    if (offset < 0) {
                        // Check if the content is a truncated zip or complete garbage.
                        // A "LOCAL_FILE_HEADER" is not required at the beginning (auto
                        // extractible zip for example) but it can give a good hint.
                        // If an ajax request was used without responseType, we will also
                        // get unreadable data.
                        var isGarbage = !this.isSignature(0, sig.LOCAL_FILE_HEADER);

                        if (isGarbage) {
                            throw new Error("Can't find end of central directory : is this a zip file ? " +
                                "If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html");
                        } else {
                            throw new Error("Corrupted zip: can't find end of central directory");
                        }

                    }
                    this.reader.setIndex(offset);
                    var endOfCentralDirOffset = offset;
                    this.checkSignature(sig.CENTRAL_DIRECTORY_END);
                    this.readBlockEndOfCentral();


                    /* extract from the zip spec :
                        4)  If one of the fields in the end of central directory
                            record is too small to hold required data, the field
                            should be set to -1 (0xFFFF or 0xFFFFFFFF) and the
                            ZIP64 format record should be created.
                        5)  The end of central directory record and the
                            Zip64 end of central directory locator record must
                            reside on the same disk when splitting or spanning
                            an archive.
                     */
                    if (this.diskNumber === utils.MAX_VALUE_16BITS || this.diskWithCentralDirStart === utils.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === utils.MAX_VALUE_16BITS || this.centralDirRecords === utils.MAX_VALUE_16BITS || this.centralDirSize === utils.MAX_VALUE_32BITS || this.centralDirOffset === utils.MAX_VALUE_32BITS) {
                        this.zip64 = true;

                        /*
                        Warning : the zip64 extension is supported, but ONLY if the 64bits integer read from
                        the zip file can fit into a 32bits integer. This cannot be solved : Javascript represents
                        all numbers as 64-bit double precision IEEE 754 floating point numbers.
                        So, we have 53bits for integers and bitwise operations treat everything as 32bits.
                        see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Bitwise_Operators
                        and http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-262.pdf section 8.5
                        */

                        // should look for a zip64 EOCD locator
                        offset = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
                        if (offset < 0) {
                            throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
                        }
                        this.reader.setIndex(offset);
                        this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_LOCATOR);
                        this.readBlockZip64EndOfCentralLocator();

                        // now the zip64 EOCD record
                        if (!this.isSignature(this.relativeOffsetEndOfZip64CentralDir, sig.ZIP64_CENTRAL_DIRECTORY_END)) {
                            // console.warn("ZIP64 end of central directory not where expected.");
                            this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
                            if (this.relativeOffsetEndOfZip64CentralDir < 0) {
                                throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
                            }
                        }
                        this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir);
                        this.checkSignature(sig.ZIP64_CENTRAL_DIRECTORY_END);
                        this.readBlockZip64EndOfCentral();
                    }

                    var expectedEndOfCentralDirOffset = this.centralDirOffset + this.centralDirSize;
                    if (this.zip64) {
                        expectedEndOfCentralDirOffset += 20; // end of central dir 64 locator
                        expectedEndOfCentralDirOffset += 12 /* should not include the leading 12 bytes */ + this.zip64EndOfCentralSize;
                    }

                    var extraBytes = endOfCentralDirOffset - expectedEndOfCentralDirOffset;

                    if (extraBytes > 0) {
                        // console.warn(extraBytes, "extra bytes at beginning or within zipfile");
                        if (this.isSignature(endOfCentralDirOffset, sig.CENTRAL_FILE_HEADER)) {
                            // The offsets seem wrong, but we have something at the specified offset.
                            // So… we keep it.
                        } else {
                            // the offset is wrong, update the "zero" of the reader
                            // this happens if data has been prepended (crx files for example)
                            this.reader.zero = extraBytes;
                        }
                    } else if (extraBytes < 0) {
                        throw new Error("Corrupted zip: missing " + Math.abs(extraBytes) + " bytes.");
                    }
                },
                prepareReader: function(data) {
                    this.reader = readerFor(data);
                },
                /**
                 * Read a zip file and create ZipEntries.
                 * @param {String|ArrayBuffer|Uint8Array|Buffer} data the binary string representing a zip file.
                 */
                load: function(data) {
                    this.prepareReader(data);
                    this.readEndOfCentral();
                    this.readCentralDir();
                    this.readLocalFiles();
                }
            };
            // }}} end of ZipEntries
            module.exports = ZipEntries;

        }, {
            "./reader/readerFor": 22,
            "./signature": 23,
            "./support": 30,
            "./utf8": 31,
            "./utils": 32,
            "./zipEntry": 34
        }],
        34: [function(require, module, exports) {
            'use strict';
            var readerFor = require('./reader/readerFor');
            var utils = require('./utils');
            var CompressedObject = require('./compressedObject');
            var crc32fn = require('./crc32');
            var utf8 = require('./utf8');
            var compressions = require('./compressions');
            var support = require('./support');

            var MADE_BY_DOS = 0x00;
            var MADE_BY_UNIX = 0x03;

            /**
             * Find a compression registered in JSZip.
             * @param {string} compressionMethod the method magic to find.
             * @return {Object|null} the JSZip compression object, null if none found.
             */
            var findCompression = function(compressionMethod) {
                for (var method in compressions) {
                    if (!compressions.hasOwnProperty(method)) {
                        continue;
                    }
                    if (compressions[method].magic === compressionMethod) {
                        return compressions[method];
                    }
                }
                return null;
            };

            // class ZipEntry {{{
            /**
             * An entry in the zip file.
             * @constructor
             * @param {Object} options Options of the current file.
             * @param {Object} loadOptions Options for loading the stream.
             */
            function ZipEntry(options, loadOptions) {
                this.options = options;
                this.loadOptions = loadOptions;
            }
            ZipEntry.prototype = {
                /**
                 * say if the file is encrypted.
                 * @return {boolean} true if the file is encrypted, false otherwise.
                 */
                isEncrypted: function() {
                    // bit 1 is set
                    return (this.bitFlag & 0x0001) === 0x0001;
                },
                /**
                 * say if the file has utf-8 filename/comment.
                 * @return {boolean} true if the filename/comment is in utf-8, false otherwise.
                 */
                useUTF8: function() {
                    // bit 11 is set
                    return (this.bitFlag & 0x0800) === 0x0800;
                },
                /**
                 * Read the local part of a zip file and add the info in this object.
                 * @param {DataReader} reader the reader to use.
                 */
                readLocalPart: function(reader) {
                    var compression, localExtraFieldsLength;

                    // we already know everything from the central dir !
                    // If the central dir data are false, we are doomed.
                    // On the bright side, the local part is scary  : zip64, data descriptors, both, etc.
                    // The less data we get here, the more reliable this should be.
                    // Let's skip the whole header and dash to the data !
                    reader.skip(22);
                    // in some zip created on windows, the filename stored in the central dir contains \ instead of /.
                    // Strangely, the filename here is OK.
                    // I would love to treat these zip files as corrupted (see http://www.info-zip.org/FAQ.html#backslashes
                    // or APPNOTE#4.4.17.1, "All slashes MUST be forward slashes '/'") but there are a lot of bad zip generators...
                    // Search "unzip mismatching "local" filename continuing with "central" filename version" on
                    // the internet.
                    //
                    // I think I see the logic here : the central directory is used to display
                    // content and the local directory is used to extract the files. Mixing / and \
                    // may be used to display \ to windows users and use / when extracting the files.
                    // Unfortunately, this lead also to some issues : http://seclists.org/fulldisclosure/2009/Sep/394
                    this.fileNameLength = reader.readInt(2);
                    localExtraFieldsLength = reader.readInt(2); // can't be sure this will be the same as the central dir
                    // the fileName is stored as binary data, the handleUTF8 method will take care of the encoding.
                    this.fileName = reader.readData(this.fileNameLength);
                    reader.skip(localExtraFieldsLength);

                    if (this.compressedSize === -1 || this.uncompressedSize === -1) {
                        throw new Error("Bug or corrupted zip : didn't get enough informations from the central directory " + "(compressedSize === -1 || uncompressedSize === -1)");
                    }

                    compression = findCompression(this.compressionMethod);
                    if (compression === null) { // no compression found
                        throw new Error("Corrupted zip : compression " + utils.pretty(this.compressionMethod) + " unknown (inner file : " + utils.transformTo("string", this.fileName) + ")");
                    }
                    this.decompressed = new CompressedObject(this.compressedSize, this.uncompressedSize, this.crc32, compression, reader.readData(this.compressedSize));
                },

                /**
                 * Read the central part of a zip file and add the info in this object.
                 * @param {DataReader} reader the reader to use.
                 */
                readCentralPart: function(reader) {
                    this.versionMadeBy = reader.readInt(2);
                    reader.skip(2);
                    // this.versionNeeded = reader.readInt(2);
                    this.bitFlag = reader.readInt(2);
                    this.compressionMethod = reader.readString(2);
                    this.date = reader.readDate();
                    this.crc32 = reader.readInt(4);
                    this.compressedSize = reader.readInt(4);
                    this.uncompressedSize = reader.readInt(4);
                    var fileNameLength = reader.readInt(2);
                    this.extraFieldsLength = reader.readInt(2);
                    this.fileCommentLength = reader.readInt(2);
                    this.diskNumberStart = reader.readInt(2);
                    this.internalFileAttributes = reader.readInt(2);
                    this.externalFileAttributes = reader.readInt(4);
                    this.localHeaderOffset = reader.readInt(4);

                    if (this.isEncrypted()) {
                        throw new Error("Encrypted zip are not supported");
                    }

                    // will be read in the local part, see the comments there
                    reader.skip(fileNameLength);
                    this.readExtraFields(reader);
                    this.parseZIP64ExtraField(reader);
                    this.fileComment = reader.readData(this.fileCommentLength);
                },

                /**
                 * Parse the external file attributes and get the unix/dos permissions.
                 */
                processAttributes: function() {
                    this.unixPermissions = null;
                    this.dosPermissions = null;
                    var madeBy = this.versionMadeBy >> 8;

                    // Check if we have the DOS directory flag set.
                    // We look for it in the DOS and UNIX permissions
                    // but some unknown platform could set it as a compatibility flag.
                    this.dir = this.externalFileAttributes & 0x0010 ? true : false;

                    if (madeBy === MADE_BY_DOS) {
                        // first 6 bits (0 to 5)
                        this.dosPermissions = this.externalFileAttributes & 0x3F;
                    }

                    if (madeBy === MADE_BY_UNIX) {
                        this.unixPermissions = (this.externalFileAttributes >> 16) & 0xFFFF;
                        // the octal permissions are in (this.unixPermissions & 0x01FF).toString(8);
                    }

                    // fail safe : if the name ends with a / it probably means a folder
                    if (!this.dir && this.fileNameStr.slice(-1) === '/') {
                        this.dir = true;
                    }
                },

                /**
                 * Parse the ZIP64 extra field and merge the info in the current ZipEntry.
                 * @param {DataReader} reader the reader to use.
                 */
                parseZIP64ExtraField: function(reader) {

                    if (!this.extraFields[0x0001]) {
                        return;
                    }

                    // should be something, preparing the extra reader
                    var extraReader = readerFor(this.extraFields[0x0001].value);

                    // I really hope that these 64bits integer can fit in 32 bits integer, because js
                    // won't let us have more.
                    if (this.uncompressedSize === utils.MAX_VALUE_32BITS) {
                        this.uncompressedSize = extraReader.readInt(8);
                    }
                    if (this.compressedSize === utils.MAX_VALUE_32BITS) {
                        this.compressedSize = extraReader.readInt(8);
                    }
                    if (this.localHeaderOffset === utils.MAX_VALUE_32BITS) {
                        this.localHeaderOffset = extraReader.readInt(8);
                    }
                    if (this.diskNumberStart === utils.MAX_VALUE_32BITS) {
                        this.diskNumberStart = extraReader.readInt(4);
                    }
                },
                /**
                 * Read the central part of a zip file and add the info in this object.
                 * @param {DataReader} reader the reader to use.
                 */
                readExtraFields: function(reader) {
                    var end = reader.index + this.extraFieldsLength,
                        extraFieldId,
                        extraFieldLength,
                        extraFieldValue;

                    if (!this.extraFields) {
                        this.extraFields = {};
                    }

                    while (reader.index < end) {
                        extraFieldId = reader.readInt(2);
                        extraFieldLength = reader.readInt(2);
                        extraFieldValue = reader.readData(extraFieldLength);

                        this.extraFields[extraFieldId] = {
                            id: extraFieldId,
                            length: extraFieldLength,
                            value: extraFieldValue
                        };
                    }
                },
                /**
                 * Apply an UTF8 transformation if needed.
                 */
                handleUTF8: function() {
                    var decodeParamType = support.uint8array ? "uint8array" : "array";
                    if (this.useUTF8()) {
                        this.fileNameStr = utf8.utf8decode(this.fileName);
                        this.fileCommentStr = utf8.utf8decode(this.fileComment);
                    } else {
                        var upath = this.findExtraFieldUnicodePath();
                        if (upath !== null) {
                            this.fileNameStr = upath;
                        } else {
                            // ASCII text or unsupported code page
                            var fileNameByteArray = utils.transformTo(decodeParamType, this.fileName);
                            this.fileNameStr = this.loadOptions.decodeFileName(fileNameByteArray);
                        }

                        var ucomment = this.findExtraFieldUnicodeComment();
                        if (ucomment !== null) {
                            this.fileCommentStr = ucomment;
                        } else {
                            // ASCII text or unsupported code page
                            var commentByteArray = utils.transformTo(decodeParamType, this.fileComment);
                            this.fileCommentStr = this.loadOptions.decodeFileName(commentByteArray);
                        }
                    }
                },

                /**
                 * Find the unicode path declared in the extra field, if any.
                 * @return {String} the unicode path, null otherwise.
                 */
                findExtraFieldUnicodePath: function() {
                    var upathField = this.extraFields[0x7075];
                    if (upathField) {
                        var extraReader = readerFor(upathField.value);

                        // wrong version
                        if (extraReader.readInt(1) !== 1) {
                            return null;
                        }

                        // the crc of the filename changed, this field is out of date.
                        if (crc32fn(this.fileName) !== extraReader.readInt(4)) {
                            return null;
                        }

                        return utf8.utf8decode(extraReader.readData(upathField.length - 5));
                    }
                    return null;
                },

                /**
                 * Find the unicode comment declared in the extra field, if any.
                 * @return {String} the unicode comment, null otherwise.
                 */
                findExtraFieldUnicodeComment: function() {
                    var ucommentField = this.extraFields[0x6375];
                    if (ucommentField) {
                        var extraReader = readerFor(ucommentField.value);

                        // wrong version
                        if (extraReader.readInt(1) !== 1) {
                            return null;
                        }

                        // the crc of the comment changed, this field is out of date.
                        if (crc32fn(this.fileComment) !== extraReader.readInt(4)) {
                            return null;
                        }

                        return utf8.utf8decode(extraReader.readData(ucommentField.length - 5));
                    }
                    return null;
                }
            };
            module.exports = ZipEntry;

        }, {
            "./compressedObject": 2,
            "./compressions": 3,
            "./crc32": 4,
            "./reader/readerFor": 22,
            "./support": 30,
            "./utf8": 31,
            "./utils": 32
        }],
        35: [function(require, module, exports) {
            'use strict';

            var StreamHelper = require('./stream/StreamHelper');
            var DataWorker = require('./stream/DataWorker');
            var utf8 = require('./utf8');
            var CompressedObject = require('./compressedObject');
            var GenericWorker = require('./stream/GenericWorker');

            /**
             * A simple object representing a file in the zip file.
             * @constructor
             * @param {string} name the name of the file
             * @param {String|ArrayBuffer|Uint8Array|Buffer} data the data
             * @param {Object} options the options of the file
             */
            var ZipObject = function(name, data, options) {
                this.name = name;
                this.dir = options.dir;
                this.date = options.date;
                this.comment = options.comment;
                this.unixPermissions = options.unixPermissions;
                this.dosPermissions = options.dosPermissions;

                this._data = data;
                this._dataBinary = options.binary;
                // keep only the compression
                this.options = {
                    compression: options.compression,
                    compressionOptions: options.compressionOptions
                };
            };

            ZipObject.prototype = {
                /**
                 * Create an internal stream for the content of this object.
                 * @param {String} type the type of each chunk.
                 * @return StreamHelper the stream.
                 */
                internalStream: function(type) {
                    var outputType = type.toLowerCase();
                    var askUnicodeString = outputType === "string" || outputType === "text";
                    if (outputType === "binarystring" || outputType === "text") {
                        outputType = "string";
                    }
                    var result = this._decompressWorker();

                    var isUnicodeString = !this._dataBinary;

                    if (isUnicodeString && !askUnicodeString) {
                        result = result.pipe(new utf8.Utf8EncodeWorker());
                    }
                    if (!isUnicodeString && askUnicodeString) {
                        result = result.pipe(new utf8.Utf8DecodeWorker());
                    }

                    return new StreamHelper(result, outputType, "");
                },

                /**
                 * Prepare the content in the asked type.
                 * @param {String} type the type of the result.
                 * @param {Function} onUpdate a function to call on each internal update.
                 * @return Promise the promise of the result.
                 */
                async: function(type, onUpdate) {
                    return this.internalStream(type).accumulate(onUpdate);
                },

                /**
                 * Prepare the content as a nodejs stream.
                 * @param {String} type the type of each chunk.
                 * @param {Function} onUpdate a function to call on each internal update.
                 * @return Stream the stream.
                 */
                nodeStream: function(type, onUpdate) {
                    return this.internalStream(type || "nodebuffer").toNodejsStream(onUpdate);
                },

                /**
                 * Return a worker for the compressed content.
                 * @private
                 * @param {Object} compression the compression object to use.
                 * @param {Object} compressionOptions the options to use when compressing.
                 * @return Worker the worker.
                 */
                _compressWorker: function(compression, compressionOptions) {
                    if (
                        this._data instanceof CompressedObject &&
                        this._data.compression.magic === compression.magic
                    ) {
                        return this._data.getCompressedWorker();
                    } else {
                        var result = this._decompressWorker();
                        if (!this._dataBinary) {
                            result = result.pipe(new utf8.Utf8EncodeWorker());
                        }
                        return CompressedObject.createWorkerFrom(result, compression, compressionOptions);
                    }
                },
                /**
                 * Return a worker for the decompressed content.
                 * @private
                 * @return Worker the worker.
                 */
                _decompressWorker: function() {
                    if (this._data instanceof CompressedObject) {
                        return this._data.getContentWorker();
                    } else if (this._data instanceof GenericWorker) {
                        return this._data;
                    } else {
                        return new DataWorker(this._data);
                    }
                }
            };

            var removedMethods = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"];
            var removedFn = function() {
                throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
            };

            for (var i = 0; i < removedMethods.length; i++) {
                ZipObject.prototype[removedMethods[i]] = removedFn;
            }
            module.exports = ZipObject;

        }, {
            "./compressedObject": 2,
            "./stream/DataWorker": 27,
            "./stream/GenericWorker": 28,
            "./stream/StreamHelper": 29,
            "./utf8": 31
        }],
        36: [function(require, module, exports) {
            require('../modules/web.immediate');
            module.exports = require('../modules/_core').setImmediate;
        }, {
            "../modules/_core": 40,
            "../modules/web.immediate": 56
        }],
        37: [function(require, module, exports) {
            module.exports = function(it) {
                if (typeof it != 'function') throw TypeError(it + ' is not a function!');
                return it;
            };
        }, {}],
        38: [function(require, module, exports) {
            var isObject = require('./_is-object');
            module.exports = function(it) {
                if (!isObject(it)) throw TypeError(it + ' is not an object!');
                return it;
            };
        }, {
            "./_is-object": 51
        }],
        39: [function(require, module, exports) {
            var toString = {}.toString;

            module.exports = function(it) {
                return toString.call(it).slice(8, -1);
            };
        }, {}],
        40: [function(require, module, exports) {
            var core = module.exports = {
                version: '2.3.0'
            };
            if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
        }, {}],
        41: [function(require, module, exports) {
            // optional / simple context binding
            var aFunction = require('./_a-function');
            module.exports = function(fn, that, length) {
                aFunction(fn);
                if (that === undefined) return fn;
                switch (length) {
                    case 1:
                        return function(a) {
                            return fn.call(that, a);
                        };
                    case 2:
                        return function(a, b) {
                            return fn.call(that, a, b);
                        };
                    case 3:
                        return function(a, b, c) {
                            return fn.call(that, a, b, c);
                        };
                }
                return function( /* ...args */ ) {
                    return fn.apply(that, arguments);
                };
            };
        }, {
            "./_a-function": 37
        }],
        42: [function(require, module, exports) {
            // Thank's IE8 for his funny defineProperty
            module.exports = !require('./_fails')(function() {
                return Object.defineProperty({}, 'a', {
                    get: function() {
                        return 7;
                    }
                }).a != 7;
            });
        }, {
            "./_fails": 45
        }],
        43: [function(require, module, exports) {
            var isObject = require('./_is-object'),
                document = require('./_global').document
                // in old IE typeof document.createElement is 'object'
                ,
                is = isObject(document) && isObject(document.createElement);
            module.exports = function(it) {
                return is ? document.createElement(it) : {};
            };
        }, {
            "./_global": 46,
            "./_is-object": 51
        }],
        44: [function(require, module, exports) {
            var global = require('./_global'),
                core = require('./_core'),
                ctx = require('./_ctx'),
                hide = require('./_hide'),
                PROTOTYPE = 'prototype';

            var $export = function(type, name, source) {
                var IS_FORCED = type & $export.F,
                    IS_GLOBAL = type & $export.G,
                    IS_STATIC = type & $export.S,
                    IS_PROTO = type & $export.P,
                    IS_BIND = type & $export.B,
                    IS_WRAP = type & $export.W,
                    exports = IS_GLOBAL ? core : core[name] || (core[name] = {}),
                    expProto = exports[PROTOTYPE],
                    target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE],
                    key, own, out;
                if (IS_GLOBAL) source = name;
                for (key in source) {
                    // contains in native
                    own = !IS_FORCED && target && target[key] !== undefined;
                    if (own && key in exports) continue;
                    // export native or passed
                    out = own ? target[key] : source[key];
                    // prevent global pollution for namespaces
                    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
                        // bind timers to global for call from export context
                        :
                        IS_BIND && own ? ctx(out, global)
                        // wrap global constructors for prevent change them in library
                        :
                        IS_WRAP && target[key] == out ? (function(C) {
                            var F = function(a, b, c) {
                                if (this instanceof C) {
                                    switch (arguments.length) {
                                        case 0:
                                            return new C;
                                        case 1:
                                            return new C(a);
                                        case 2:
                                            return new C(a, b);
                                    }
                                    return new C(a, b, c);
                                }
                                return C.apply(this, arguments);
                            };
                            F[PROTOTYPE] = C[PROTOTYPE];
                            return F;
                            // make static versions for prototype methods
                        })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
                    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
                    if (IS_PROTO) {
                        (exports.virtual || (exports.virtual = {}))[key] = out;
                        // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
                        if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
                    }
                }
            };
            // type bitmap
            $export.F = 1; // forced
            $export.G = 2; // global
            $export.S = 4; // static
            $export.P = 8; // proto
            $export.B = 16; // bind
            $export.W = 32; // wrap
            $export.U = 64; // safe
            $export.R = 128; // real proto method for `library` 
            module.exports = $export;
        }, {
            "./_core": 40,
            "./_ctx": 41,
            "./_global": 46,
            "./_hide": 47
        }],
        45: [function(require, module, exports) {
            module.exports = function(exec) {
                try {
                    return !!exec();
                } catch (e) {
                    return true;
                }
            };
        }, {}],
        46: [function(require, module, exports) {
            // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
            var global = module.exports = typeof window != 'undefined' && window.Math == Math ?
                window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
            if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
        }, {}],
        47: [function(require, module, exports) {
            var dP = require('./_object-dp'),
                createDesc = require('./_property-desc');
            module.exports = require('./_descriptors') ? function(object, key, value) {
                return dP.f(object, key, createDesc(1, value));
            } : function(object, key, value) {
                object[key] = value;
                return object;
            };
        }, {
            "./_descriptors": 42,
            "./_object-dp": 52,
            "./_property-desc": 53
        }],
        48: [function(require, module, exports) {
            module.exports = require('./_global').document && document.documentElement;
        }, {
            "./_global": 46
        }],
        49: [function(require, module, exports) {
            module.exports = !require('./_descriptors') && !require('./_fails')(function() {
                return Object.defineProperty(require('./_dom-create')('div'), 'a', {
                    get: function() {
                        return 7;
                    }
                }).a != 7;
            });
        }, {
            "./_descriptors": 42,
            "./_dom-create": 43,
            "./_fails": 45
        }],
        50: [function(require, module, exports) {
            // fast apply, http://jsperf.lnkit.com/fast-apply/5
            module.exports = function(fn, args, that) {
                var un = that === undefined;
                switch (args.length) {
                    case 0:
                        return un ? fn() :
                            fn.call(that);
                    case 1:
                        return un ? fn(args[0]) :
                            fn.call(that, args[0]);
                    case 2:
                        return un ? fn(args[0], args[1]) :
                            fn.call(that, args[0], args[1]);
                    case 3:
                        return un ? fn(args[0], args[1], args[2]) :
                            fn.call(that, args[0], args[1], args[2]);
                    case 4:
                        return un ? fn(args[0], args[1], args[2], args[3]) :
                            fn.call(that, args[0], args[1], args[2], args[3]);
                }
                return fn.apply(that, args);
            };
        }, {}],
        51: [function(require, module, exports) {
            module.exports = function(it) {
                return typeof it === 'object' ? it !== null : typeof it === 'function';
            };
        }, {}],
        52: [function(require, module, exports) {
            var anObject = require('./_an-object'),
                IE8_DOM_DEFINE = require('./_ie8-dom-define'),
                toPrimitive = require('./_to-primitive'),
                dP = Object.defineProperty;

            exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes) {
                anObject(O);
                P = toPrimitive(P, true);
                anObject(Attributes);
                if (IE8_DOM_DEFINE) try {
                    return dP(O, P, Attributes);
                } catch (e) { /* empty */ }
                if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
                if ('value' in Attributes) O[P] = Attributes.value;
                return O;
            };
        }, {
            "./_an-object": 38,
            "./_descriptors": 42,
            "./_ie8-dom-define": 49,
            "./_to-primitive": 55
        }],
        53: [function(require, module, exports) {
            module.exports = function(bitmap, value) {
                return {
                    enumerable: !(bitmap & 1),
                    configurable: !(bitmap & 2),
                    writable: !(bitmap & 4),
                    value: value
                };
            };
        }, {}],
        54: [function(require, module, exports) {
            var ctx = require('./_ctx'),
                invoke = require('./_invoke'),
                html = require('./_html'),
                cel = require('./_dom-create'),
                global = require('./_global'),
                process = global.process,
                setTask = global.setImmediate,
                clearTask = global.clearImmediate,
                MessageChannel = global.MessageChannel,
                counter = 0,
                queue = {},
                ONREADYSTATECHANGE = 'onreadystatechange',
                defer, channel, port;
            var run = function() {
                var id = +this;
                if (queue.hasOwnProperty(id)) {
                    var fn = queue[id];
                    delete queue[id];
                    fn();
                }
            };
            var listener = function(event) {
                run.call(event.data);
            };
            // Node.js 0.9+ & IE10+ has setImmediate, otherwise:
            if (!setTask || !clearTask) {
                setTask = function setImmediate(fn) {
                    var args = [],
                        i = 1;
                    while (arguments.length > i) args.push(arguments[i++]);
                    queue[++counter] = function() {
                        invoke(typeof fn == 'function' ? fn : Function(fn), args);
                    };
                    defer(counter);
                    return counter;
                };
                clearTask = function clearImmediate(id) {
                    delete queue[id];
                };
                // Node.js 0.8-
                if (require('./_cof')(process) == 'process') {
                    defer = function(id) {
                        process.nextTick(ctx(run, id, 1));
                    };
                    // Browsers with MessageChannel, includes WebWorkers
                } else if (MessageChannel) {
                    channel = new MessageChannel;
                    port = channel.port2;
                    channel.port1.onmessage = listener;
                    defer = ctx(port.postMessage, port, 1);
                    // Browsers with postMessage, skip WebWorkers
                    // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
                } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
                    defer = function(id) {
                        global.postMessage(id + '', '*');
                    };
                    global.addEventListener('message', listener, false);
                    // IE8-
                } else if (ONREADYSTATECHANGE in cel('script')) {
                    defer = function(id) {
                        html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function() {
                            html.removeChild(this);
                            run.call(id);
                        };
                    };
                    // Rest old browsers
                } else {
                    defer = function(id) {
                        setTimeout(ctx(run, id, 1), 0);
                    };
                }
            }
            module.exports = {
                set: setTask,
                clear: clearTask
            };
        }, {
            "./_cof": 39,
            "./_ctx": 41,
            "./_dom-create": 43,
            "./_global": 46,
            "./_html": 48,
            "./_invoke": 50
        }],
        55: [function(require, module, exports) {
            // 7.1.1 ToPrimitive(input [, PreferredType])
            var isObject = require('./_is-object');
            // instead of the ES6 spec version, we didn't implement @@toPrimitive case
            // and the second argument - flag - preferred type is a string
            module.exports = function(it, S) {
                if (!isObject(it)) return it;
                var fn, val;
                if (S && typeof(fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
                if (typeof(fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
                if (!S && typeof(fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
                throw TypeError("Can't convert object to primitive value");
            };
        }, {
            "./_is-object": 51
        }],
        56: [function(require, module, exports) {
            var $export = require('./_export'),
                $task = require('./_task');
            $export($export.G + $export.B, {
                setImmediate: $task.set,
                clearImmediate: $task.clear
            });
        }, {
            "./_export": 44,
            "./_task": 54
        }],
        57: [function(require, module, exports) {
            (function(global) {
                'use strict';
                var Mutation = global.MutationObserver || global.WebKitMutationObserver;

                var scheduleDrain;

                {
                    if (Mutation) {
                        var called = 0;
                        var observer = new Mutation(nextTick);
                        var element = global.document.createTextNode('');
                        observer.observe(element, {
                            characterData: true
                        });
                        scheduleDrain = function() {
                            element.data = (called = ++called % 2);
                        };
                    } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
                        var channel = new global.MessageChannel();
                        channel.port1.onmessage = nextTick;
                        scheduleDrain = function() {
                            channel.port2.postMessage(0);
                        };
                    } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
                        scheduleDrain = function() {

                            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
                            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
                            var scriptEl = global.document.createElement('script');
                            scriptEl.onreadystatechange = function() {
                                nextTick();

                                scriptEl.onreadystatechange = null;
                                scriptEl.parentNode.removeChild(scriptEl);
                                scriptEl = null;
                            };
                            global.document.documentElement.appendChild(scriptEl);
                        };
                    } else {
                        scheduleDrain = function() {
                            setTimeout(nextTick, 0);
                        };
                    }
                }

                var draining;
                var queue = [];
                //named nextTick for less confusing stack traces
                function nextTick() {
                    draining = true;
                    var i, oldQueue;
                    var len = queue.length;
                    while (len) {
                        oldQueue = queue;
                        queue = [];
                        i = -1;
                        while (++i < len) {
                            oldQueue[i]();
                        }
                        len = queue.length;
                    }
                    draining = false;
                }

                module.exports = immediate;

                function immediate(task) {
                    if (queue.push(task) === 1 && !draining) {
                        scheduleDrain();
                    }
                }

            }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
        }, {}],
        58: [function(require, module, exports) {
            'use strict';
            var immediate = require('immediate');

            /* istanbul ignore next */
            function INTERNAL() {}

            var handlers = {};

            var REJECTED = ['REJECTED'];
            var FULFILLED = ['FULFILLED'];
            var PENDING = ['PENDING'];

            module.exports = Promise;

            function Promise(resolver) {
                if (typeof resolver !== 'function') {
                    throw new TypeError('resolver must be a function');
                }
                this.state = PENDING;
                this.queue = [];
                this.outcome = void 0;
                if (resolver !== INTERNAL) {
                    safelyResolveThenable(this, resolver);
                }
            }

            Promise.prototype["catch"] = function(onRejected) {
                return this.then(null, onRejected);
            };
            Promise.prototype.then = function(onFulfilled, onRejected) {
                if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
                    typeof onRejected !== 'function' && this.state === REJECTED) {
                    return this;
                }
                var promise = new this.constructor(INTERNAL);
                if (this.state !== PENDING) {
                    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
                    unwrap(promise, resolver, this.outcome);
                } else {
                    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
                }

                return promise;
            };

            function QueueItem(promise, onFulfilled, onRejected) {
                this.promise = promise;
                if (typeof onFulfilled === 'function') {
                    this.onFulfilled = onFulfilled;
                    this.callFulfilled = this.otherCallFulfilled;
                }
                if (typeof onRejected === 'function') {
                    this.onRejected = onRejected;
                    this.callRejected = this.otherCallRejected;
                }
            }
            QueueItem.prototype.callFulfilled = function(value) {
                handlers.resolve(this.promise, value);
            };
            QueueItem.prototype.otherCallFulfilled = function(value) {
                unwrap(this.promise, this.onFulfilled, value);
            };
            QueueItem.prototype.callRejected = function(value) {
                handlers.reject(this.promise, value);
            };
            QueueItem.prototype.otherCallRejected = function(value) {
                unwrap(this.promise, this.onRejected, value);
            };

            function unwrap(promise, func, value) {
                immediate(function() {
                    var returnValue;
                    try {
                        returnValue = func(value);
                    } catch (e) {
                        return handlers.reject(promise, e);
                    }
                    if (returnValue === promise) {
                        handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
                    } else {
                        handlers.resolve(promise, returnValue);
                    }
                });
            }

            handlers.resolve = function(self, value) {
                var result = tryCatch(getThen, value);
                if (result.status === 'error') {
                    return handlers.reject(self, result.value);
                }
                var thenable = result.value;

                if (thenable) {
                    safelyResolveThenable(self, thenable);
                } else {
                    self.state = FULFILLED;
                    self.outcome = value;
                    var i = -1;
                    var len = self.queue.length;
                    while (++i < len) {
                        self.queue[i].callFulfilled(value);
                    }
                }
                return self;
            };
            handlers.reject = function(self, error) {
                self.state = REJECTED;
                self.outcome = error;
                var i = -1;
                var len = self.queue.length;
                while (++i < len) {
                    self.queue[i].callRejected(error);
                }
                return self;
            };

            function getThen(obj) {
                // Make sure we only access the accessor once as required by the spec
                var then = obj && obj.then;
                if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
                    return function appyThen() {
                        then.apply(obj, arguments);
                    };
                }
            }

            function safelyResolveThenable(self, thenable) {
                // Either fulfill, reject or reject with error
                var called = false;

                function onError(value) {
                    if (called) {
                        return;
                    }
                    called = true;
                    handlers.reject(self, value);
                }

                function onSuccess(value) {
                    if (called) {
                        return;
                    }
                    called = true;
                    handlers.resolve(self, value);
                }

                function tryToUnwrap() {
                    thenable(onSuccess, onError);
                }

                var result = tryCatch(tryToUnwrap);
                if (result.status === 'error') {
                    onError(result.value);
                }
            }

            function tryCatch(func, value) {
                var out = {};
                try {
                    out.value = func(value);
                    out.status = 'success';
                } catch (e) {
                    out.status = 'error';
                    out.value = e;
                }
                return out;
            }

            Promise.resolve = resolve;

            function resolve(value) {
                if (value instanceof this) {
                    return value;
                }
                return handlers.resolve(new this(INTERNAL), value);
            }

            Promise.reject = reject;

            function reject(reason) {
                var promise = new this(INTERNAL);
                return handlers.reject(promise, reason);
            }

            Promise.all = all;

            function all(iterable) {
                var self = this;
                if (Object.prototype.toString.call(iterable) !== '[object Array]') {
                    return this.reject(new TypeError('must be an array'));
                }

                var len = iterable.length;
                var called = false;
                if (!len) {
                    return this.resolve([]);
                }

                var values = new Array(len);
                var resolved = 0;
                var i = -1;
                var promise = new this(INTERNAL);

                while (++i < len) {
                    allResolver(iterable[i], i);
                }
                return promise;

                function allResolver(value, i) {
                    self.resolve(value).then(resolveFromAll, function(error) {
                        if (!called) {
                            called = true;
                            handlers.reject(promise, error);
                        }
                    });

                    function resolveFromAll(outValue) {
                        values[i] = outValue;
                        if (++resolved === len && !called) {
                            called = true;
                            handlers.resolve(promise, values);
                        }
                    }
                }
            }

            Promise.race = race;

            function race(iterable) {
                var self = this;
                if (Object.prototype.toString.call(iterable) !== '[object Array]') {
                    return this.reject(new TypeError('must be an array'));
                }

                var len = iterable.length;
                var called = false;
                if (!len) {
                    return this.resolve([]);
                }

                var i = -1;
                var promise = new this(INTERNAL);

                while (++i < len) {
                    resolver(iterable[i]);
                }
                return promise;

                function resolver(value) {
                    self.resolve(value).then(function(response) {
                        if (!called) {
                            called = true;
                            handlers.resolve(promise, response);
                        }
                    }, function(error) {
                        if (!called) {
                            called = true;
                            handlers.reject(promise, error);
                        }
                    });
                }
            }

        }, {
            "immediate": 57
        }],
        59: [function(require, module, exports) {
            // Top level file is just a mixin of submodules & constants
            'use strict';

            var assign = require('./lib/utils/common').assign;

            var deflate = require('./lib/deflate');
            var inflate = require('./lib/inflate');
            var constants = require('./lib/zlib/constants');

            var pako = {};

            assign(pako, deflate, inflate, constants);

            module.exports = pako;

        }, {
            "./lib/deflate": 60,
            "./lib/inflate": 61,
            "./lib/utils/common": 62,
            "./lib/zlib/constants": 65
        }],
        60: [function(require, module, exports) {
            'use strict';


            var zlib_deflate = require('./zlib/deflate');
            var utils = require('./utils/common');
            var strings = require('./utils/strings');
            var msg = require('./zlib/messages');
            var ZStream = require('./zlib/zstream');

            var toString = Object.prototype.toString;

            /* Public constants ==========================================================*/
            /* ===========================================================================*/

            var Z_NO_FLUSH = 0;
            var Z_FINISH = 4;

            var Z_OK = 0;
            var Z_STREAM_END = 1;
            var Z_SYNC_FLUSH = 2;

            var Z_DEFAULT_COMPRESSION = -1;

            var Z_DEFAULT_STRATEGY = 0;

            var Z_DEFLATED = 8;

            /* ===========================================================================*/


            /**
             * class Deflate
             *
             * Generic JS-style wrapper for zlib calls. If you don't need
             * streaming behaviour - use more simple functions: [[deflate]],
             * [[deflateRaw]] and [[gzip]].
             **/

            /* internal
             * Deflate.chunks -> Array
             *
             * Chunks of output data, if [[Deflate#onData]] not overriden.
             **/

            /**
             * Deflate.result -> Uint8Array|Array
             *
             * Compressed result, generated by default [[Deflate#onData]]
             * and [[Deflate#onEnd]] handlers. Filled after you push last chunk
             * (call [[Deflate#push]] with `Z_FINISH` / `true` param)  or if you
             * push a chunk with explicit flush (call [[Deflate#push]] with
             * `Z_SYNC_FLUSH` param).
             **/

            /**
             * Deflate.err -> Number
             *
             * Error code after deflate finished. 0 (Z_OK) on success.
             * You will not need it in real life, because deflate errors
             * are possible only on wrong options or bad `onData` / `onEnd`
             * custom handlers.
             **/

            /**
             * Deflate.msg -> String
             *
             * Error message, if [[Deflate.err]] != 0
             **/


            /**
             * new Deflate(options)
             * - options (Object): zlib deflate options.
             *
             * Creates new deflator instance with specified params. Throws exception
             * on bad params. Supported options:
             *
             * - `level`
             * - `windowBits`
             * - `memLevel`
             * - `strategy`
             * - `dictionary`
             *
             * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
             * for more information on these.
             *
             * Additional options, for internal needs:
             *
             * - `chunkSize` - size of generated data chunks (16K by default)
             * - `raw` (Boolean) - do raw deflate
             * - `gzip` (Boolean) - create gzip wrapper
             * - `to` (String) - if equal to 'string', then result will be "binary string"
             *    (each char code [0..255])
             * - `header` (Object) - custom header for gzip
             *   - `text` (Boolean) - true if compressed data believed to be text
             *   - `time` (Number) - modification time, unix timestamp
             *   - `os` (Number) - operation system code
             *   - `extra` (Array) - array of bytes with extra data (max 65536)
             *   - `name` (String) - file name (binary string)
             *   - `comment` (String) - comment (binary string)
             *   - `hcrc` (Boolean) - true if header crc should be added
             *
             * ##### Example:
             *
             * ```javascript
             * var pako = require('pako')
             *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
             *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
             *
             * var deflate = new pako.Deflate({ level: 3});
             *
             * deflate.push(chunk1, false);
             * deflate.push(chunk2, true);  // true -> last chunk
             *
             * if (deflate.err) { throw new Error(deflate.err); }
             *
             * console.log(deflate.result);
             * ```
             **/
            function Deflate(options) {
                if (!(this instanceof Deflate)) return new Deflate(options);

                this.options = utils.assign({
                    level: Z_DEFAULT_COMPRESSION,
                    method: Z_DEFLATED,
                    chunkSize: 16384,
                    windowBits: 15,
                    memLevel: 8,
                    strategy: Z_DEFAULT_STRATEGY,
                    to: ''
                }, options || {});

                var opt = this.options;

                if (opt.raw && (opt.windowBits > 0)) {
                    opt.windowBits = -opt.windowBits;
                } else if (opt.gzip && (opt.windowBits > 0) && (opt.windowBits < 16)) {
                    opt.windowBits += 16;
                }

                this.err = 0; // error code, if happens (0 = Z_OK)
                this.msg = ''; // error message
                this.ended = false; // used to avoid multiple onEnd() calls
                this.chunks = []; // chunks of compressed data

                this.strm = new ZStream();
                this.strm.avail_out = 0;

                var status = zlib_deflate.deflateInit2(
                    this.strm,
                    opt.level,
                    opt.method,
                    opt.windowBits,
                    opt.memLevel,
                    opt.strategy
                );

                if (status !== Z_OK) {
                    throw new Error(msg[status]);
                }

                if (opt.header) {
                    zlib_deflate.deflateSetHeader(this.strm, opt.header);
                }

                if (opt.dictionary) {
                    var dict;
                    // Convert data if needed
                    if (typeof opt.dictionary === 'string') {
                        // If we need to compress text, change encoding to utf8.
                        dict = strings.string2buf(opt.dictionary);
                    } else if (toString.call(opt.dictionary) === '[object ArrayBuffer]') {
                        dict = new Uint8Array(opt.dictionary);
                    } else {
                        dict = opt.dictionary;
                    }

                    status = zlib_deflate.deflateSetDictionary(this.strm, dict);

                    if (status !== Z_OK) {
                        throw new Error(msg[status]);
                    }

                    this._dict_set = true;
                }
            }

            /**
             * Deflate#push(data[, mode]) -> Boolean
             * - data (Uint8Array|Array|ArrayBuffer|String): input data. Strings will be
             *   converted to utf8 byte sequence.
             * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
             *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` meansh Z_FINISH.
             *
             * Sends input data to deflate pipe, generating [[Deflate#onData]] calls with
             * new compressed chunks. Returns `true` on success. The last data block must have
             * mode Z_FINISH (or `true`). That will flush internal pending buffers and call
             * [[Deflate#onEnd]]. For interim explicit flushes (without ending the stream) you
             * can use mode Z_SYNC_FLUSH, keeping the compression context.
             *
             * On fail call [[Deflate#onEnd]] with error code and return false.
             *
             * We strongly recommend to use `Uint8Array` on input for best speed (output
             * array format is detected automatically). Also, don't skip last param and always
             * use the same type in your code (boolean or number). That will improve JS speed.
             *
             * For regular `Array`-s make sure all elements are [0..255].
             *
             * ##### Example
             *
             * ```javascript
             * push(chunk, false); // push one of data chunks
             * ...
             * push(chunk, true);  // push last chunk
             * ```
             **/
            Deflate.prototype.push = function(data, mode) {
                var strm = this.strm;
                var chunkSize = this.options.chunkSize;
                var status, _mode;

                if (this.ended) {
                    return false;
                }

                _mode = (mode === ~~mode) ? mode : ((mode === true) ? Z_FINISH : Z_NO_FLUSH);

                // Convert data if needed
                if (typeof data === 'string') {
                    // If we need to compress text, change encoding to utf8.
                    strm.input = strings.string2buf(data);
                } else if (toString.call(data) === '[object ArrayBuffer]') {
                    strm.input = new Uint8Array(data);
                } else {
                    strm.input = data;
                }

                strm.next_in = 0;
                strm.avail_in = strm.input.length;

                do {
                    if (strm.avail_out === 0) {
                        strm.output = new utils.Buf8(chunkSize);
                        strm.next_out = 0;
                        strm.avail_out = chunkSize;
                    }
                    status = zlib_deflate.deflate(strm, _mode); /* no bad return value */

                    if (status !== Z_STREAM_END && status !== Z_OK) {
                        this.onEnd(status);
                        this.ended = true;
                        return false;
                    }
                    if (strm.avail_out === 0 || (strm.avail_in === 0 && (_mode === Z_FINISH || _mode === Z_SYNC_FLUSH))) {
                        if (this.options.to === 'string') {
                            this.onData(strings.buf2binstring(utils.shrinkBuf(strm.output, strm.next_out)));
                        } else {
                            this.onData(utils.shrinkBuf(strm.output, strm.next_out));
                        }
                    }
                } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== Z_STREAM_END);

                // Finalize on the last chunk.
                if (_mode === Z_FINISH) {
                    status = zlib_deflate.deflateEnd(this.strm);
                    this.onEnd(status);
                    this.ended = true;
                    return status === Z_OK;
                }

                // callback interim results if Z_SYNC_FLUSH.
                if (_mode === Z_SYNC_FLUSH) {
                    this.onEnd(Z_OK);
                    strm.avail_out = 0;
                    return true;
                }

                return true;
            };


            /**
             * Deflate#onData(chunk) -> Void
             * - chunk (Uint8Array|Array|String): ouput data. Type of array depends
             *   on js engine support. When string output requested, each chunk
             *   will be string.
             *
             * By default, stores data blocks in `chunks[]` property and glue
             * those in `onEnd`. Override this handler, if you need another behaviour.
             **/
            Deflate.prototype.onData = function(chunk) {
                this.chunks.push(chunk);
            };


            /**
             * Deflate#onEnd(status) -> Void
             * - status (Number): deflate status. 0 (Z_OK) on success,
             *   other if not.
             *
             * Called once after you tell deflate that the input stream is
             * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
             * or if an error happened. By default - join collected chunks,
             * free memory and fill `results` / `err` properties.
             **/
            Deflate.prototype.onEnd = function(status) {
                // On success - join
                if (status === Z_OK) {
                    if (this.options.to === 'string') {
                        this.result = this.chunks.join('');
                    } else {
                        this.result = utils.flattenChunks(this.chunks);
                    }
                }
                this.chunks = [];
                this.err = status;
                this.msg = this.strm.msg;
            };


            /**
             * deflate(data[, options]) -> Uint8Array|Array|String
             * - data (Uint8Array|Array|String): input data to compress.
             * - options (Object): zlib deflate options.
             *
             * Compress `data` with deflate algorithm and `options`.
             *
             * Supported options are:
             *
             * - level
             * - windowBits
             * - memLevel
             * - strategy
             * - dictionary
             *
             * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
             * for more information on these.
             *
             * Sugar (options):
             *
             * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
             *   negative windowBits implicitly.
             * - `to` (String) - if equal to 'string', then result will be "binary string"
             *    (each char code [0..255])
             *
             * ##### Example:
             *
             * ```javascript
             * var pako = require('pako')
             *   , data = Uint8Array([1,2,3,4,5,6,7,8,9]);
             *
             * console.log(pako.deflate(data));
             * ```
             **/
            function deflate(input, options) {
                var deflator = new Deflate(options);

                deflator.push(input, true);

                // That will never happens, if you don't cheat with options :)
                if (deflator.err) {
                    throw deflator.msg || msg[deflator.err];
                }

                return deflator.result;
            }


            /**
             * deflateRaw(data[, options]) -> Uint8Array|Array|String
             * - data (Uint8Array|Array|String): input data to compress.
             * - options (Object): zlib deflate options.
             *
             * The same as [[deflate]], but creates raw data, without wrapper
             * (header and adler32 crc).
             **/
            function deflateRaw(input, options) {
                options = options || {};
                options.raw = true;
                return deflate(input, options);
            }


            /**
             * gzip(data[, options]) -> Uint8Array|Array|String
             * - data (Uint8Array|Array|String): input data to compress.
             * - options (Object): zlib deflate options.
             *
             * The same as [[deflate]], but create gzip wrapper instead of
             * deflate one.
             **/
            function gzip(input, options) {
                options = options || {};
                options.gzip = true;
                return deflate(input, options);
            }


            exports.Deflate = Deflate;
            exports.deflate = deflate;
            exports.deflateRaw = deflateRaw;
            exports.gzip = gzip;

        }, {
            "./utils/common": 62,
            "./utils/strings": 63,
            "./zlib/deflate": 67,
            "./zlib/messages": 72,
            "./zlib/zstream": 74
        }],
        61: [function(require, module, exports) {
            'use strict';


            var zlib_inflate = require('./zlib/inflate');
            var utils = require('./utils/common');
            var strings = require('./utils/strings');
            var c = require('./zlib/constants');
            var msg = require('./zlib/messages');
            var ZStream = require('./zlib/zstream');
            var GZheader = require('./zlib/gzheader');

            var toString = Object.prototype.toString;

            /**
             * class Inflate
             *
             * Generic JS-style wrapper for zlib calls. If you don't need
             * streaming behaviour - use more simple functions: [[inflate]]
             * and [[inflateRaw]].
             **/

            /* internal
             * inflate.chunks -> Array
             *
             * Chunks of output data, if [[Inflate#onData]] not overriden.
             **/

            /**
             * Inflate.result -> Uint8Array|Array|String
             *
             * Uncompressed result, generated by default [[Inflate#onData]]
             * and [[Inflate#onEnd]] handlers. Filled after you push last chunk
             * (call [[Inflate#push]] with `Z_FINISH` / `true` param) or if you
             * push a chunk with explicit flush (call [[Inflate#push]] with
             * `Z_SYNC_FLUSH` param).
             **/

            /**
             * Inflate.err -> Number
             *
             * Error code after inflate finished. 0 (Z_OK) on success.
             * Should be checked if broken data possible.
             **/

            /**
             * Inflate.msg -> String
             *
             * Error message, if [[Inflate.err]] != 0
             **/


            /**
             * new Inflate(options)
             * - options (Object): zlib inflate options.
             *
             * Creates new inflator instance with specified params. Throws exception
             * on bad params. Supported options:
             *
             * - `windowBits`
             * - `dictionary`
             *
             * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
             * for more information on these.
             *
             * Additional options, for internal needs:
             *
             * - `chunkSize` - size of generated data chunks (16K by default)
             * - `raw` (Boolean) - do raw inflate
             * - `to` (String) - if equal to 'string', then result will be converted
             *   from utf8 to utf16 (javascript) string. When string output requested,
             *   chunk length can differ from `chunkSize`, depending on content.
             *
             * By default, when no options set, autodetect deflate/gzip data format via
             * wrapper header.
             *
             * ##### Example:
             *
             * ```javascript
             * var pako = require('pako')
             *   , chunk1 = Uint8Array([1,2,3,4,5,6,7,8,9])
             *   , chunk2 = Uint8Array([10,11,12,13,14,15,16,17,18,19]);
             *
             * var inflate = new pako.Inflate({ level: 3});
             *
             * inflate.push(chunk1, false);
             * inflate.push(chunk2, true);  // true -> last chunk
             *
             * if (inflate.err) { throw new Error(inflate.err); }
             *
             * console.log(inflate.result);
             * ```
             **/
            function Inflate(options) {
                if (!(this instanceof Inflate)) return new Inflate(options);

                this.options = utils.assign({
                    chunkSize: 16384,
                    windowBits: 0,
                    to: ''
                }, options || {});

                var opt = this.options;

                // Force window size for `raw` data, if not set directly,
                // because we have no header for autodetect.
                if (opt.raw && (opt.windowBits >= 0) && (opt.windowBits < 16)) {
                    opt.windowBits = -opt.windowBits;
                    if (opt.windowBits === 0) {
                        opt.windowBits = -15;
                    }
                }

                // If `windowBits` not defined (and mode not raw) - set autodetect flag for gzip/deflate
                if ((opt.windowBits >= 0) && (opt.windowBits < 16) &&
                    !(options && options.windowBits)) {
                    opt.windowBits += 32;
                }

                // Gzip header has no info about windows size, we can do autodetect only
                // for deflate. So, if window size not set, force it to max when gzip possible
                if ((opt.windowBits > 15) && (opt.windowBits < 48)) {
                    // bit 3 (16) -> gzipped data
                    // bit 4 (32) -> autodetect gzip/deflate
                    if ((opt.windowBits & 15) === 0) {
                        opt.windowBits |= 15;
                    }
                }

                this.err = 0; // error code, if happens (0 = Z_OK)
                this.msg = ''; // error message
                this.ended = false; // used to avoid multiple onEnd() calls
                this.chunks = []; // chunks of compressed data

                this.strm = new ZStream();
                this.strm.avail_out = 0;

                var status = zlib_inflate.inflateInit2(
                    this.strm,
                    opt.windowBits
                );

                if (status !== c.Z_OK) {
                    throw new Error(msg[status]);
                }

                this.header = new GZheader();

                zlib_inflate.inflateGetHeader(this.strm, this.header);
            }

            /**
             * Inflate#push(data[, mode]) -> Boolean
             * - data (Uint8Array|Array|ArrayBuffer|String): input data
             * - mode (Number|Boolean): 0..6 for corresponding Z_NO_FLUSH..Z_TREE modes.
             *   See constants. Skipped or `false` means Z_NO_FLUSH, `true` meansh Z_FINISH.
             *
             * Sends input data to inflate pipe, generating [[Inflate#onData]] calls with
             * new output chunks. Returns `true` on success. The last data block must have
             * mode Z_FINISH (or `true`). That will flush internal pending buffers and call
             * [[Inflate#onEnd]]. For interim explicit flushes (without ending the stream) you
             * can use mode Z_SYNC_FLUSH, keeping the decompression context.
             *
             * On fail call [[Inflate#onEnd]] with error code and return false.
             *
             * We strongly recommend to use `Uint8Array` on input for best speed (output
             * format is detected automatically). Also, don't skip last param and always
             * use the same type in your code (boolean or number). That will improve JS speed.
             *
             * For regular `Array`-s make sure all elements are [0..255].
             *
             * ##### Example
             *
             * ```javascript
             * push(chunk, false); // push one of data chunks
             * ...
             * push(chunk, true);  // push last chunk
             * ```
             **/
            Inflate.prototype.push = function(data, mode) {
                var strm = this.strm;
                var chunkSize = this.options.chunkSize;
                var dictionary = this.options.dictionary;
                var status, _mode;
                var next_out_utf8, tail, utf8str;
                var dict;

                // Flag to properly process Z_BUF_ERROR on testing inflate call
                // when we check that all output data was flushed.
                var allowBufError = false;

                if (this.ended) {
                    return false;
                }
                _mode = (mode === ~~mode) ? mode : ((mode === true) ? c.Z_FINISH : c.Z_NO_FLUSH);

                // Convert data if needed
                if (typeof data === 'string') {
                    // Only binary strings can be decompressed on practice
                    strm.input = strings.binstring2buf(data);
                } else if (toString.call(data) === '[object ArrayBuffer]') {
                    strm.input = new Uint8Array(data);
                } else {
                    strm.input = data;
                }

                strm.next_in = 0;
                strm.avail_in = strm.input.length;

                do {
                    if (strm.avail_out === 0) {
                        strm.output = new utils.Buf8(chunkSize);
                        strm.next_out = 0;
                        strm.avail_out = chunkSize;
                    }

                    status = zlib_inflate.inflate(strm, c.Z_NO_FLUSH); /* no bad return value */

                    if (status === c.Z_NEED_DICT && dictionary) {
                        // Convert data if needed
                        if (typeof dictionary === 'string') {
                            dict = strings.string2buf(dictionary);
                        } else if (toString.call(dictionary) === '[object ArrayBuffer]') {
                            dict = new Uint8Array(dictionary);
                        } else {
                            dict = dictionary;
                        }

                        status = zlib_inflate.inflateSetDictionary(this.strm, dict);

                    }

                    if (status === c.Z_BUF_ERROR && allowBufError === true) {
                        status = c.Z_OK;
                        allowBufError = false;
                    }

                    if (status !== c.Z_STREAM_END && status !== c.Z_OK) {
                        this.onEnd(status);
                        this.ended = true;
                        return false;
                    }

                    if (strm.next_out) {
                        if (strm.avail_out === 0 || status === c.Z_STREAM_END || (strm.avail_in === 0 && (_mode === c.Z_FINISH || _mode === c.Z_SYNC_FLUSH))) {

                            if (this.options.to === 'string') {

                                next_out_utf8 = strings.utf8border(strm.output, strm.next_out);

                                tail = strm.next_out - next_out_utf8;
                                utf8str = strings.buf2string(strm.output, next_out_utf8);

                                // move tail
                                strm.next_out = tail;
                                strm.avail_out = chunkSize - tail;
                                if (tail) {
                                    utils.arraySet(strm.output, strm.output, next_out_utf8, tail, 0);
                                }

                                this.onData(utf8str);

                            } else {
                                this.onData(utils.shrinkBuf(strm.output, strm.next_out));
                            }
                        }
                    }

                    // When no more input data, we should check that internal inflate buffers
                    // are flushed. The only way to do it when avail_out = 0 - run one more
                    // inflate pass. But if output data not exists, inflate return Z_BUF_ERROR.
                    // Here we set flag to process this error properly.
                    //
                    // NOTE. Deflate does not return error in this case and does not needs such
                    // logic.
                    if (strm.avail_in === 0 && strm.avail_out === 0) {
                        allowBufError = true;
                    }

                } while ((strm.avail_in > 0 || strm.avail_out === 0) && status !== c.Z_STREAM_END);

                if (status === c.Z_STREAM_END) {
                    _mode = c.Z_FINISH;
                }

                // Finalize on the last chunk.
                if (_mode === c.Z_FINISH) {
                    status = zlib_inflate.inflateEnd(this.strm);
                    this.onEnd(status);
                    this.ended = true;
                    return status === c.Z_OK;
                }

                // callback interim results if Z_SYNC_FLUSH.
                if (_mode === c.Z_SYNC_FLUSH) {
                    this.onEnd(c.Z_OK);
                    strm.avail_out = 0;
                    return true;
                }

                return true;
            };


            /**
             * Inflate#onData(chunk) -> Void
             * - chunk (Uint8Array|Array|String): ouput data. Type of array depends
             *   on js engine support. When string output requested, each chunk
             *   will be string.
             *
             * By default, stores data blocks in `chunks[]` property and glue
             * those in `onEnd`. Override this handler, if you need another behaviour.
             **/
            Inflate.prototype.onData = function(chunk) {
                this.chunks.push(chunk);
            };


            /**
             * Inflate#onEnd(status) -> Void
             * - status (Number): inflate status. 0 (Z_OK) on success,
             *   other if not.
             *
             * Called either after you tell inflate that the input stream is
             * complete (Z_FINISH) or should be flushed (Z_SYNC_FLUSH)
             * or if an error happened. By default - join collected chunks,
             * free memory and fill `results` / `err` properties.
             **/
            Inflate.prototype.onEnd = function(status) {
                // On success - join
                if (status === c.Z_OK) {
                    if (this.options.to === 'string') {
                        // Glue & convert here, until we teach pako to send
                        // utf8 alligned strings to onData
                        this.result = this.chunks.join('');
                    } else {
                        this.result = utils.flattenChunks(this.chunks);
                    }
                }
                this.chunks = [];
                this.err = status;
                this.msg = this.strm.msg;
            };


            /**
             * inflate(data[, options]) -> Uint8Array|Array|String
             * - data (Uint8Array|Array|String): input data to decompress.
             * - options (Object): zlib inflate options.
             *
             * Decompress `data` with inflate/ungzip and `options`. Autodetect
             * format via wrapper header by default. That's why we don't provide
             * separate `ungzip` method.
             *
             * Supported options are:
             *
             * - windowBits
             *
             * [http://zlib.net/manual.html#Advanced](http://zlib.net/manual.html#Advanced)
             * for more information.
             *
             * Sugar (options):
             *
             * - `raw` (Boolean) - say that we work with raw stream, if you don't wish to specify
             *   negative windowBits implicitly.
             * - `to` (String) - if equal to 'string', then result will be converted
             *   from utf8 to utf16 (javascript) string. When string output requested,
             *   chunk length can differ from `chunkSize`, depending on content.
             *
             *
             * ##### Example:
             *
             * ```javascript
             * var pako = require('pako')
             *   , input = pako.deflate([1,2,3,4,5,6,7,8,9])
             *   , output;
             *
             * try {
             *   output = pako.inflate(input);
             * } catch (err)
             *   console.log(err);
             * }
             * ```
             **/
            function inflate(input, options) {
                var inflator = new Inflate(options);

                inflator.push(input, true);

                // That will never happens, if you don't cheat with options :)
                if (inflator.err) {
                    throw inflator.msg || msg[inflator.err];
                }

                return inflator.result;
            }


            /**
             * inflateRaw(data[, options]) -> Uint8Array|Array|String
             * - data (Uint8Array|Array|String): input data to decompress.
             * - options (Object): zlib inflate options.
             *
             * The same as [[inflate]], but creates raw data, without wrapper
             * (header and adler32 crc).
             **/
            function inflateRaw(input, options) {
                options = options || {};
                options.raw = true;
                return inflate(input, options);
            }


            /**
             * ungzip(data[, options]) -> Uint8Array|Array|String
             * - data (Uint8Array|Array|String): input data to decompress.
             * - options (Object): zlib inflate options.
             *
             * Just shortcut to [[inflate]], because it autodetects format
             * by header.content. Done for convenience.
             **/


            exports.Inflate = Inflate;
            exports.inflate = inflate;
            exports.inflateRaw = inflateRaw;
            exports.ungzip = inflate;

        }, {
            "./utils/common": 62,
            "./utils/strings": 63,
            "./zlib/constants": 65,
            "./zlib/gzheader": 68,
            "./zlib/inflate": 70,
            "./zlib/messages": 72,
            "./zlib/zstream": 74
        }],
        62: [function(require, module, exports) {
            'use strict';


            var TYPED_OK = (typeof Uint8Array !== 'undefined') &&
                (typeof Uint16Array !== 'undefined') &&
                (typeof Int32Array !== 'undefined');


            exports.assign = function(obj /*from1, from2, from3, ...*/ ) {
                var sources = Array.prototype.slice.call(arguments, 1);
                while (sources.length) {
                    var source = sources.shift();
                    if (!source) {
                        continue;
                    }

                    if (typeof source !== 'object') {
                        throw new TypeError(source + 'must be non-object');
                    }

                    for (var p in source) {
                        if (source.hasOwnProperty(p)) {
                            obj[p] = source[p];
                        }
                    }
                }

                return obj;
            };


            // reduce buffer size, avoiding mem copy
            exports.shrinkBuf = function(buf, size) {
                if (buf.length === size) {
                    return buf;
                }
                if (buf.subarray) {
                    return buf.subarray(0, size);
                }
                buf.length = size;
                return buf;
            };


            var fnTyped = {
                arraySet: function(dest, src, src_offs, len, dest_offs) {
                    if (src.subarray && dest.subarray) {
                        dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
                        return;
                    }
                    // Fallback to ordinary array
                    for (var i = 0; i < len; i++) {
                        dest[dest_offs + i] = src[src_offs + i];
                    }
                },
                // Join array of chunks to single array.
                flattenChunks: function(chunks) {
                    var i, l, len, pos, chunk, result;

                    // calculate data length
                    len = 0;
                    for (i = 0, l = chunks.length; i < l; i++) {
                        len += chunks[i].length;
                    }

                    // join chunks
                    result = new Uint8Array(len);
                    pos = 0;
                    for (i = 0, l = chunks.length; i < l; i++) {
                        chunk = chunks[i];
                        result.set(chunk, pos);
                        pos += chunk.length;
                    }

                    return result;
                }
            };

            var fnUntyped = {
                arraySet: function(dest, src, src_offs, len, dest_offs) {
                    for (var i = 0; i < len; i++) {
                        dest[dest_offs + i] = src[src_offs + i];
                    }
                },
                // Join array of chunks to single array.
                flattenChunks: function(chunks) {
                    return [].concat.apply([], chunks);
                }
            };


            // Enable/Disable typed arrays use, for testing
            //
            exports.setTyped = function(on) {
                if (on) {
                    exports.Buf8 = Uint8Array;
                    exports.Buf16 = Uint16Array;
                    exports.Buf32 = Int32Array;
                    exports.assign(exports, fnTyped);
                } else {
                    exports.Buf8 = Array;
                    exports.Buf16 = Array;
                    exports.Buf32 = Array;
                    exports.assign(exports, fnUntyped);
                }
            };

            exports.setTyped(TYPED_OK);

        }, {}],
        63: [function(require, module, exports) {
            // String encode/decode helpers
            'use strict';


            var utils = require('./common');


            // Quick check if we can use fast array to bin string conversion
            //
            // - apply(Array) can fail on Android 2.2
            // - apply(Uint8Array) can fail on iOS 5.1 Safary
            //
            var STR_APPLY_OK = true;
            var STR_APPLY_UIA_OK = true;

            try {
                String.fromCharCode.apply(null, [0]);
            } catch (__) {
                STR_APPLY_OK = false;
            }
            try {
                String.fromCharCode.apply(null, new Uint8Array(1));
            } catch (__) {
                STR_APPLY_UIA_OK = false;
            }


            // Table with utf8 lengths (calculated by first byte of sequence)
            // Note, that 5 & 6-byte values and some 4-byte values can not be represented in JS,
            // because max possible codepoint is 0x10ffff
            var _utf8len = new utils.Buf8(256);
            for (var q = 0; q < 256; q++) {
                _utf8len[q] = (q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1);
            }
            _utf8len[254] = _utf8len[254] = 1; // Invalid sequence start


            // convert string to array (typed, when possible)
            exports.string2buf = function(str) {
                var buf, c, c2, m_pos, i, str_len = str.length,
                    buf_len = 0;

                // count binary size
                for (m_pos = 0; m_pos < str_len; m_pos++) {
                    c = str.charCodeAt(m_pos);
                    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
                        c2 = str.charCodeAt(m_pos + 1);
                        if ((c2 & 0xfc00) === 0xdc00) {
                            c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                            m_pos++;
                        }
                    }
                    buf_len += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4;
                }

                // allocate buffer
                buf = new utils.Buf8(buf_len);

                // convert
                for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
                    c = str.charCodeAt(m_pos);
                    if ((c & 0xfc00) === 0xd800 && (m_pos + 1 < str_len)) {
                        c2 = str.charCodeAt(m_pos + 1);
                        if ((c2 & 0xfc00) === 0xdc00) {
                            c = 0x10000 + ((c - 0xd800) << 10) + (c2 - 0xdc00);
                            m_pos++;
                        }
                    }
                    if (c < 0x80) {
                        /* one byte */
                        buf[i++] = c;
                    } else if (c < 0x800) {
                        /* two bytes */
                        buf[i++] = 0xC0 | (c >>> 6);
                        buf[i++] = 0x80 | (c & 0x3f);
                    } else if (c < 0x10000) {
                        /* three bytes */
                        buf[i++] = 0xE0 | (c >>> 12);
                        buf[i++] = 0x80 | (c >>> 6 & 0x3f);
                        buf[i++] = 0x80 | (c & 0x3f);
                    } else {
                        /* four bytes */
                        buf[i++] = 0xf0 | (c >>> 18);
                        buf[i++] = 0x80 | (c >>> 12 & 0x3f);
                        buf[i++] = 0x80 | (c >>> 6 & 0x3f);
                        buf[i++] = 0x80 | (c & 0x3f);
                    }
                }

                return buf;
            };

            // Helper (used in 2 places)
            function buf2binstring(buf, len) {
                // use fallback for big arrays to avoid stack overflow
                if (len < 65537) {
                    if ((buf.subarray && STR_APPLY_UIA_OK) || (!buf.subarray && STR_APPLY_OK)) {
                        return String.fromCharCode.apply(null, utils.shrinkBuf(buf, len));
                    }
                }

                var result = '';
                for (var i = 0; i < len; i++) {
                    result += String.fromCharCode(buf[i]);
                }
                return result;
            }


            // Convert byte array to binary string
            exports.buf2binstring = function(buf) {
                return buf2binstring(buf, buf.length);
            };


            // Convert binary string (typed, when possible)
            exports.binstring2buf = function(str) {
                var buf = new utils.Buf8(str.length);
                for (var i = 0, len = buf.length; i < len; i++) {
                    buf[i] = str.charCodeAt(i);
                }
                return buf;
            };


            // convert array to string
            exports.buf2string = function(buf, max) {
                var i, out, c, c_len;
                var len = max || buf.length;

                // Reserve max possible length (2 words per char)
                // NB: by unknown reasons, Array is significantly faster for
                //     String.fromCharCode.apply than Uint16Array.
                var utf16buf = new Array(len * 2);

                for (out = 0, i = 0; i < len;) {
                    c = buf[i++];
                    // quick process ascii
                    if (c < 0x80) {
                        utf16buf[out++] = c;
                        continue;
                    }

                    c_len = _utf8len[c];
                    // skip 5 & 6 byte codes
                    if (c_len > 4) {
                        utf16buf[out++] = 0xfffd;
                        i += c_len - 1;
                        continue;
                    }

                    // apply mask on first byte
                    c &= c_len === 2 ? 0x1f : c_len === 3 ? 0x0f : 0x07;
                    // join the rest
                    while (c_len > 1 && i < len) {
                        c = (c << 6) | (buf[i++] & 0x3f);
                        c_len--;
                    }

                    // terminated by end of string?
                    if (c_len > 1) {
                        utf16buf[out++] = 0xfffd;
                        continue;
                    }

                    if (c < 0x10000) {
                        utf16buf[out++] = c;
                    } else {
                        c -= 0x10000;
                        utf16buf[out++] = 0xd800 | ((c >> 10) & 0x3ff);
                        utf16buf[out++] = 0xdc00 | (c & 0x3ff);
                    }
                }

                return buf2binstring(utf16buf, out);
            };


            // Calculate max possible position in utf8 buffer,
            // that will not break sequence. If that's not possible
            // - (very small limits) return max size as is.
            //
            // buf[] - utf8 bytes array
            // max   - length limit (mandatory);
            exports.utf8border = function(buf, max) {
                var pos;

                max = max || buf.length;
                if (max > buf.length) {
                    max = buf.length;
                }

                // go back from last position, until start of sequence found
                pos = max - 1;
                while (pos >= 0 && (buf[pos] & 0xC0) === 0x80) {
                    pos--;
                }

                // Fuckup - very small and broken sequence,
                // return max, because we should return something anyway.
                if (pos < 0) {
                    return max;
                }

                // If we came to start of buffer - that means vuffer is too small,
                // return max too.
                if (pos === 0) {
                    return max;
                }

                return (pos + _utf8len[buf[pos]] > max) ? pos : max;
            };

        }, {
            "./common": 62
        }],
        64: [function(require, module, exports) {
            'use strict';

            // Note: adler32 takes 12% for level 0 and 2% for level 6.
            // It doesn't worth to make additional optimizationa as in original.
            // Small size is preferable.

            // (C) 1995-2013 Jean-loup Gailly and Mark Adler
            // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
            //
            // This software is provided 'as-is', without any express or implied
            // warranty. In no event will the authors be held liable for any damages
            // arising from the use of this software.
            //
            // Permission is granted to anyone to use this software for any purpose,
            // including commercial applications, and to alter it and redistribute it
            // freely, subject to the following restrictions:
            //
            // 1. The origin of this software must not be misrepresented; you must not
            //   claim that you wrote the original software. If you use this software
            //   in a product, an acknowledgment in the product documentation would be
            //   appreciated but is not required.
            // 2. Altered source versions must be plainly marked as such, and must not be
            //   misrepresented as being the original software.
            // 3. This notice may not be removed or altered from any source distribution.

            function adler32(adler, buf, len, pos) {
                var s1 = (adler & 0xffff) | 0,
                    s2 = ((adler >>> 16) & 0xffff) | 0,
                    n = 0;

                while (len !== 0) {
                    // Set limit ~ twice less than 5552, to keep
                    // s2 in 31-bits, because we force signed ints.
                    // in other case %= will fail.
                    n = len > 2000 ? 2000 : len;
                    len -= n;

                    do {
                        s1 = (s1 + buf[pos++]) | 0;
                        s2 = (s2 + s1) | 0;
                    } while (--n);

                    s1 %= 65521;
                    s2 %= 65521;
                }

                return (s1 | (s2 << 16)) | 0;
            }


            module.exports = adler32;

        }, {}],
        65: [function(require, module, exports) {
            'use strict';

            // (C) 1995-2013 Jean-loup Gailly and Mark Adler
            // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
            //
            // This software is provided 'as-is', without any express or implied
            // warranty. In no event will the authors be held liable for any damages
            // arising from the use of this software.
            //
            // Permission is granted to anyone to use this software for any purpose,
            // including commercial applications, and to alter it and redistribute it
            // freely, subject to the following restrictions:
            //
            // 1. The origin of this software must not be misrepresented; you must not
            //   claim that you wrote the original software. If you use this software
            //   in a product, an acknowledgment in the product documentation would be
            //   appreciated but is not required.
            // 2. Altered source versions must be plainly marked as such, and must not be
            //   misrepresented as being the original software.
            // 3. This notice may not be removed or altered from any source distribution.

            module.exports = {

                /* Allowed flush values; see deflate() and inflate() below for details */
                Z_NO_FLUSH: 0,
                Z_PARTIAL_FLUSH: 1,
                Z_SYNC_FLUSH: 2,
                Z_FULL_FLUSH: 3,
                Z_FINISH: 4,
                Z_BLOCK: 5,
                Z_TREES: 6,

                /* Return codes for the compression/decompression functions. Negative values
                 * are errors, positive values are used for special but normal events.
                 */
                Z_OK: 0,
                Z_STREAM_END: 1,
                Z_NEED_DICT: 2,
                Z_ERRNO: -1,
                Z_STREAM_ERROR: -2,
                Z_DATA_ERROR: -3,
                //Z_MEM_ERROR:     -4,
                Z_BUF_ERROR: -5,
                //Z_VERSION_ERROR: -6,

                /* compression levels */
                Z_NO_COMPRESSION: 0,
                Z_BEST_SPEED: 1,
                Z_BEST_COMPRESSION: 9,
                Z_DEFAULT_COMPRESSION: -1,


                Z_FILTERED: 1,
                Z_HUFFMAN_ONLY: 2,
                Z_RLE: 3,
                Z_FIXED: 4,
                Z_DEFAULT_STRATEGY: 0,

                /* Possible values of the data_type field (though see inflate()) */
                Z_BINARY: 0,
                Z_TEXT: 1,
                //Z_ASCII:                1, // = Z_TEXT (deprecated)
                Z_UNKNOWN: 2,

                /* The deflate compression method */
                Z_DEFLATED: 8
                    //Z_NULL:                 null // Use -1 or null inline, depending on var type
            };

        }, {}],
        66: [function(require, module, exports) {
            'use strict';

            // Note: we can't get significant speed boost here.
            // So write code to minimize size - no pregenerated tables
            // and array tools dependencies.

            // (C) 1995-2013 Jean-loup Gailly and Mark Adler
            // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
            //
            // This software is provided 'as-is', without any express or implied
            // warranty. In no event will the authors be held liable for any damages
            // arising from the use of this software.
            //
            // Permission is granted to anyone to use this software for any purpose,
            // including commercial applications, and to alter it and redistribute it
            // freely, subject to the following restrictions:
            //
            // 1. The origin of this software must not be misrepresented; you must not
            //   claim that you wrote the original software. If you use this software
            //   in a product, an acknowledgment in the product documentation would be
            //   appreciated but is not required.
            // 2. Altered source versions must be plainly marked as such, and must not be
            //   misrepresented as being the original software.
            // 3. This notice may not be removed or altered from any source distribution.

            // Use ordinary array, since untyped makes no boost here
            function makeTable() {
                var c, table = [];

                for (var n = 0; n < 256; n++) {
                    c = n;
                    for (var k = 0; k < 8; k++) {
                        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
                    }
                    table[n] = c;
                }

                return table;
            }

            // Create table on load. Just 255 signed longs. Not a problem.
            var crcTable = makeTable();


            function crc32(crc, buf, len, pos) {
                var t = crcTable,
                    end = pos + len;

                crc ^= -1;

                for (var i = pos; i < end; i++) {
                    crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
                }

                return (crc ^ (-1)); // >>> 0;
            }


            module.exports = crc32;

        }, {}],
        67: [function(require, module, exports) {
            'use strict';

            // (C) 1995-2013 Jean-loup Gailly and Mark Adler
            // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
            //
            // This software is provided 'as-is', without any express or implied
            // warranty. In no event will the authors be held liable for any damages
            // arising from the use of this software.
            //
            // Permission is granted to anyone to use this software for any purpose,
            // including commercial applications, and to alter it and redistribute it
            // freely, subject to the following restrictions:
            //
            // 1. The origin of this software must not be misrepresented; you must not
            //   claim that you wrote the original software. If you use this software
            //   in a product, an acknowledgment in the product documentation would be
            //   appreciated but is not required.
            // 2. Altered source versions must be plainly marked as such, and must not be
            //   misrepresented as being the original software.
            // 3. This notice may not be removed or altered from any source distribution.

            var utils = require('../utils/common');
            var trees = require('./trees');
            var adler32 = require('./adler32');
            var crc32 = require('./crc32');
            var msg = require('./messages');

            /* Public constants ==========================================================*/
            /* ===========================================================================*/


            /* Allowed flush values; see deflate() and inflate() below for details */
            var Z_NO_FLUSH = 0;
            var Z_PARTIAL_FLUSH = 1;
            //var Z_SYNC_FLUSH    = 2;
            var Z_FULL_FLUSH = 3;
            var Z_FINISH = 4;
            var Z_BLOCK = 5;
            //var Z_TREES         = 6;


            /* Return codes for the compression/decompression functions. Negative values
             * are errors, positive values are used for special but normal events.
             */
            var Z_OK = 0;
            var Z_STREAM_END = 1;
            //var Z_NEED_DICT     = 2;
            //var Z_ERRNO         = -1;
            var Z_STREAM_ERROR = -2;
            var Z_DATA_ERROR = -3;
            //var Z_MEM_ERROR     = -4;
            var Z_BUF_ERROR = -5;
            //var Z_VERSION_ERROR = -6;


            /* compression levels */
            //var Z_NO_COMPRESSION      = 0;
            //var Z_BEST_SPEED          = 1;
            //var Z_BEST_COMPRESSION    = 9;
            var Z_DEFAULT_COMPRESSION = -1;


            var Z_FILTERED = 1;
            var Z_HUFFMAN_ONLY = 2;
            var Z_RLE = 3;
            var Z_FIXED = 4;
            var Z_DEFAULT_STRATEGY = 0;

            /* Possible values of the data_type field (though see inflate()) */
            //var Z_BINARY              = 0;
            //var Z_TEXT                = 1;
            //var Z_ASCII               = 1; // = Z_TEXT
            var Z_UNKNOWN = 2;


            /* The deflate compression method */
            var Z_DEFLATED = 8;

            /*============================================================================*/


            var MAX_MEM_LEVEL = 9;
            /* Maximum value for memLevel in deflateInit2 */
            var MAX_WBITS = 15;
            /* 32K LZ77 window */
            var DEF_MEM_LEVEL = 8;


            var LENGTH_CODES = 29;
            /* number of length codes, not counting the special END_BLOCK code */
            var LITERALS = 256;
            /* number of literal bytes 0..255 */
            var L_CODES = LITERALS + 1 + LENGTH_CODES;
            /* number of Literal or Length codes, including the END_BLOCK code */
            var D_CODES = 30;
            /* number of distance codes */
            var BL_CODES = 19;
            /* number of codes used to transfer the bit lengths */
            var HEAP_SIZE = 2 * L_CODES + 1;
            /* maximum heap size */
            var MAX_BITS = 15;
            /* All codes must not exceed MAX_BITS bits */

            var MIN_MATCH = 3;
            var MAX_MATCH = 258;
            var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

            var PRESET_DICT = 0x20;

            var INIT_STATE = 42;
            var EXTRA_STATE = 69;
            var NAME_STATE = 73;
            var COMMENT_STATE = 91;
            var HCRC_STATE = 103;
            var BUSY_STATE = 113;
            var FINISH_STATE = 666;

            var BS_NEED_MORE = 1; /* block not completed, need more input or more output */
            var BS_BLOCK_DONE = 2; /* block flush performed */
            var BS_FINISH_STARTED = 3; /* finish started, need only more output at next deflate */
            var BS_FINISH_DONE = 4; /* finish done, accept no more input or output */

            var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

            function err(strm, errorCode) {
                strm.msg = msg[errorCode];
                return errorCode;
            }

            function rank(f) {
                return ((f) << 1) - ((f) > 4 ? 9 : 0);
            }

            function zero(buf) {
                var len = buf.length;
                while (--len >= 0) {
                    buf[len] = 0;
                }
            }


            /* =========================================================================
             * Flush as much pending output as possible. All deflate() output goes
             * through this function so some applications may wish to modify it
             * to avoid allocating a large strm->output buffer and copying into it.
             * (See also read_buf()).
             */
            function flush_pending(strm) {
                var s = strm.state;

                //_tr_flush_bits(s);
                var len = s.pending;
                if (len > strm.avail_out) {
                    len = strm.avail_out;
                }
                if (len === 0) {
                    return;
                }

                utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
                strm.next_out += len;
                s.pending_out += len;
                strm.total_out += len;
                strm.avail_out -= len;
                s.pending -= len;
                if (s.pending === 0) {
                    s.pending_out = 0;
                }
            }


            function flush_block_only(s, last) {
                trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
                s.block_start = s.strstart;
                flush_pending(s.strm);
            }


            function put_byte(s, b) {
                s.pending_buf[s.pending++] = b;
            }


            /* =========================================================================
             * Put a short in the pending buffer. The 16-bit value is put in MSB order.
             * IN assertion: the stream state is correct and there is enough room in
             * pending_buf.
             */
            function putShortMSB(s, b) {
                //  put_byte(s, (Byte)(b >> 8));
                //  put_byte(s, (Byte)(b & 0xff));
                s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
                s.pending_buf[s.pending++] = b & 0xff;
            }


            /* ===========================================================================
             * Read a new buffer from the current input stream, update the adler32
             * and total number of bytes read.  All deflate() input goes through
             * this function so some applications may wish to modify it to avoid
             * allocating a large strm->input buffer and copying from it.
             * (See also flush_pending()).
             */
            function read_buf(strm, buf, start, size) {
                var len = strm.avail_in;

                if (len > size) {
                    len = size;
                }
                if (len === 0) {
                    return 0;
                }

                strm.avail_in -= len;

                // zmemcpy(buf, strm->next_in, len);
                utils.arraySet(buf, strm.input, strm.next_in, len, start);
                if (strm.state.wrap === 1) {
                    strm.adler = adler32(strm.adler, buf, len, start);
                } else if (strm.state.wrap === 2) {
                    strm.adler = crc32(strm.adler, buf, len, start);
                }

                strm.next_in += len;
                strm.total_in += len;

                return len;
            }


            /* ===========================================================================
             * Set match_start to the longest match starting at the given string and
             * return its length. Matches shorter or equal to prev_length are discarded,
             * in which case the result is equal to prev_length and match_start is
             * garbage.
             * IN assertions: cur_match is the head of the hash chain for the current
             *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
             * OUT assertion: the match length is not greater than s->lookahead.
             */
            function longest_match(s, cur_match) {
                var chain_length = s.max_chain_length; /* max hash chain length */
                var scan = s.strstart; /* current string */
                var match; /* matched string */
                var len; /* length of current match */
                var best_len = s.prev_length; /* best match length so far */
                var nice_match = s.nice_match; /* stop if match long enough */
                var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
                    s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0 /*NIL*/ ;

                var _win = s.window; // shortcut

                var wmask = s.w_mask;
                var prev = s.prev;

                /* Stop when cur_match becomes <= limit. To simplify the code,
                 * we prevent matches with the string of window index 0.
                 */

                var strend = s.strstart + MAX_MATCH;
                var scan_end1 = _win[scan + best_len - 1];
                var scan_end = _win[scan + best_len];

                /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
                 * It is easy to get rid of this optimization if necessary.
                 */
                // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

                /* Do not waste too much time if we already have a good match: */
                if (s.prev_length >= s.good_match) {
                    chain_length >>= 2;
                }
                /* Do not look for matches beyond the end of the input. This is necessary
                 * to make deflate deterministic.
                 */
                if (nice_match > s.lookahead) {
                    nice_match = s.lookahead;
                }

                // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

                do {
                    // Assert(cur_match < s->strstart, "no future");
                    match = cur_match;

                    /* Skip to next match if the match length cannot increase
                     * or if the match length is less than 2.  Note that the checks below
                     * for insufficient lookahead only occur occasionally for performance
                     * reasons.  Therefore uninitialized memory will be accessed, and
                     * conditional jumps will be made that depend on those values.
                     * However the length of the match is limited to the lookahead, so
                     * the output of deflate is not affected by the uninitialized values.
                     */

                    if (_win[match + best_len] !== scan_end ||
                        _win[match + best_len - 1] !== scan_end1 ||
                        _win[match] !== _win[scan] ||
                        _win[++match] !== _win[scan + 1]) {
                        continue;
                    }

                    /* The check at best_len-1 can be removed because it will be made
                     * again later. (This heuristic is not always a win.)
                     * It is not necessary to compare scan[2] and match[2] since they
                     * are always equal when the other bytes match, given that
                     * the hash keys are equal and that HASH_BITS >= 8.
                     */
                    scan += 2;
                    match++;
                    // Assert(*scan == *match, "match[2]?");

                    /* We check for insufficient lookahead only every 8th comparison;
                     * the 256th check will be made at strstart+258.
                     */
                    do {
                        /*jshint noempty:false*/
                    } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
                        _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
                        _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
                        _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
                        scan < strend);

                    // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

                    len = MAX_MATCH - (strend - scan);
                    scan = strend - MAX_MATCH;

                    if (len > best_len) {
                        s.match_start = cur_match;
                        best_len = len;
                        if (len >= nice_match) {
                            break;
                        }
                        scan_end1 = _win[scan + best_len - 1];
                        scan_end = _win[scan + best_len];
                    }
                } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

                if (best_len <= s.lookahead) {
                    return best_len;
                }
                return s.lookahead;
            }


            /* ===========================================================================
             * Fill the window when the lookahead becomes insufficient.
             * Updates strstart and lookahead.
             *
             * IN assertion: lookahead < MIN_LOOKAHEAD
             * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
             *    At least one byte has been read, or avail_in == 0; reads are
             *    performed for at least two bytes (required for the zip translate_eol
             *    option -- not supported here).
             */
            function fill_window(s) {
                var _w_size = s.w_size;
                var p, n, m, more, str;

                //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

                do {
                    more = s.window_size - s.lookahead - s.strstart;

                    // JS ints have 32 bit, block below not needed
                    /* Deal with !@#$% 64K limit: */
                    //if (sizeof(int) <= 2) {
                    //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
                    //        more = wsize;
                    //
                    //  } else if (more == (unsigned)(-1)) {
                    //        /* Very unlikely, but possible on 16 bit machine if
                    //         * strstart == 0 && lookahead == 1 (input done a byte at time)
                    //         */
                    //        more--;
                    //    }
                    //}


                    /* If the window is almost full and there is insufficient lookahead,
                     * move the upper half to the lower one to make room in the upper half.
                     */
                    if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

                        utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
                        s.match_start -= _w_size;
                        s.strstart -= _w_size;
                        /* we now have strstart >= MAX_DIST */
                        s.block_start -= _w_size;

                        /* Slide the hash table (could be avoided with 32 bit values
                         at the expense of memory usage). We slide even when level == 0
                         to keep the hash table consistent if we switch back to level > 0
                         later. (Using level 0 permanently is not an optimal usage of
                         zlib, so we don't care about this pathological case.)
                         */

                        n = s.hash_size;
                        p = n;
                        do {
                            m = s.head[--p];
                            s.head[p] = (m >= _w_size ? m - _w_size : 0);
                        } while (--n);

                        n = _w_size;
                        p = n;
                        do {
                            m = s.prev[--p];
                            s.prev[p] = (m >= _w_size ? m - _w_size : 0);
                            /* If n is not on any hash chain, prev[n] is garbage but
                             * its value will never be used.
                             */
                        } while (--n);

                        more += _w_size;
                    }
                    if (s.strm.avail_in === 0) {
                        break;
                    }

                    /* If there was no sliding:
                     *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
                     *    more == window_size - lookahead - strstart
                     * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
                     * => more >= window_size - 2*WSIZE + 2
                     * In the BIG_MEM or MMAP case (not yet supported),
                     *   window_size == input_size + MIN_LOOKAHEAD  &&
                     *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
                     * Otherwise, window_size == 2*WSIZE so more >= 2.
                     * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
                     */
                    //Assert(more >= 2, "more < 2");
                    n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
                    s.lookahead += n;

                    /* Initialize the hash value now that we have some input: */
                    if (s.lookahead + s.insert >= MIN_MATCH) {
                        str = s.strstart - s.insert;
                        s.ins_h = s.window[str];

                        /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
                        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
                        //#if MIN_MATCH != 3
                        //        Call update_hash() MIN_MATCH-3 more times
                        //#endif
                        while (s.insert) {
                            /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
                            s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

                            s.prev[str & s.w_mask] = s.head[s.ins_h];
                            s.head[s.ins_h] = str;
                            str++;
                            s.insert--;
                            if (s.lookahead + s.insert < MIN_MATCH) {
                                break;
                            }
                        }
                    }
                    /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
                     * but this is not important since only literal bytes will be emitted.
                     */

                } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

                /* If the WIN_INIT bytes after the end of the current data have never been
                 * written, then zero those bytes in order to avoid memory check reports of
                 * the use of uninitialized (or uninitialised as Julian writes) bytes by
                 * the longest match routines.  Update the high water mark for the next
                 * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
                 * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
                 */
                //  if (s.high_water < s.window_size) {
                //    var curr = s.strstart + s.lookahead;
                //    var init = 0;
                //
                //    if (s.high_water < curr) {
                //      /* Previous high water mark below current data -- zero WIN_INIT
                //       * bytes or up to end of window, whichever is less.
                //       */
                //      init = s.window_size - curr;
                //      if (init > WIN_INIT)
                //        init = WIN_INIT;
                //      zmemzero(s->window + curr, (unsigned)init);
                //      s->high_water = curr + init;
                //    }
                //    else if (s->high_water < (ulg)curr + WIN_INIT) {
                //      /* High water mark at or above current data, but below current data
                //       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
                //       * to end of window, whichever is less.
                //       */
                //      init = (ulg)curr + WIN_INIT - s->high_water;
                //      if (init > s->window_size - s->high_water)
                //        init = s->window_size - s->high_water;
                //      zmemzero(s->window + s->high_water, (unsigned)init);
                //      s->high_water += init;
                //    }
                //  }
                //
                //  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
                //    "not enough room for search");
            }

            /* ===========================================================================
             * Copy without compression as much as possible from the input stream, return
             * the current block state.
             * This function does not insert new strings in the dictionary since
             * uncompressible data is probably not useful. This function is used
             * only for the level=0 compression option.
             * NOTE: this function should be optimized to avoid extra copying from
             * window to pending_buf.
             */
            function deflate_stored(s, flush) {
                /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
                 * to pending_buf_size, and each stored block has a 5 byte header:
                 */
                var max_block_size = 0xffff;

                if (max_block_size > s.pending_buf_size - 5) {
                    max_block_size = s.pending_buf_size - 5;
                }

                /* Copy as much as possible from input to output: */
                for (;;) {
                    /* Fill the window as much as possible: */
                    if (s.lookahead <= 1) {

                        //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
                        //  s->block_start >= (long)s->w_size, "slide too late");
                        //      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
                        //        s.block_start >= s.w_size)) {
                        //        throw  new Error("slide too late");
                        //      }

                        fill_window(s);
                        if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
                            return BS_NEED_MORE;
                        }

                        if (s.lookahead === 0) {
                            break;
                        }
                        /* flush the current block */
                    }
                    //Assert(s->block_start >= 0L, "block gone");
                    //    if (s.block_start < 0) throw new Error("block gone");

                    s.strstart += s.lookahead;
                    s.lookahead = 0;

                    /* Emit a stored block if pending_buf will be full: */
                    var max_start = s.block_start + max_block_size;

                    if (s.strstart === 0 || s.strstart >= max_start) {
                        /* strstart == 0 is possible when wraparound on 16-bit machine */
                        s.lookahead = s.strstart - max_start;
                        s.strstart = max_start;
                        /*** FLUSH_BLOCK(s, 0); ***/
                        flush_block_only(s, false);
                        if (s.strm.avail_out === 0) {
                            return BS_NEED_MORE;
                        }
                        /***/


                    }
                    /* Flush if we may have to slide, otherwise block_start may become
                     * negative and the data will be gone:
                     */
                    if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
                        /*** FLUSH_BLOCK(s, 0); ***/
                        flush_block_only(s, false);
                        if (s.strm.avail_out === 0) {
                            return BS_NEED_MORE;
                        }
                        /***/
                    }
                }

                s.insert = 0;

                if (flush === Z_FINISH) {
                    /*** FLUSH_BLOCK(s, 1); ***/
                    flush_block_only(s, true);
                    if (s.strm.avail_out === 0) {
                        return BS_FINISH_STARTED;
                    }
                    /***/
                    return BS_FINISH_DONE;
                }

                if (s.strstart > s.block_start) {
                    /*** FLUSH_BLOCK(s, 0); ***/
                    flush_block_only(s, false);
                    if (s.strm.avail_out === 0) {
                        return BS_NEED_MORE;
                    }
                    /***/
                }

                return BS_NEED_MORE;
            }

            /* ===========================================================================
             * Compress as much as possible from the input stream, return the current
             * block state.
             * This function does not perform lazy evaluation of matches and inserts
             * new strings in the dictionary only for unmatched strings or for short
             * matches. It is used only for the fast compression options.
             */
            function deflate_fast(s, flush) {
                var hash_head; /* head of the hash chain */
                var bflush; /* set if current block must be flushed */

                for (;;) {
                    /* Make sure that we always have enough lookahead, except
                     * at the end of the input file. We need MAX_MATCH bytes
                     * for the next match, plus MIN_MATCH bytes to insert the
                     * string following the next match.
                     */
                    if (s.lookahead < MIN_LOOKAHEAD) {
                        fill_window(s);
                        if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                            return BS_NEED_MORE;
                        }
                        if (s.lookahead === 0) {
                            break; /* flush the current block */
                        }
                    }

                    /* Insert the string window[strstart .. strstart+2] in the
                     * dictionary, and set hash_head to the head of the hash chain:
                     */
                    hash_head = 0 /*NIL*/ ;
                    if (s.lookahead >= MIN_MATCH) {
                        /*** INSERT_STRING(s, s.strstart, hash_head); ***/
                        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                        hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                        s.head[s.ins_h] = s.strstart;
                        /***/
                    }

                    /* Find the longest match, discarding those <= prev_length.
                     * At this point we have always match_length < MIN_MATCH
                     */
                    if (hash_head !== 0 /*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
                        /* To simplify the code, we prevent matches with the string
                         * of window index 0 (in particular we have to avoid a match
                         * of the string with itself at the start of the input file).
                         */
                        s.match_length = longest_match(s, hash_head);
                        /* longest_match() sets match_start */
                    }
                    if (s.match_length >= MIN_MATCH) {
                        // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

                        /*** _tr_tally_dist(s, s.strstart - s.match_start,
                                       s.match_length - MIN_MATCH, bflush); ***/
                        bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

                        s.lookahead -= s.match_length;

                        /* Insert new strings in the hash table only if the match length
                         * is not too large. This saves time but degrades compression.
                         */
                        if (s.match_length <= s.max_lazy_match /*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
                            s.match_length--; /* string at strstart already in table */
                            do {
                                s.strstart++;
                                /*** INSERT_STRING(s, s.strstart, hash_head); ***/
                                s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                                hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                                s.head[s.ins_h] = s.strstart;
                                /***/
                                /* strstart never exceeds WSIZE-MAX_MATCH, so there are
                                 * always MIN_MATCH bytes ahead.
                                 */
                            } while (--s.match_length !== 0);
                            s.strstart++;
                        } else {
                            s.strstart += s.match_length;
                            s.match_length = 0;
                            s.ins_h = s.window[s.strstart];
                            /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
                            s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

                            //#if MIN_MATCH != 3
                            //                Call UPDATE_HASH() MIN_MATCH-3 more times
                            //#endif
                            /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
                             * matter since it will be recomputed at next deflate call.
                             */
                        }
                    } else {
                        /* No match, output a literal byte */
                        //Tracevv((stderr,"%c", s.window[s.strstart]));
                        /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
                        bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

                        s.lookahead--;
                        s.strstart++;
                    }
                    if (bflush) {
                        /*** FLUSH_BLOCK(s, 0); ***/
                        flush_block_only(s, false);
                        if (s.strm.avail_out === 0) {
                            return BS_NEED_MORE;
                        }
                        /***/
                    }
                }
                s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
                if (flush === Z_FINISH) {
                    /*** FLUSH_BLOCK(s, 1); ***/
                    flush_block_only(s, true);
                    if (s.strm.avail_out === 0) {
                        return BS_FINISH_STARTED;
                    }
                    /***/
                    return BS_FINISH_DONE;
                }
                if (s.last_lit) {
                    /*** FLUSH_BLOCK(s, 0); ***/
                    flush_block_only(s, false);
                    if (s.strm.avail_out === 0) {
                        return BS_NEED_MORE;
                    }
                    /***/
                }
                return BS_BLOCK_DONE;
            }

            /* ===========================================================================
             * Same as above, but achieves better compression. We use a lazy
             * evaluation for matches: a match is finally adopted only if there is
             * no better match at the next window position.
             */
            function deflate_slow(s, flush) {
                var hash_head; /* head of hash chain */
                var bflush; /* set if current block must be flushed */

                var max_insert;

                /* Process the input block. */
                for (;;) {
                    /* Make sure that we always have enough lookahead, except
                     * at the end of the input file. We need MAX_MATCH bytes
                     * for the next match, plus MIN_MATCH bytes to insert the
                     * string following the next match.
                     */
                    if (s.lookahead < MIN_LOOKAHEAD) {
                        fill_window(s);
                        if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
                            return BS_NEED_MORE;
                        }
                        if (s.lookahead === 0) {
                            break;
                        } /* flush the current block */
                    }

                    /* Insert the string window[strstart .. strstart+2] in the
                     * dictionary, and set hash_head to the head of the hash chain:
                     */
                    hash_head = 0 /*NIL*/ ;
                    if (s.lookahead >= MIN_MATCH) {
                        /*** INSERT_STRING(s, s.strstart, hash_head); ***/
                        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                        hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                        s.head[s.ins_h] = s.strstart;
                        /***/
                    }

                    /* Find the longest match, discarding those <= prev_length.
                     */
                    s.prev_length = s.match_length;
                    s.prev_match = s.match_start;
                    s.match_length = MIN_MATCH - 1;

                    if (hash_head !== 0 /*NIL*/ && s.prev_length < s.max_lazy_match &&
                        s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD) /*MAX_DIST(s)*/ ) {
                        /* To simplify the code, we prevent matches with the string
                         * of window index 0 (in particular we have to avoid a match
                         * of the string with itself at the start of the input file).
                         */
                        s.match_length = longest_match(s, hash_head);
                        /* longest_match() sets match_start */

                        if (s.match_length <= 5 &&
                            (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096 /*TOO_FAR*/ ))) {

                            /* If prev_match is also MIN_MATCH, match_start is garbage
                             * but we will ignore the current match anyway.
                             */
                            s.match_length = MIN_MATCH - 1;
                        }
                    }
                    /* If there was a match at the previous step and the current
                     * match is not better, output the previous match:
                     */
                    if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
                        max_insert = s.strstart + s.lookahead - MIN_MATCH;
                        /* Do not insert strings in hash table beyond this. */

                        //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

                        /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
                                       s.prev_length - MIN_MATCH, bflush);***/
                        bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
                        /* Insert in hash table all strings up to the end of the match.
                         * strstart-1 and strstart are already inserted. If there is not
                         * enough lookahead, the last two strings are not inserted in
                         * the hash table.
                         */
                        s.lookahead -= s.prev_length - 1;
                        s.prev_length -= 2;
                        do {
                            if (++s.strstart <= max_insert) {
                                /*** INSERT_STRING(s, s.strstart, hash_head); ***/
                                s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
                                hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                                s.head[s.ins_h] = s.strstart;
                                /***/
                            }
                        } while (--s.prev_length !== 0);
                        s.match_available = 0;
                        s.match_length = MIN_MATCH - 1;
                        s.strstart++;

                        if (bflush) {
                            /*** FLUSH_BLOCK(s, 0); ***/
                            flush_block_only(s, false);
                            if (s.strm.avail_out === 0) {
                                return BS_NEED_MORE;
                            }
                            /***/
                        }

                    } else if (s.match_available) {
                        /* If there was no match at the previous position, output a
                         * single literal. If there was a match but the current match
                         * is longer, truncate the previous match to a single literal.
                         */
                        //Tracevv((stderr,"%c", s->window[s->strstart-1]));
                        /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
                        bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

                        if (bflush) {
                            /*** FLUSH_BLOCK_ONLY(s, 0) ***/
                            flush_block_only(s, false);
                            /***/
                        }
                        s.strstart++;
                        s.lookahead--;
                        if (s.strm.avail_out === 0) {
                            return BS_NEED_MORE;
                        }
                    } else {
                        /* There is no previous match to compare with, wait for
                         * the next step to decide.
                         */
                        s.match_available = 1;
                        s.strstart++;
                        s.lookahead--;
                    }
                }
                //Assert (flush != Z_NO_FLUSH, "no flush?");
                if (s.match_available) {
                    //Tracevv((stderr,"%c", s->window[s->strstart-1]));
                    /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
                    bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

                    s.match_available = 0;
                }
                s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
                if (flush === Z_FINISH) {
                    /*** FLUSH_BLOCK(s, 1); ***/
                    flush_block_only(s, true);
                    if (s.strm.avail_out === 0) {
                        return BS_FINISH_STARTED;
                    }
                    /***/
                    return BS_FINISH_DONE;
                }
                if (s.last_lit) {
                    /*** FLUSH_BLOCK(s, 0); ***/
                    flush_block_only(s, false);
                    if (s.strm.avail_out === 0) {
                        return BS_NEED_MORE;
                    }
                    /***/
                }

                return BS_BLOCK_DONE;
            }


            /* ===========================================================================
             * For Z_RLE, simply look for runs of bytes, generate matches only of distance
             * one.  Do not maintain a hash table.  (It will be regenerated if this run of
             * deflate switches away from Z_RLE.)
             */
            function deflate_rle(s, flush) {
                var bflush; /* set if current block must be flushed */
                var prev; /* byte at distance one to match */
                var scan, strend; /* scan goes up to strend for length of run */

                var _win = s.window;

                for (;;) {
                    /* Make sure that we always have enough lookahead, except
                     * at the end of the input file. We need MAX_MATCH bytes
                     * for the longest run, plus one for the unrolled loop.
                     */
                    if (s.lookahead <= MAX_MATCH) {
                        fill_window(s);
                        if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
                            return BS_NEED_MORE;
                        }
                        if (s.lookahead === 0) {
                            break;
                        } /* flush the current block */
                    }

                    /* See how many times the previous byte repeats */
                    s.match_length = 0;
                    if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
                        scan = s.strstart - 1;
                        prev = _win[scan];
                        if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
                            strend = s.strstart + MAX_MATCH;
                            do {
                                /*jshint noempty:false*/
                            } while (prev === _win[++scan] && prev === _win[++scan] &&
                                prev === _win[++scan] && prev === _win[++scan] &&
                                prev === _win[++scan] && prev === _win[++scan] &&
                                prev === _win[++scan] && prev === _win[++scan] &&
                                scan < strend);
                            s.match_length = MAX_MATCH - (strend - scan);
                            if (s.match_length > s.lookahead) {
                                s.match_length = s.lookahead;
                            }
                        }
                        //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
                    }

                    /* Emit match if have run of MIN_MATCH or longer, else emit literal */
                    if (s.match_length >= MIN_MATCH) {
                        //check_match(s, s.strstart, s.strstart - 1, s.match_length);

                        /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
                        bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);

                        s.lookahead -= s.match_length;
                        s.strstart += s.match_length;
                        s.match_length = 0;
                    } else {
                        /* No match, output a literal byte */
                        //Tracevv((stderr,"%c", s->window[s->strstart]));
                        /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
                        bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

                        s.lookahead--;
                        s.strstart++;
                    }
                    if (bflush) {
                        /*** FLUSH_BLOCK(s, 0); ***/
                        flush_block_only(s, false);
                        if (s.strm.avail_out === 0) {
                            return BS_NEED_MORE;
                        }
                        /***/
                    }
                }
                s.insert = 0;
                if (flush === Z_FINISH) {
                    /*** FLUSH_BLOCK(s, 1); ***/
                    flush_block_only(s, true);
                    if (s.strm.avail_out === 0) {
                        return BS_FINISH_STARTED;
                    }
                    /***/
                    return BS_FINISH_DONE;
                }
                if (s.last_lit) {
                    /*** FLUSH_BLOCK(s, 0); ***/
                    flush_block_only(s, false);
                    if (s.strm.avail_out === 0) {
                        return BS_NEED_MORE;
                    }
                    /***/
                }
                return BS_BLOCK_DONE;
            }

            /* ===========================================================================
             * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
             * (It will be regenerated if this run of deflate switches away from Huffman.)
             */
            function deflate_huff(s, flush) {
                var bflush; /* set if current block must be flushed */

                for (;;) {
                    /* Make sure that we have a literal to write. */
                    if (s.lookahead === 0) {
                        fill_window(s);
                        if (s.lookahead === 0) {
                            if (flush === Z_NO_FLUSH) {
                                return BS_NEED_MORE;
                            }
                            break; /* flush the current block */
                        }
                    }

                    /* Output a literal byte */
                    s.match_length = 0;
                    //Tracevv((stderr,"%c", s->window[s->strstart]));
                    /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
                    bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
                    s.lookahead--;
                    s.strstart++;
                    if (bflush) {
                        /*** FLUSH_BLOCK(s, 0); ***/
                        flush_block_only(s, false);
                        if (s.strm.avail_out === 0) {
                            return BS_NEED_MORE;
                        }
                        /***/
                    }
                }
                s.insert = 0;
                if (flush === Z_FINISH) {
                    /*** FLUSH_BLOCK(s, 1); ***/
                    flush_block_only(s, true);
                    if (s.strm.avail_out === 0) {
                        return BS_FINISH_STARTED;
                    }
                    /***/
                    return BS_FINISH_DONE;
                }
                if (s.last_lit) {
                    /*** FLUSH_BLOCK(s, 0); ***/
                    flush_block_only(s, false);
                    if (s.strm.avail_out === 0) {
                        return BS_NEED_MORE;
                    }
                    /***/
                }
                return BS_BLOCK_DONE;
            }

            /* Values for max_lazy_match, good_match and max_chain_length, depending on
             * the desired pack level (0..9). The values given below have been tuned to
             * exclude worst case performance for pathological files. Better values may be
             * found for specific files.
             */
            function Config(good_length, max_lazy, nice_length, max_chain, func) {
                this.good_length = good_length;
                this.max_lazy = max_lazy;
                this.nice_length = nice_length;
                this.max_chain = max_chain;
                this.func = func;
            }

            var configuration_table;

            configuration_table = [
                /*      good lazy nice chain */
                new Config(0, 0, 0, 0, deflate_stored), /* 0 store only */
                new Config(4, 4, 8, 4, deflate_fast), /* 1 max speed, no lazy matches */
                new Config(4, 5, 16, 8, deflate_fast), /* 2 */
                new Config(4, 6, 32, 32, deflate_fast), /* 3 */

                new Config(4, 4, 16, 16, deflate_slow), /* 4 lazy matches */
                new Config(8, 16, 32, 32, deflate_slow), /* 5 */
                new Config(8, 16, 128, 128, deflate_slow), /* 6 */
                new Config(8, 32, 128, 256, deflate_slow), /* 7 */
                new Config(32, 128, 258, 1024, deflate_slow), /* 8 */
                new Config(32, 258, 258, 4096, deflate_slow) /* 9 max compression */
            ];


            /* ===========================================================================
             * Initialize the "longest match" routines for a new zlib stream
             */
            function lm_init(s) {
                s.window_size = 2 * s.w_size;

                /*** CLEAR_HASH(s); ***/
                zero(s.head); // Fill with NIL (= 0);

                /* Set the default configuration parameters:
                 */
                s.max_lazy_match = configuration_table[s.level].max_lazy;
                s.good_match = configuration_table[s.level].good_length;
                s.nice_match = configuration_table[s.level].nice_length;
                s.max_chain_length = configuration_table[s.level].max_chain;

                s.strstart = 0;
                s.block_start = 0;
                s.lookahead = 0;
                s.insert = 0;
                s.match_length = s.prev_length = MIN_MATCH - 1;
                s.match_available = 0;
                s.ins_h = 0;
            }


            function DeflateState() {
                this.strm = null; /* pointer back to this zlib stream */
                this.status = 0; /* as the name implies */
                this.pending_buf = null; /* output still pending */
                this.pending_buf_size = 0; /* size of pending_buf */
                this.pending_out = 0; /* next pending byte to output to the stream */
                this.pending = 0; /* nb of bytes in the pending buffer */
                this.wrap = 0; /* bit 0 true for zlib, bit 1 true for gzip */
                this.gzhead = null; /* gzip header information to write */
                this.gzindex = 0; /* where in extra, name, or comment */
                this.method = Z_DEFLATED; /* can only be DEFLATED */
                this.last_flush = -1; /* value of flush param for previous deflate call */

                this.w_size = 0; /* LZ77 window size (32K by default) */
                this.w_bits = 0; /* log2(w_size)  (8..16) */
                this.w_mask = 0; /* w_size - 1 */

                this.window = null;
                /* Sliding window. Input bytes are read into the second half of the window,
                 * and move to the first half later to keep a dictionary of at least wSize
                 * bytes. With this organization, matches are limited to a distance of
                 * wSize-MAX_MATCH bytes, but this ensures that IO is always
                 * performed with a length multiple of the block size.
                 */

                this.window_size = 0;
                /* Actual size of window: 2*wSize, except when the user input buffer
                 * is directly used as sliding window.
                 */

                this.prev = null;
                /* Link to older string with same hash index. To limit the size of this
                 * array to 64K, this link is maintained only for the last 32K strings.
                 * An index in this array is thus a window index modulo 32K.
                 */

                this.head = null; /* Heads of the hash chains or NIL. */

                this.ins_h = 0; /* hash index of string to be inserted */
                this.hash_size = 0; /* number of elements in hash table */
                this.hash_bits = 0; /* log2(hash_size) */
                this.hash_mask = 0; /* hash_size-1 */

                this.hash_shift = 0;
                /* Number of bits by which ins_h must be shifted at each input
                 * step. It must be such that after MIN_MATCH steps, the oldest
                 * byte no longer takes part in the hash key, that is:
                 *   hash_shift * MIN_MATCH >= hash_bits
                 */

                this.block_start = 0;
                /* Window position at the beginning of the current output block. Gets
                 * negative when the window is moved backwards.
                 */

                this.match_length = 0; /* length of best match */
                this.prev_match = 0; /* previous match */
                this.match_available = 0; /* set if previous match exists */
                this.strstart = 0; /* start of string to insert */
                this.match_start = 0; /* start of matching string */
                this.lookahead = 0; /* number of valid bytes ahead in window */

                this.prev_length = 0;
                /* Length of the best match at previous step. Matches not greater than this
                 * are discarded. This is used in the lazy match evaluation.
                 */

                this.max_chain_length = 0;
                /* To speed up deflation, hash chains are never searched beyond this
                 * length.  A higher limit improves compression ratio but degrades the
                 * speed.
                 */

                this.max_lazy_match = 0;
                /* Attempt to find a better match only when the current match is strictly
                 * smaller than this value. This mechanism is used only for compression
                 * levels >= 4.
                 */
                // That's alias to max_lazy_match, don't use directly
                //this.max_insert_length = 0;
                /* Insert new strings in the hash table only if the match length is not
                 * greater than this length. This saves time but degrades compression.
                 * max_insert_length is used only for compression levels <= 3.
                 */

                this.level = 0; /* compression level (1..9) */
                this.strategy = 0; /* favor or force Huffman coding*/

                this.good_match = 0;
                /* Use a faster search when the previous match is longer than this */

                this.nice_match = 0; /* Stop searching when current match exceeds this */

                /* used by trees.c: */

                /* Didn't use ct_data typedef below to suppress compiler warning */

                // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
                // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
                // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

                // Use flat array of DOUBLE size, with interleaved fata,
                // because JS does not support effective
                this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
                this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
                this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
                zero(this.dyn_ltree);
                zero(this.dyn_dtree);
                zero(this.bl_tree);

                this.l_desc = null; /* desc. for literal tree */
                this.d_desc = null; /* desc. for distance tree */
                this.bl_desc = null; /* desc. for bit length tree */

                //ush bl_count[MAX_BITS+1];
                this.bl_count = new utils.Buf16(MAX_BITS + 1);
                /* number of codes at each bit length for an optimal tree */

                //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
                this.heap = new utils.Buf16(2 * L_CODES + 1); /* heap used to build the Huffman trees */
                zero(this.heap);

                this.heap_len = 0; /* number of elements in the heap */
                this.heap_max = 0; /* element of largest frequency */
                /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
                 * The same heap array is used to build all trees.
                 */

                this.depth = new utils.Buf16(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
                zero(this.depth);
                /* Depth of each subtree used as tie breaker for trees of equal frequency
                 */

                this.l_buf = 0; /* buffer index for literals or lengths */

                this.lit_bufsize = 0;
                /* Size of match buffer for literals/lengths.  There are 4 reasons for
                 * limiting lit_bufsize to 64K:
                 *   - frequencies can be kept in 16 bit counters
                 *   - if compression is not successful for the first block, all input
                 *     data is still in the window so we can still emit a stored block even
                 *     when input comes from standard input.  (This can also be done for
                 *     all blocks if lit_bufsize is not greater than 32K.)
                 *   - if compression is not successful for a file smaller than 64K, we can
                 *     even emit a stored file instead of a stored block (saving 5 bytes).
                 *     This is applicable only for zip (not gzip or zlib).
                 *   - creating new Huffman trees less frequently may not provide fast
                 *     adaptation to changes in the input data statistics. (Take for
                 *     example a binary file with poorly compressible code followed by
                 *     a highly compressible string table.) Smaller buffer sizes give
                 *     fast adaptation but have of course the overhead of transmitting
                 *     trees more frequently.
                 *   - I can't count above 4
                 */

                this.last_lit = 0; /* running index in l_buf */

                this.d_buf = 0;
                /* Buffer index for distances. To simplify the code, d_buf and l_buf have
                 * the same number of elements. To use different lengths, an extra flag
                 * array would be necessary.
                 */

                this.opt_len = 0; /* bit length of current block with optimal trees */
                this.static_len = 0; /* bit length of current block with static trees */
                this.matches = 0; /* number of string matches in current block */
                this.insert = 0; /* bytes at end of window left to insert */


                this.bi_buf = 0;
                /* Output buffer. bits are inserted starting at the bottom (least
                 * significant bits).
                 */
                this.bi_valid = 0;
                /* Number of valid bits in bi_buf.  All bits above the last valid bit
                 * are always zero.
                 */

                // Used for window memory init. We safely ignore it for JS. That makes
                // sense only for pointers and memory check tools.
                //this.high_water = 0;
                /* High water mark offset in window for initialized bytes -- bytes above
                 * this are set to zero in order to avoid memory check warnings when
                 * longest match routines access bytes past the input.  This is then
                 * updated to the new high water mark.
                 */
            }


            function deflateResetKeep(strm) {
                var s;

                if (!strm || !strm.state) {
                    return err(strm, Z_STREAM_ERROR);
                }

                strm.total_in = strm.total_out = 0;
                strm.data_type = Z_UNKNOWN;

                s = strm.state;
                s.pending = 0;
                s.pending_out = 0;

                if (s.wrap < 0) {
                    s.wrap = -s.wrap;
                    /* was made negative by deflate(..., Z_FINISH); */
                }
                s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
                strm.adler = (s.wrap === 2) ?
                    0 // crc32(0, Z_NULL, 0)
                    :
                    1; // adler32(0, Z_NULL, 0)
                s.last_flush = Z_NO_FLUSH;
                trees._tr_init(s);
                return Z_OK;
            }


            function deflateReset(strm) {
                var ret = deflateResetKeep(strm);
                if (ret === Z_OK) {
                    lm_init(strm.state);
                }
                return ret;
            }


            function deflateSetHeader(strm, head) {
                if (!strm || !strm.state) {
                    return Z_STREAM_ERROR;
                }
                if (strm.state.wrap !== 2) {
                    return Z_STREAM_ERROR;
                }
                strm.state.gzhead = head;
                return Z_OK;
            }


            function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
                if (!strm) { // === Z_NULL
                    return Z_STREAM_ERROR;
                }
                var wrap = 1;

                if (level === Z_DEFAULT_COMPRESSION) {
                    level = 6;
                }

                if (windowBits < 0) { /* suppress zlib wrapper */
                    wrap = 0;
                    windowBits = -windowBits;
                } else if (windowBits > 15) {
                    wrap = 2; /* write gzip wrapper instead */
                    windowBits -= 16;
                }


                if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
                    windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
                    strategy < 0 || strategy > Z_FIXED) {
                    return err(strm, Z_STREAM_ERROR);
                }


                if (windowBits === 8) {
                    windowBits = 9;
                }
                /* until 256-byte window bug fixed */

                var s = new DeflateState();

                strm.state = s;
                s.strm = strm;

                s.wrap = wrap;
                s.gzhead = null;
                s.w_bits = windowBits;
                s.w_size = 1 << s.w_bits;
                s.w_mask = s.w_size - 1;

                s.hash_bits = memLevel + 7;
                s.hash_size = 1 << s.hash_bits;
                s.hash_mask = s.hash_size - 1;
                s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

                s.window = new utils.Buf8(s.w_size * 2);
                s.head = new utils.Buf16(s.hash_size);
                s.prev = new utils.Buf16(s.w_size);

                // Don't need mem init magic for JS.
                //s.high_water = 0;  /* nothing written to s->window yet */

                s.lit_bufsize = 1 << (memLevel + 6); /* 16K elements by default */

                s.pending_buf_size = s.lit_bufsize * 4;

                //overlay = (ushf *) ZALLOC(strm, s->lit_bufsize, sizeof(ush)+2);
                //s->pending_buf = (uchf *) overlay;
                s.pending_buf = new utils.Buf8(s.pending_buf_size);

                // It is offset from `s.pending_buf` (size is `s.lit_bufsize * 2`)
                //s->d_buf = overlay + s->lit_bufsize/sizeof(ush);
                s.d_buf = 1 * s.lit_bufsize;

                //s->l_buf = s->pending_buf + (1+sizeof(ush))*s->lit_bufsize;
                s.l_buf = (1 + 2) * s.lit_bufsize;

                s.level = level;
                s.strategy = strategy;
                s.method = method;

                return deflateReset(strm);
            }

            function deflateInit(strm, level) {
                return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
            }


            function deflate(strm, flush) {
                var old_flush, s;
                var beg, val; // for gzip header write only

                if (!strm || !strm.state ||
                    flush > Z_BLOCK || flush < 0) {
                    return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
                }

                s = strm.state;

                if (!strm.output ||
                    (!strm.input && strm.avail_in !== 0) ||
                    (s.status === FINISH_STATE && flush !== Z_FINISH)) {
                    return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
                }

                s.strm = strm; /* just in case */
                old_flush = s.last_flush;
                s.last_flush = flush;

                /* Write the header */
                if (s.status === INIT_STATE) {

                    if (s.wrap === 2) { // GZIP header
                        strm.adler = 0; //crc32(0L, Z_NULL, 0);
                        put_byte(s, 31);
                        put_byte(s, 139);
                        put_byte(s, 8);
                        if (!s.gzhead) { // s->gzhead == Z_NULL
                            put_byte(s, 0);
                            put_byte(s, 0);
                            put_byte(s, 0);
                            put_byte(s, 0);
                            put_byte(s, 0);
                            put_byte(s, s.level === 9 ? 2 :
                                (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                                    4 : 0));
                            put_byte(s, OS_CODE);
                            s.status = BUSY_STATE;
                        } else {
                            put_byte(s, (s.gzhead.text ? 1 : 0) +
                                (s.gzhead.hcrc ? 2 : 0) +
                                (!s.gzhead.extra ? 0 : 4) +
                                (!s.gzhead.name ? 0 : 8) +
                                (!s.gzhead.comment ? 0 : 16)
                            );
                            put_byte(s, s.gzhead.time & 0xff);
                            put_byte(s, (s.gzhead.time >> 8) & 0xff);
                            put_byte(s, (s.gzhead.time >> 16) & 0xff);
                            put_byte(s, (s.gzhead.time >> 24) & 0xff);
                            put_byte(s, s.level === 9 ? 2 :
                                (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                                    4 : 0));
                            put_byte(s, s.gzhead.os & 0xff);
                            if (s.gzhead.extra && s.gzhead.extra.length) {
                                put_byte(s, s.gzhead.extra.length & 0xff);
                                put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
                            }
                            if (s.gzhead.hcrc) {
                                strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
                            }
                            s.gzindex = 0;
                            s.status = EXTRA_STATE;
                        }
                    } else // DEFLATE header
                    {
                        var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
                        var level_flags = -1;

                        if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
                            level_flags = 0;
                        } else if (s.level < 6) {
                            level_flags = 1;
                        } else if (s.level === 6) {
                            level_flags = 2;
                        } else {
                            level_flags = 3;
                        }
                        header |= (level_flags << 6);
                        if (s.strstart !== 0) {
                            header |= PRESET_DICT;
                        }
                        header += 31 - (header % 31);

                        s.status = BUSY_STATE;
                        putShortMSB(s, header);

                        /* Save the adler32 of the preset dictionary: */
                        if (s.strstart !== 0) {
                            putShortMSB(s, strm.adler >>> 16);
                            putShortMSB(s, strm.adler & 0xffff);
                        }
                        strm.adler = 1; // adler32(0L, Z_NULL, 0);
                    }
                }

                //#ifdef GZIP
                if (s.status === EXTRA_STATE) {
                    if (s.gzhead.extra /* != Z_NULL*/ ) {
                        beg = s.pending; /* start of bytes to update crc */

                        while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
                            if (s.pending === s.pending_buf_size) {
                                if (s.gzhead.hcrc && s.pending > beg) {
                                    strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                                }
                                flush_pending(strm);
                                beg = s.pending;
                                if (s.pending === s.pending_buf_size) {
                                    break;
                                }
                            }
                            put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
                            s.gzindex++;
                        }
                        if (s.gzhead.hcrc && s.pending > beg) {
                            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                        }
                        if (s.gzindex === s.gzhead.extra.length) {
                            s.gzindex = 0;
                            s.status = NAME_STATE;
                        }
                    } else {
                        s.status = NAME_STATE;
                    }
                }
                if (s.status === NAME_STATE) {
                    if (s.gzhead.name /* != Z_NULL*/ ) {
                        beg = s.pending; /* start of bytes to update crc */
                        //int val;

                        do {
                            if (s.pending === s.pending_buf_size) {
                                if (s.gzhead.hcrc && s.pending > beg) {
                                    strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                                }
                                flush_pending(strm);
                                beg = s.pending;
                                if (s.pending === s.pending_buf_size) {
                                    val = 1;
                                    break;
                                }
                            }
                            // JS specific: little magic to add zero terminator to end of string
                            if (s.gzindex < s.gzhead.name.length) {
                                val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
                            } else {
                                val = 0;
                            }
                            put_byte(s, val);
                        } while (val !== 0);

                        if (s.gzhead.hcrc && s.pending > beg) {
                            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                        }
                        if (val === 0) {
                            s.gzindex = 0;
                            s.status = COMMENT_STATE;
                        }
                    } else {
                        s.status = COMMENT_STATE;
                    }
                }
                if (s.status === COMMENT_STATE) {
                    if (s.gzhead.comment /* != Z_NULL*/ ) {
                        beg = s.pending; /* start of bytes to update crc */
                        //int val;

                        do {
                            if (s.pending === s.pending_buf_size) {
                                if (s.gzhead.hcrc && s.pending > beg) {
                                    strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                                }
                                flush_pending(strm);
                                beg = s.pending;
                                if (s.pending === s.pending_buf_size) {
                                    val = 1;
                                    break;
                                }
                            }
                            // JS specific: little magic to add zero terminator to end of string
                            if (s.gzindex < s.gzhead.comment.length) {
                                val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
                            } else {
                                val = 0;
                            }
                            put_byte(s, val);
                        } while (val !== 0);

                        if (s.gzhead.hcrc && s.pending > beg) {
                            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                        }
                        if (val === 0) {
                            s.status = HCRC_STATE;
                        }
                    } else {
                        s.status = HCRC_STATE;
                    }
                }
                if (s.status === HCRC_STATE) {
                    if (s.gzhead.hcrc) {
                        if (s.pending + 2 > s.pending_buf_size) {
                            flush_pending(strm);
                        }
                        if (s.pending + 2 <= s.pending_buf_size) {
                            put_byte(s, strm.adler & 0xff);
                            put_byte(s, (strm.adler >> 8) & 0xff);
                            strm.adler = 0; //crc32(0L, Z_NULL, 0);
                            s.status = BUSY_STATE;
                        }
                    } else {
                        s.status = BUSY_STATE;
                    }
                }
                //#endif

                /* Flush as much pending output as possible */
                if (s.pending !== 0) {
                    flush_pending(strm);
                    if (strm.avail_out === 0) {
                        /* Since avail_out is 0, deflate will be called again with
                         * more output space, but possibly with both pending and
                         * avail_in equal to zero. There won't be anything to do,
                         * but this is not an error situation so make sure we
                         * return OK instead of BUF_ERROR at next call of deflate:
                         */
                        s.last_flush = -1;
                        return Z_OK;
                    }

                    /* Make sure there is something to do and avoid duplicate consecutive
                     * flushes. For repeated and useless calls with Z_FINISH, we keep
                     * returning Z_STREAM_END instead of Z_BUF_ERROR.
                     */
                } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
                    flush !== Z_FINISH) {
                    return err(strm, Z_BUF_ERROR);
                }

                /* User must not provide more input after the first FINISH: */
                if (s.status === FINISH_STATE && strm.avail_in !== 0) {
                    return err(strm, Z_BUF_ERROR);
                }

                /* Start a new block or continue the current one.
                 */
                if (strm.avail_in !== 0 || s.lookahead !== 0 ||
                    (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
                    var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
                        (s.strategy === Z_RLE ? deflate_rle(s, flush) :
                            configuration_table[s.level].func(s, flush));

                    if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
                        s.status = FINISH_STATE;
                    }
                    if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
                        if (strm.avail_out === 0) {
                            s.last_flush = -1;
                            /* avoid BUF_ERROR next call, see above */
                        }
                        return Z_OK;
                        /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
                         * of deflate should use the same flush parameter to make sure
                         * that the flush is complete. So we don't have to output an
                         * empty block here, this will be done at next call. This also
                         * ensures that for a very small output buffer, we emit at most
                         * one empty block.
                         */
                    }
                    if (bstate === BS_BLOCK_DONE) {
                        if (flush === Z_PARTIAL_FLUSH) {
                            trees._tr_align(s);
                        } else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */

                            trees._tr_stored_block(s, 0, 0, false);
                            /* For a full flush, this empty block will be recognized
                             * as a special marker by inflate_sync().
                             */
                            if (flush === Z_FULL_FLUSH) {
                                /*** CLEAR_HASH(s); ***/
                                /* forget history */
                                zero(s.head); // Fill with NIL (= 0);

                                if (s.lookahead === 0) {
                                    s.strstart = 0;
                                    s.block_start = 0;
                                    s.insert = 0;
                                }
                            }
                        }
                        flush_pending(strm);
                        if (strm.avail_out === 0) {
                            s.last_flush = -1; /* avoid BUF_ERROR at next call, see above */
                            return Z_OK;
                        }
                    }
                }
                //Assert(strm->avail_out > 0, "bug2");
                //if (strm.avail_out <= 0) { throw new Error("bug2");}

                if (flush !== Z_FINISH) {
                    return Z_OK;
                }
                if (s.wrap <= 0) {
                    return Z_STREAM_END;
                }

                /* Write the trailer */
                if (s.wrap === 2) {
                    put_byte(s, strm.adler & 0xff);
                    put_byte(s, (strm.adler >> 8) & 0xff);
                    put_byte(s, (strm.adler >> 16) & 0xff);
                    put_byte(s, (strm.adler >> 24) & 0xff);
                    put_byte(s, strm.total_in & 0xff);
                    put_byte(s, (strm.total_in >> 8) & 0xff);
                    put_byte(s, (strm.total_in >> 16) & 0xff);
                    put_byte(s, (strm.total_in >> 24) & 0xff);
                } else {
                    putShortMSB(s, strm.adler >>> 16);
                    putShortMSB(s, strm.adler & 0xffff);
                }

                flush_pending(strm);
                /* If avail_out is zero, the application will call deflate again
                 * to flush the rest.
                 */
                if (s.wrap > 0) {
                    s.wrap = -s.wrap;
                }
                /* write the trailer only once! */
                return s.pending !== 0 ? Z_OK : Z_STREAM_END;
            }

            function deflateEnd(strm) {
                var status;

                if (!strm /*== Z_NULL*/ || !strm.state /*== Z_NULL*/ ) {
                    return Z_STREAM_ERROR;
                }

                status = strm.state.status;
                if (status !== INIT_STATE &&
                    status !== EXTRA_STATE &&
                    status !== NAME_STATE &&
                    status !== COMMENT_STATE &&
                    status !== HCRC_STATE &&
                    status !== BUSY_STATE &&
                    status !== FINISH_STATE
                ) {
                    return err(strm, Z_STREAM_ERROR);
                }

                strm.state = null;

                return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
            }


            /* =========================================================================
             * Initializes the compression dictionary from the given byte
             * sequence without producing any compressed output.
             */
            function deflateSetDictionary(strm, dictionary) {
                var dictLength = dictionary.length;

                var s;
                var str, n;
                var wrap;
                var avail;
                var next;
                var input;
                var tmpDict;

                if (!strm /*== Z_NULL*/ || !strm.state /*== Z_NULL*/ ) {
                    return Z_STREAM_ERROR;
                }

                s = strm.state;
                wrap = s.wrap;

                if (wrap === 2 || (wrap === 1 && s.status !== INIT_STATE) || s.lookahead) {
                    return Z_STREAM_ERROR;
                }

                /* when using zlib wrappers, compute Adler-32 for provided dictionary */
                if (wrap === 1) {
                    /* adler32(strm->adler, dictionary, dictLength); */
                    strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
                }

                s.wrap = 0; /* avoid computing Adler-32 in read_buf */

                /* if dictionary would fill window, just replace the history */
                if (dictLength >= s.w_size) {
                    if (wrap === 0) { /* already empty otherwise */
                        /*** CLEAR_HASH(s); ***/
                        zero(s.head); // Fill with NIL (= 0);
                        s.strstart = 0;
                        s.block_start = 0;
                        s.insert = 0;
                    }
                    /* use the tail */
                    // dictionary = dictionary.slice(dictLength - s.w_size);
                    tmpDict = new utils.Buf8(s.w_size);
                    utils.arraySet(tmpDict, dictionary, dictLength - s.w_size, s.w_size, 0);
                    dictionary = tmpDict;
                    dictLength = s.w_size;
                }
                /* insert dictionary into window and hash */
                avail = strm.avail_in;
                next = strm.next_in;
                input = strm.input;
                strm.avail_in = dictLength;
                strm.next_in = 0;
                strm.input = dictionary;
                fill_window(s);
                while (s.lookahead >= MIN_MATCH) {
                    str = s.strstart;
                    n = s.lookahead - (MIN_MATCH - 1);
                    do {
                        /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
                        s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

                        s.prev[str & s.w_mask] = s.head[s.ins_h];

                        s.head[s.ins_h] = str;
                        str++;
                    } while (--n);
                    s.strstart = str;
                    s.lookahead = MIN_MATCH - 1;
                    fill_window(s);
                }
                s.strstart += s.lookahead;
                s.block_start = s.strstart;
                s.insert = s.lookahead;
                s.lookahead = 0;
                s.match_length = s.prev_length = MIN_MATCH - 1;
                s.match_available = 0;
                strm.next_in = next;
                strm.input = input;
                strm.avail_in = avail;
                s.wrap = wrap;
                return Z_OK;
            }


            exports.deflateInit = deflateInit;
            exports.deflateInit2 = deflateInit2;
            exports.deflateReset = deflateReset;
            exports.deflateResetKeep = deflateResetKeep;
            exports.deflateSetHeader = deflateSetHeader;
            exports.deflate = deflate;
            exports.deflateEnd = deflateEnd;
            exports.deflateSetDictionary = deflateSetDictionary;
            exports.deflateInfo = 'pako deflate (from Nodeca project)';

            /* Not implemented
            exports.deflateBound = deflateBound;
            exports.deflateCopy = deflateCopy;
            exports.deflateParams = deflateParams;
            exports.deflatePending = deflatePending;
            exports.deflatePrime = deflatePrime;
            exports.deflateTune = deflateTune;
            */

        }, {
            "../utils/common": 62,
            "./adler32": 64,
            "./crc32": 66,
            "./messages": 72,
            "./trees": 73
        }],
        68: [function(require, module, exports) {
            'use strict';

            // (C) 1995-2013 Jean-loup Gailly and Mark Adler
            // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
            //
            // This software is provided 'as-is', without any express or implied
            // warranty. In no event will the authors be held liable for any damages
            // arising from the use of this software.
            //
            // Permission is granted to anyone to use this software for any purpose,
            // including commercial applications, and to alter it and redistribute it
            // freely, subject to the following restrictions:
            //
            // 1. The origin of this software must not be misrepresented; you must not
            //   claim that you wrote the original software. If you use this software
            //   in a product, an acknowledgment in the product documentation would be
            //   appreciated but is not required.
            // 2. Altered source versions must be plainly marked as such, and must not be
            //   misrepresented as being the original software.
            // 3. This notice may not be removed or altered from any source distribution.

            function GZheader() {
                /* true if compressed data believed to be text */
                this.text = 0;
                /* modification time */
                this.time = 0;
                /* extra flags (not used when writing a gzip file) */
                this.xflags = 0;
                /* operating system */
                this.os = 0;
                /* pointer to extra field or Z_NULL if none */
                this.extra = null;
                /* extra field length (valid if extra != Z_NULL) */
                this.extra_len = 0; // Actually, we don't need it in JS,
                // but leave for few code modifications

                //
                // Setup limits is not necessary because in js we should not preallocate memory
                // for inflate use constant limit in 65536 bytes
                //

                /* space at extra (only when reading header) */
                // this.extra_max  = 0;
                /* pointer to zero-terminated file name or Z_NULL */
                this.name = '';
                /* space at name (only when reading header) */
                // this.name_max   = 0;
                /* pointer to zero-terminated comment or Z_NULL */
                this.comment = '';
                /* space at comment (only when reading header) */
                // this.comm_max   = 0;
                /* true if there was or will be a header crc */
                this.hcrc = 0;
                /* true when done reading gzip header (not used when writing a gzip file) */
                this.done = false;
            }

            module.exports = GZheader;

        }, {}],
        69: [function(require, module, exports) {
            'use strict';

            // (C) 1995-2013 Jean-loup Gailly and Mark Adler
            // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
            //
            // This software is provided 'as-is', without any express or implied
            // warranty. In no event will the authors be held liable for any damages
            // arising from the use of this software.
            //
            // Permission is granted to anyone to use this software for any purpose,
            // including commercial applications, and to alter it and redistribute it
            // freely, subject to the following restrictions:
            //
            // 1. The origin of this software must not be misrepresented; you must not
            //   claim that you wrote the original software. If you use this software
            //   in a product, an acknowledgment in the product documentation would be
            //   appreciated but is not required.
            // 2. Altered source versions must be plainly marked as such, and must not be
            //   misrepresented as being the original software.
            // 3. This notice may not be removed or altered from any source distribution.

            // See state defs from inflate.js
            var BAD = 30; /* got a data error -- remain here until reset */
            var TYPE = 12; /* i: waiting for type bits, including last-flag bit */

            /*
               Decode literal, length, and distance codes and write out the resulting
               literal and match bytes until either not enough input or output is
               available, an end-of-block is encountered, or a data error is encountered.
               When large enough input and output buffers are supplied to inflate(), for
               example, a 16K input buffer and a 64K output buffer, more than 95% of the
               inflate execution time is spent in this routine.

               Entry assumptions:

                    state.mode === LEN
                    strm.avail_in >= 6
                    strm.avail_out >= 258
                    start >= strm.avail_out
                    state.bits < 8

               On return, state.mode is one of:

                    LEN -- ran out of enough output space or enough available input
                    TYPE -- reached end of block code, inflate() to interpret next block
                    BAD -- error in block data

               Notes:

                - The maximum input bits used by a length/distance pair is 15 bits for the
                  length code, 5 bits for the length extra, 15 bits for the distance code,
                  and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
                  Therefore if strm.avail_in >= 6, then there is enough input to avoid
                  checking for available input while decoding.

                - The maximum bytes that a single length/distance pair can output is 258
                  bytes, which is the maximum length that can be coded.  inflate_fast()
                  requires strm.avail_out >= 258 for each loop to avoid checking for
                  output space.
             */
            module.exports = function inflate_fast(strm, start) {
                var state;
                var _in; /* local strm.input */
                var last; /* have enough input while in < last */
                var _out; /* local strm.output */
                var beg; /* inflate()'s initial strm.output */
                var end; /* while out < end, enough space available */
                //#ifdef INFLATE_STRICT
                var dmax; /* maximum distance from zlib header */
                //#endif
                var wsize; /* window size or zero if not using window */
                var whave; /* valid bytes in the window */
                var wnext; /* window write index */
                // Use `s_window` instead `window`, avoid conflict with instrumentation tools
                var s_window; /* allocated sliding window, if wsize != 0 */
                var hold; /* local strm.hold */
                var bits; /* local strm.bits */
                var lcode; /* local strm.lencode */
                var dcode; /* local strm.distcode */
                var lmask; /* mask for first level of length codes */
                var dmask; /* mask for first level of distance codes */
                var here; /* retrieved table entry */
                var op; /* code bits, operation, extra bits, or */
                /*  window position, window bytes to copy */
                var len; /* match length, unused bytes */
                var dist; /* match distance */
                var from; /* where to copy match from */
                var from_source;


                var input, output; // JS specific, because we have no pointers

                /* copy state to local variables */
                state = strm.state;
                //here = state.here;
                _in = strm.next_in;
                input = strm.input;
                last = _in + (strm.avail_in - 5);
                _out = strm.next_out;
                output = strm.output;
                beg = _out - (start - strm.avail_out);
                end = _out + (strm.avail_out - 257);
                //#ifdef INFLATE_STRICT
                dmax = state.dmax;
                //#endif
                wsize = state.wsize;
                whave = state.whave;
                wnext = state.wnext;
                s_window = state.window;
                hold = state.hold;
                bits = state.bits;
                lcode = state.lencode;
                dcode = state.distcode;
                lmask = (1 << state.lenbits) - 1;
                dmask = (1 << state.distbits) - 1;


                /* decode literals and length/distances until end-of-block or not enough
                   input data or output space */

                top:
                    do {
                        if (bits < 15) {
                            hold += input[_in++] << bits;
                            bits += 8;
                            hold += input[_in++] << bits;
                            bits += 8;
                        }

                        here = lcode[hold & lmask];

                        dolen:
                            for (;;) { // Goto emulation
                                op = here >>> 24 /*here.bits*/ ;
                                hold >>>= op;
                                bits -= op;
                                op = (here >>> 16) & 0xff /*here.op*/ ;
                                if (op === 0) { /* literal */
                                    //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
                                    //        "inflate:         literal '%c'\n" :
                                    //        "inflate:         literal 0x%02x\n", here.val));
                                    output[_out++] = here & 0xffff /*here.val*/ ;
                                } else if (op & 16) { /* length base */
                                    len = here & 0xffff /*here.val*/ ;
                                    op &= 15; /* number of extra bits */
                                    if (op) {
                                        if (bits < op) {
                                            hold += input[_in++] << bits;
                                            bits += 8;
                                        }
                                        len += hold & ((1 << op) - 1);
                                        hold >>>= op;
                                        bits -= op;
                                    }
                                    //Tracevv((stderr, "inflate:         length %u\n", len));
                                    if (bits < 15) {
                                        hold += input[_in++] << bits;
                                        bits += 8;
                                        hold += input[_in++] << bits;
                                        bits += 8;
                                    }
                                    here = dcode[hold & dmask];

                                    dodist:
                                        for (;;) { // goto emulation
                                            op = here >>> 24 /*here.bits*/ ;
                                            hold >>>= op;
                                            bits -= op;
                                            op = (here >>> 16) & 0xff /*here.op*/ ;

                                            if (op & 16) { /* distance base */
                                                dist = here & 0xffff /*here.val*/ ;
                                                op &= 15; /* number of extra bits */
                                                if (bits < op) {
                                                    hold += input[_in++] << bits;
                                                    bits += 8;
                                                    if (bits < op) {
                                                        hold += input[_in++] << bits;
                                                        bits += 8;
                                                    }
                                                }
                                                dist += hold & ((1 << op) - 1);
                                                //#ifdef INFLATE_STRICT
                                                if (dist > dmax) {
                                                    strm.msg = 'invalid distance too far back';
                                                    state.mode = BAD;
                                                    break top;
                                                }
                                                //#endif
                                                hold >>>= op;
                                                bits -= op;
                                                //Tracevv((stderr, "inflate:         distance %u\n", dist));
                                                op = _out - beg; /* max distance in output */
                                                if (dist > op) { /* see if copy from window */
                                                    op = dist - op; /* distance back in window */
                                                    if (op > whave) {
                                                        if (state.sane) {
                                                            strm.msg = 'invalid distance too far back';
                                                            state.mode = BAD;
                                                            break top;
                                                        }

                                                        // (!) This block is disabled in zlib defailts,
                                                        // don't enable it for binary compatibility
                                                        //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
                                                        //                if (len <= op - whave) {
                                                        //                  do {
                                                        //                    output[_out++] = 0;
                                                        //                  } while (--len);
                                                        //                  continue top;
                                                        //                }
                                                        //                len -= op - whave;
                                                        //                do {
                                                        //                  output[_out++] = 0;
                                                        //                } while (--op > whave);
                                                        //                if (op === 0) {
                                                        //                  from = _out - dist;
                                                        //                  do {
                                                        //                    output[_out++] = output[from++];
                                                        //                  } while (--len);
                                                        //                  continue top;
                                                        //                }
                                                        //#endif
                                                    }
                                                    from = 0; // window index
                                                    from_source = s_window;
                                                    if (wnext === 0) { /* very common case */
                                                        from += wsize - op;
                                                        if (op < len) { /* some from window */
                                                            len -= op;
                                                            do {
                                                                output[_out++] = s_window[from++];
                                                            } while (--op);
                                                            from = _out - dist; /* rest from output */
                                                            from_source = output;
                                                        }
                                                    } else if (wnext < op) { /* wrap around window */
                                                        from += wsize + wnext - op;
                                                        op -= wnext;
                                                        if (op < len) { /* some from end of window */
                                                            len -= op;
                                                            do {
                                                                output[_out++] = s_window[from++];
                                                            } while (--op);
                                                            from = 0;
                                                            if (wnext < len) { /* some from start of window */
                                                                op = wnext;
                                                                len -= op;
                                                                do {
                                                                    output[_out++] = s_window[from++];
                                                                } while (--op);
                                                                from = _out - dist; /* rest from output */
                                                                from_source = output;
                                                            }
                                                        }
                                                    } else { /* contiguous in window */
                                                        from += wnext - op;
                                                        if (op < len) { /* some from window */
                                                            len -= op;
                                                            do {
                                                                output[_out++] = s_window[from++];
                                                            } while (--op);
                                                            from = _out - dist; /* rest from output */
                                                            from_source = output;
                                                        }
                                                    }
                                                    while (len > 2) {
                                                        output[_out++] = from_source[from++];
                                                        output[_out++] = from_source[from++];
                                                        output[_out++] = from_source[from++];
                                                        len -= 3;
                                                    }
                                                    if (len) {
                                                        output[_out++] = from_source[from++];
                                                        if (len > 1) {
                                                            output[_out++] = from_source[from++];
                                                        }
                                                    }
                                                } else {
                                                    from = _out - dist; /* copy direct from output */
                                                    do { /* minimum length is three */
                                                        output[_out++] = output[from++];
                                                        output[_out++] = output[from++];
                                                        output[_out++] = output[from++];
                                                        len -= 3;
                                                    } while (len > 2);
                                                    if (len) {
                                                        output[_out++] = output[from++];
                                                        if (len > 1) {
                                                            output[_out++] = output[from++];
                                                        }
                                                    }
                                                }
                                            } else if ((op & 64) === 0) { /* 2nd level distance code */
                                                here = dcode[(here & 0xffff) /*here.val*/ + (hold & ((1 << op) - 1))];
                                                continue dodist;
                                            } else {
                                                strm.msg = 'invalid distance code';
                                                state.mode = BAD;
                                                break top;
                                            }

                                            break; // need to emulate goto via "continue"
                                        }
                                } else if ((op & 64) === 0) { /* 2nd level length code */
                                    here = lcode[(here & 0xffff) /*here.val*/ + (hold & ((1 << op) - 1))];
                                    continue dolen;
                                } else if (op & 32) { /* end-of-block */
                                    //Tracevv((stderr, "inflate:         end of block\n"));
                                    state.mode = TYPE;
                                    break top;
                                } else {
                                    strm.msg = 'invalid literal/length code';
                                    state.mode = BAD;
                                    break top;
                                }

                                break; // need to emulate goto via "continue"
                            }
                    } while (_in < last && _out < end);

                /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
                len = bits >> 3;
                _in -= len;
                bits -= len << 3;
                hold &= (1 << bits) - 1;

                /* update state and return */
                strm.next_in = _in;
                strm.next_out = _out;
                strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
                strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
                state.hold = hold;
                state.bits = bits;
                return;
            };

        }, {}],
        70: [function(require, module, exports) {
            'use strict';

            // (C) 1995-2013 Jean-loup Gailly and Mark Adler
            // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
            //
            // This software is provided 'as-is', without any express or implied
            // warranty. In no event will the authors be held liable for any damages
            // arising from the use of this software.
            //
            // Permission is granted to anyone to use this software for any purpose,
            // including commercial applications, and to alter it and redistribute it
            // freely, subject to the following restrictions:
            //
            // 1. The origin of this software must not be misrepresented; you must not
            //   claim that you wrote the original software. If you use this software
            //   in a product, an acknowledgment in the product documentation would be
            //   appreciated but is not required.
            // 2. Altered source versions must be plainly marked as such, and must not be
            //   misrepresented as being the original software.
            // 3. This notice may not be removed or altered from any source distribution.

            var utils = require('../utils/common');
            var adler32 = require('./adler32');
            var crc32 = require('./crc32');
            var inflate_fast = require('./inffast');
            var inflate_table = require('./inftrees');

            var CODES = 0;
            var LENS = 1;
            var DISTS = 2;

            /* Public constants ==========================================================*/
            /* ===========================================================================*/


            /* Allowed flush values; see deflate() and inflate() below for details */
            //var Z_NO_FLUSH      = 0;
            //var Z_PARTIAL_FLUSH = 1;
            //var Z_SYNC_FLUSH    = 2;
            //var Z_FULL_FLUSH    = 3;
            var Z_FINISH = 4;
            var Z_BLOCK = 5;
            var Z_TREES = 6;


            /* Return codes for the compression/decompression functions. Negative values
             * are errors, positive values are used for special but normal events.
             */
            var Z_OK = 0;
            var Z_STREAM_END = 1;
            var Z_NEED_DICT = 2;
            //var Z_ERRNO         = -1;
            var Z_STREAM_ERROR = -2;
            var Z_DATA_ERROR = -3;
            var Z_MEM_ERROR = -4;
            var Z_BUF_ERROR = -5;
            //var Z_VERSION_ERROR = -6;

            /* The deflate compression method */
            var Z_DEFLATED = 8;


            /* STATES ====================================================================*/
            /* ===========================================================================*/


            var HEAD = 1; /* i: waiting for magic header */
            var FLAGS = 2; /* i: waiting for method and flags (gzip) */
            var TIME = 3; /* i: waiting for modification time (gzip) */
            var OS = 4; /* i: waiting for extra flags and operating system (gzip) */
            var EXLEN = 5; /* i: waiting for extra length (gzip) */
            var EXTRA = 6; /* i: waiting for extra bytes (gzip) */
            var NAME = 7; /* i: waiting for end of file name (gzip) */
            var COMMENT = 8; /* i: waiting for end of comment (gzip) */
            var HCRC = 9; /* i: waiting for header crc (gzip) */
            var DICTID = 10; /* i: waiting for dictionary check value */
            var DICT = 11; /* waiting for inflateSetDictionary() call */
            var TYPE = 12; /* i: waiting for type bits, including last-flag bit */
            var TYPEDO = 13; /* i: same, but skip check to exit inflate on new block */
            var STORED = 14; /* i: waiting for stored size (length and complement) */
            var COPY_ = 15; /* i/o: same as COPY below, but only first time in */
            var COPY = 16; /* i/o: waiting for input or output to copy stored block */
            var TABLE = 17; /* i: waiting for dynamic block table lengths */
            var LENLENS = 18; /* i: waiting for code length code lengths */
            var CODELENS = 19; /* i: waiting for length/lit and distance code lengths */
            var LEN_ = 20; /* i: same as LEN below, but only first time in */
            var LEN = 21; /* i: waiting for length/lit/eob code */
            var LENEXT = 22; /* i: waiting for length extra bits */
            var DIST = 23; /* i: waiting for distance code */
            var DISTEXT = 24; /* i: waiting for distance extra bits */
            var MATCH = 25; /* o: waiting for output space to copy string */
            var LIT = 26; /* o: waiting for output space to write literal */
            var CHECK = 27; /* i: waiting for 32-bit check value */
            var LENGTH = 28; /* i: waiting for 32-bit length (gzip) */
            var DONE = 29; /* finished check, done -- remain here until reset */
            var BAD = 30; /* got a data error -- remain here until reset */
            var MEM = 31; /* got an inflate() memory error -- remain here until reset */
            var SYNC = 32; /* looking for synchronization bytes to restart inflate() */

            /* ===========================================================================*/



            var ENOUGH_LENS = 852;
            var ENOUGH_DISTS = 592;
            //var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

            var MAX_WBITS = 15;
            /* 32K LZ77 window */
            var DEF_WBITS = MAX_WBITS;


            function zswap32(q) {
                return (((q >>> 24) & 0xff) +
                    ((q >>> 8) & 0xff00) +
                    ((q & 0xff00) << 8) +
                    ((q & 0xff) << 24));
            }


            function InflateState() {
                this.mode = 0; /* current inflate mode */
                this.last = false; /* true if processing last block */
                this.wrap = 0; /* bit 0 true for zlib, bit 1 true for gzip */
                this.havedict = false; /* true if dictionary provided */
                this.flags = 0; /* gzip header method and flags (0 if zlib) */
                this.dmax = 0; /* zlib header max distance (INFLATE_STRICT) */
                this.check = 0; /* protected copy of check value */
                this.total = 0; /* protected copy of output count */
                // TODO: may be {}
                this.head = null; /* where to save gzip header information */

                /* sliding window */
                this.wbits = 0; /* log base 2 of requested window size */
                this.wsize = 0; /* window size or zero if not using window */
                this.whave = 0; /* valid bytes in the window */
                this.wnext = 0; /* window write index */
                this.window = null; /* allocated sliding window, if needed */

                /* bit accumulator */
                this.hold = 0; /* input bit accumulator */
                this.bits = 0; /* number of bits in "in" */

                /* for string and stored block copying */
                this.length = 0; /* literal or length of data to copy */
                this.offset = 0; /* distance back to copy string from */

                /* for table and code decoding */
                this.extra = 0; /* extra bits needed */

                /* fixed and dynamic code tables */
                this.lencode = null; /* starting table for length/literal codes */
                this.distcode = null; /* starting table for distance codes */
                this.lenbits = 0; /* index bits for lencode */
                this.distbits = 0; /* index bits for distcode */

                /* dynamic table building */
                this.ncode = 0; /* number of code length code lengths */
                this.nlen = 0; /* number of length code lengths */
                this.ndist = 0; /* number of distance code lengths */
                this.have = 0; /* number of code lengths in lens[] */
                this.next = null; /* next available space in codes[] */

                this.lens = new utils.Buf16(320); /* temporary storage for code lengths */
                this.work = new utils.Buf16(288); /* work area for code table building */

                /*
                 because we don't have pointers in js, we use lencode and distcode directly
                 as buffers so we don't need codes
                */
                //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
                this.lendyn = null; /* dynamic table for length/literal codes (JS specific) */
                this.distdyn = null; /* dynamic table for distance codes (JS specific) */
                this.sane = 0; /* if false, allow invalid distance too far */
                this.back = 0; /* bits back of last unprocessed length/lit */
                this.was = 0; /* initial length of match */
            }

            function inflateResetKeep(strm) {
                var state;

                if (!strm || !strm.state) {
                    return Z_STREAM_ERROR;
                }
                state = strm.state;
                strm.total_in = strm.total_out = state.total = 0;
                strm.msg = ''; /*Z_NULL*/
                if (state.wrap) { /* to support ill-conceived Java test suite */
                    strm.adler = state.wrap & 1;
                }
                state.mode = HEAD;
                state.last = 0;
                state.havedict = 0;
                state.dmax = 32768;
                state.head = null /*Z_NULL*/ ;
                state.hold = 0;
                state.bits = 0;
                //state.lencode = state.distcode = state.next = state.codes;
                state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
                state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);

                state.sane = 1;
                state.back = -1;
                //Tracev((stderr, "inflate: reset\n"));
                return Z_OK;
            }

            function inflateReset(strm) {
                var state;

                if (!strm || !strm.state) {
                    return Z_STREAM_ERROR;
                }
                state = strm.state;
                state.wsize = 0;
                state.whave = 0;
                state.wnext = 0;
                return inflateResetKeep(strm);

            }

            function inflateReset2(strm, windowBits) {
                var wrap;
                var state;

                /* get the state */
                if (!strm || !strm.state) {
                    return Z_STREAM_ERROR;
                }
                state = strm.state;

                /* extract wrap request from windowBits parameter */
                if (windowBits < 0) {
                    wrap = 0;
                    windowBits = -windowBits;
                } else {
                    wrap = (windowBits >> 4) + 1;
                    if (windowBits < 48) {
                        windowBits &= 15;
                    }
                }

                /* set number of window bits, free window if different */
                if (windowBits && (windowBits < 8 || windowBits > 15)) {
                    return Z_STREAM_ERROR;
                }
                if (state.window !== null && state.wbits !== windowBits) {
                    state.window = null;
                }

                /* update state and reset the rest of it */
                state.wrap = wrap;
                state.wbits = windowBits;
                return inflateReset(strm);
            }

            function inflateInit2(strm, windowBits) {
                var ret;
                var state;

                if (!strm) {
                    return Z_STREAM_ERROR;
                }
                //strm.msg = Z_NULL;                 /* in case we return an error */

                state = new InflateState();

                //if (state === Z_NULL) return Z_MEM_ERROR;
                //Tracev((stderr, "inflate: allocated\n"));
                strm.state = state;
                state.window = null /*Z_NULL*/ ;
                ret = inflateReset2(strm, windowBits);
                if (ret !== Z_OK) {
                    strm.state = null /*Z_NULL*/ ;
                }
                return ret;
            }

            function inflateInit(strm) {
                return inflateInit2(strm, DEF_WBITS);
            }


            /*
             Return state with length and distance decoding tables and index sizes set to
             fixed code decoding.  Normally this returns fixed tables from inffixed.h.
             If BUILDFIXED is defined, then instead this routine builds the tables the
             first time it's called, and returns those tables the first time and
             thereafter.  This reduces the size of the code by about 2K bytes, in
             exchange for a little execution time.  However, BUILDFIXED should not be
             used for threaded applications, since the rewriting of the tables and virgin
             may not be thread-safe.
             */
            var virgin = true;

            var lenfix, distfix; // We have no pointers in JS, so keep tables separate

            function fixedtables(state) {
                /* build fixed huffman tables if first call (may not be thread safe) */
                if (virgin) {
                    var sym;

                    lenfix = new utils.Buf32(512);
                    distfix = new utils.Buf32(32);

                    /* literal/length table */
                    sym = 0;
                    while (sym < 144) {
                        state.lens[sym++] = 8;
                    }
                    while (sym < 256) {
                        state.lens[sym++] = 9;
                    }
                    while (sym < 280) {
                        state.lens[sym++] = 7;
                    }
                    while (sym < 288) {
                        state.lens[sym++] = 8;
                    }

                    inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, {
                        bits: 9
                    });

                    /* distance table */
                    sym = 0;
                    while (sym < 32) {
                        state.lens[sym++] = 5;
                    }

                    inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, {
                        bits: 5
                    });

                    /* do this just once */
                    virgin = false;
                }

                state.lencode = lenfix;
                state.lenbits = 9;
                state.distcode = distfix;
                state.distbits = 5;
            }


            /*
             Update the window with the last wsize (normally 32K) bytes written before
             returning.  If window does not exist yet, create it.  This is only called
             when a window is already in use, or when output has been written during this
             inflate call, but the end of the deflate stream has not been reached yet.
             It is also called to create a window for dictionary data when a dictionary
             is loaded.

             Providing output buffers larger than 32K to inflate() should provide a speed
             advantage, since only the last 32K of output is copied to the sliding window
             upon return from inflate(), and since all distances after the first 32K of
             output will fall in the output data, making match copies simpler and faster.
             The advantage may be dependent on the size of the processor's data caches.
             */
            function updatewindow(strm, src, end, copy) {
                var dist;
                var state = strm.state;

                /* if it hasn't been done already, allocate space for the window */
                if (state.window === null) {
                    state.wsize = 1 << state.wbits;
                    state.wnext = 0;
                    state.whave = 0;

                    state.window = new utils.Buf8(state.wsize);
                }

                /* copy state->wsize or less output bytes into the circular window */
                if (copy >= state.wsize) {
                    utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
                    state.wnext = 0;
                    state.whave = state.wsize;
                } else {
                    dist = state.wsize - state.wnext;
                    if (dist > copy) {
                        dist = copy;
                    }
                    //zmemcpy(state->window + state->wnext, end - copy, dist);
                    utils.arraySet(state.window, src, end - copy, dist, state.wnext);
                    copy -= dist;
                    if (copy) {
                        //zmemcpy(state->window, end - copy, copy);
                        utils.arraySet(state.window, src, end - copy, copy, 0);
                        state.wnext = copy;
                        state.whave = state.wsize;
                    } else {
                        state.wnext += dist;
                        if (state.wnext === state.wsize) {
                            state.wnext = 0;
                        }
                        if (state.whave < state.wsize) {
                            state.whave += dist;
                        }
                    }
                }
                return 0;
            }

            function inflate(strm, flush) {
                var state;
                var input, output; // input/output buffers
                var next; /* next input INDEX */
                var put; /* next output INDEX */
                var have, left; /* available input and output */
                var hold; /* bit buffer */
                var bits; /* bits in bit buffer */
                var _in, _out; /* save starting available input and output */
                var copy; /* number of stored or match bytes to copy */
                var from; /* where to copy match bytes from */
                var from_source;
                var here = 0; /* current decoding table entry */
                var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
                //var last;                   /* parent table entry */
                var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
                var len; /* length to copy for repeats, bits to drop */
                var ret; /* return code */
                var hbuf = new utils.Buf8(4); /* buffer for gzip header crc calculation */
                var opts;

                var n; // temporary var for NEED_BITS

                var order = /* permutation of code lengths */
                    [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];


                if (!strm || !strm.state || !strm.output ||
                    (!strm.input && strm.avail_in !== 0)) {
                    return Z_STREAM_ERROR;
                }

                state = strm.state;
                if (state.mode === TYPE) {
                    state.mode = TYPEDO;
                } /* skip check */


                //--- LOAD() ---
                put = strm.next_out;
                output = strm.output;
                left = strm.avail_out;
                next = strm.next_in;
                input = strm.input;
                have = strm.avail_in;
                hold = state.hold;
                bits = state.bits;
                //---

                _in = have;
                _out = left;
                ret = Z_OK;

                inf_leave: // goto emulation
                    for (;;) {
                        switch (state.mode) {
                            case HEAD:
                                if (state.wrap === 0) {
                                    state.mode = TYPEDO;
                                    break;
                                }
                                //=== NEEDBITS(16);
                                while (bits < 16) {
                                    if (have === 0) {
                                        break inf_leave;
                                    }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                if ((state.wrap & 2) && hold === 0x8b1f) { /* gzip header */
                                    state.check = 0 /*crc32(0L, Z_NULL, 0)*/ ;
                                    //=== CRC2(state.check, hold);
                                    hbuf[0] = hold & 0xff;
                                    hbuf[1] = (hold >>> 8) & 0xff;
                                    state.check = crc32(state.check, hbuf, 2, 0);
                                    //===//

                                    //=== INITBITS();
                                    hold = 0;
                                    bits = 0;
                                    //===//
                                    state.mode = FLAGS;
                                    break;
                                }
                                state.flags = 0; /* expect zlib header */
                                if (state.head) {
                                    state.head.done = false;
                                }
                                if (!(state.wrap & 1) || /* check if zlib header allowed */
                                    (((hold & 0xff) /*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
                                    strm.msg = 'incorrect header check';
                                    state.mode = BAD;
                                    break;
                                }
                                if ((hold & 0x0f) /*BITS(4)*/ !== Z_DEFLATED) {
                                    strm.msg = 'unknown compression method';
                                    state.mode = BAD;
                                    break;
                                }
                                //--- DROPBITS(4) ---//
                                hold >>>= 4;
                                bits -= 4;
                                //---//
                                len = (hold & 0x0f) /*BITS(4)*/ + 8;
                                if (state.wbits === 0) {
                                    state.wbits = len;
                                } else if (len > state.wbits) {
                                    strm.msg = 'invalid window size';
                                    state.mode = BAD;
                                    break;
                                }
                                state.dmax = 1 << len;
                                //Tracev((stderr, "inflate:   zlib header ok\n"));
                                strm.adler = state.check = 1 /*adler32(0L, Z_NULL, 0)*/ ;
                                state.mode = hold & 0x200 ? DICTID : TYPE;
                                //=== INITBITS();
                                hold = 0;
                                bits = 0;
                                //===//
                                break;
                            case FLAGS:
                                //=== NEEDBITS(16); */
                                while (bits < 16) {
                                    if (have === 0) {
                                        break inf_leave;
                                    }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                state.flags = hold;
                                if ((state.flags & 0xff) !== Z_DEFLATED) {
                                    strm.msg = 'unknown compression method';
                                    state.mode = BAD;
                                    break;
                                }
                                if (state.flags & 0xe000) {
                                    strm.msg = 'unknown header flags set';
                                    state.mode = BAD;
                                    break;
                                }
                                if (state.head) {
                                    state.head.text = ((hold >> 8) & 1);
                                }
                                if (state.flags & 0x0200) {
                                    //=== CRC2(state.check, hold);
                                    hbuf[0] = hold & 0xff;
                                    hbuf[1] = (hold >>> 8) & 0xff;
                                    state.check = crc32(state.check, hbuf, 2, 0);
                                    //===//
                                }
                                //=== INITBITS();
                                hold = 0;
                                bits = 0;
                                //===//
                                state.mode = TIME;
                                /* falls through */
                            case TIME:
                                //=== NEEDBITS(32); */
                                while (bits < 32) {
                                    if (have === 0) {
                                        break inf_leave;
                                    }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                if (state.head) {
                                    state.head.time = hold;
                                }
                                if (state.flags & 0x0200) {
                                    //=== CRC4(state.check, hold)
                                    hbuf[0] = hold & 0xff;
                                    hbuf[1] = (hold >>> 8) & 0xff;
                                    hbuf[2] = (hold >>> 16) & 0xff;
                                    hbuf[3] = (hold >>> 24) & 0xff;
                                    state.check = crc32(state.check, hbuf, 4, 0);
                                    //===
                                }
                                //=== INITBITS();
                                hold = 0;
                                bits = 0;
                                //===//
                                state.mode = OS;
                                /* falls through */
                            case OS:
                                //=== NEEDBITS(16); */
                                while (bits < 16) {
                                    if (have === 0) {
                                        break inf_leave;
                                    }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                if (state.head) {
                                    state.head.xflags = (hold & 0xff);
                                    state.head.os = (hold >> 8);
                                }
                                if (state.flags & 0x0200) {
                                    //=== CRC2(state.check, hold);
                                    hbuf[0] = hold & 0xff;
                                    hbuf[1] = (hold >>> 8) & 0xff;
                                    state.check = crc32(state.check, hbuf, 2, 0);
                                    //===//
                                }
                                //=== INITBITS();
                                hold = 0;
                                bits = 0;
                                //===//
                                state.mode = EXLEN;
                                /* falls through */
                            case EXLEN:
                                if (state.flags & 0x0400) {
                                    //=== NEEDBITS(16); */
                                    while (bits < 16) {
                                        if (have === 0) {
                                            break inf_leave;
                                        }
                                        have--;
                                        hold += input[next++] << bits;
                                        bits += 8;
                                    }
                                    //===//
                                    state.length = hold;
                                    if (state.head) {
                                        state.head.extra_len = hold;
                                    }
                                    if (state.flags & 0x0200) {
                                        //=== CRC2(state.check, hold);
                                        hbuf[0] = hold & 0xff;
                                        hbuf[1] = (hold >>> 8) & 0xff;
                                        state.check = crc32(state.check, hbuf, 2, 0);
                                        //===//
                                    }
                                    //=== INITBITS();
                                    hold = 0;
                                    bits = 0;
                                    //===//
                                } else if (state.head) {
                                    state.head.extra = null /*Z_NULL*/ ;
                                }
                                state.mode = EXTRA;
                                /* falls through */
                            case EXTRA:
                                if (state.flags & 0x0400) {
                                    copy = state.length;
                                    if (copy > have) {
                                        copy = have;
                                    }
                                    if (copy) {
                                        if (state.head) {
                                            len = state.head.extra_len - state.length;
                                            if (!state.head.extra) {
                                                // Use untyped array for more conveniend processing later
                                                state.head.extra = new Array(state.head.extra_len);
                                            }
                                            utils.arraySet(
                                                state.head.extra,
                                                input,
                                                next,
                                                // extra field is limited to 65536 bytes
                                                // - no need for additional size check
                                                copy,
                                                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                                                len
                                            );
                                            //zmemcpy(state.head.extra + len, next,
                                            //        len + copy > state.head.extra_max ?
                                            //        state.head.extra_max - len : copy);
                                        }
                                        if (state.flags & 0x0200) {
                                            state.check = crc32(state.check, input, copy, next);
                                        }
                                        have -= copy;
                                        next += copy;
                                        state.length -= copy;
                                    }
                                    if (state.length) {
                                        break inf_leave;
                                    }
                                }
                                state.length = 0;
                                state.mode = NAME;
                                /* falls through */
                            case NAME:
                                if (state.flags & 0x0800) {
                                    if (have === 0) {
                                        break inf_leave;
                                    }
                                    copy = 0;
                                    do {
                                        // TODO: 2 or 1 bytes?
                                        len = input[next + copy++];
                                        /* use constant limit because in js we should not preallocate memory */
                                        if (state.head && len &&
                                            (state.length < 65536 /*state.head.name_max*/ )) {
                                            state.head.name += String.fromCharCode(len);
                                        }
                                    } while (len && copy < have);

                                    if (state.flags & 0x0200) {
                                        state.check = crc32(state.check, input, copy, next);
                                    }
                                    have -= copy;
                                    next += copy;
                                    if (len) {
                                        break inf_leave;
                                    }
                                } else if (state.head) {
                                    state.head.name = null;
                                }
                                state.length = 0;
                                state.mode = COMMENT;
                                /* falls through */
                            case COMMENT:
                                if (state.flags & 0x1000) {
                                    if (have === 0) {
                                        break inf_leave;
                                    }
                                    copy = 0;
                                    do {
                                        len = input[next + copy++];
                                        /* use constant limit because in js we should not preallocate memory */
                                        if (state.head && len &&
                                            (state.length < 65536 /*state.head.comm_max*/ )) {
                                            state.head.comment += String.fromCharCode(len);
                                        }
                                    } while (len && copy < have);
                                    if (state.flags & 0x0200) {
                                        state.check = crc32(state.check, input, copy, next);
                                    }
                                    have -= copy;
                                    next += copy;
                                    if (len) {
                                        break inf_leave;
                                    }
                                } else if (state.head) {
                                    state.head.comment = null;
                                }
                                state.mode = HCRC;
                                /* falls through */
                            case HCRC:
                                if (state.flags & 0x0200) {
                                    //=== NEEDBITS(16); */
                                    while (bits < 16) {
                                        if (have === 0) {
                                            break inf_leave;
                                        }
                                        have--;
                                        hold += input[next++] << bits;
                                        bits += 8;
                                    }
                                    //===//
                                    if (hold !== (state.check & 0xffff)) {
                                        strm.msg = 'header crc mismatch';
                                        state.mode = BAD;
                                        break;
                                    }
                                    //=== INITBITS();
                                    hold = 0;
                                    bits = 0;
                                    //===//
                                }
                                if (state.head) {
                                    state.head.hcrc = ((state.flags >> 9) & 1);
                                    state.head.done = true;
                                }
                                strm.adler = state.check = 0;
                                state.mode = TYPE;
                                break;
                            case DICTID:
                                //=== NEEDBITS(32); */
                                while (bits < 32) {
                                    if (have === 0) {
                                        break inf_leave;
                                    }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                strm.adler = state.check = zswap32(hold);
                                //=== INITBITS();
                                hold = 0;
                                bits = 0;
                                //===//
                                state.mode = DICT;
                                /* falls through */
                            case DICT:
                                if (state.havedict === 0) {
                                    //--- RESTORE() ---
                                    strm.next_out = put;
                                    strm.avail_out = left;
                                    strm.next_in = next;
                                    strm.avail_in = have;
                                    state.hold = hold;
                                    state.bits = bits;
                                    //---
                                    return Z_NEED_DICT;
                                }
                                strm.adler = state.check = 1 /*adler32(0L, Z_NULL, 0)*/ ;
                                state.mode = TYPE;
                                /* falls through */
                            case TYPE:
                                if (flush === Z_BLOCK || flush === Z_TREES) {
                                    break inf_leave;
                                }
                                /* falls through */
                            case TYPEDO:
                                if (state.last) {
                                    //--- BYTEBITS() ---//
                                    hold >>>= bits & 7;
                                    bits -= bits & 7;
                                    //---//
                                    state.mode = CHECK;
                                    break;
                                }
                                //=== NEEDBITS(3); */
                                while (bits < 3) {
                                    if (have === 0) {
                                        break inf_leave;
                                    }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                state.last = (hold & 0x01) /*BITS(1)*/ ;
                                //--- DROPBITS(1) ---//
                                hold >>>= 1;
                                bits -= 1;
                                //---//

                                switch ((hold & 0x03) /*BITS(2)*/ ) {
                                    case 0:
                                        /* stored block */
                                        //Tracev((stderr, "inflate:     stored block%s\n",
                                        //        state.last ? " (last)" : ""));
                                        state.mode = STORED;
                                        break;
                                    case 1:
                                        /* fixed block */
                                        fixedtables(state);
                                        //Tracev((stderr, "inflate:     fixed codes block%s\n",
                                        //        state.last ? " (last)" : ""));
                                        state.mode = LEN_; /* decode codes */
                                        if (flush === Z_TREES) {
                                            //--- DROPBITS(2) ---//
                                            hold >>>= 2;
                                            bits -= 2;
                                            //---//
                                            break inf_leave;
                                        }
                                        break;
                                    case 2:
                                        /* dynamic block */
                                        //Tracev((stderr, "inflate:     dynamic codes block%s\n",
                                        //        state.last ? " (last)" : ""));
                                        state.mode = TABLE;
                                        break;
                                    case 3:
                                        strm.msg = 'invalid block type';
                                        state.mode = BAD;
                                }
                                //--- DROPBITS(2) ---//
                                hold >>>= 2;
                                bits -= 2;
                                //---//
                                break;
                            case STORED:
                                //--- BYTEBITS() ---// /* go to byte boundary */
                                hold >>>= bits & 7;
                                bits -= bits & 7;
                                //---//
                                //=== NEEDBITS(32); */
                                while (bits < 32) {
                                    if (have === 0) {
                                        break inf_leave;
                                    }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
                                    strm.msg = 'invalid stored block lengths';
                                    state.mode = BAD;
                                    break;
                                }
                                state.length = hold & 0xffff;
                                //Tracev((stderr, "inflate:       stored length %u\n",
                                //        state.length));
                                //=== INITBITS();
                                hold = 0;
                                bits = 0;
                                //===//
                                state.mode = COPY_;
                                if (flush === Z_TREES) {
                                    break inf_leave;
                                }
                                /* falls through */
                            case COPY_:
                                state.mode = COPY;
                                /* falls through */
                            case COPY:
                                copy = state.length;
                                if (copy) {
                                    if (copy > have) {
                                        copy = have;
                                    }
                                    if (copy > left) {
                                        copy = left;
                                    }
                                    if (copy === 0) {
                                        break inf_leave;
                                    }
                                    //--- zmemcpy(put, next, copy); ---
                                    utils.arraySet(output, input, next, copy, put);
                                    //---//
                                    have -= copy;
                                    next += copy;
                                    left -= copy;
                                    put += copy;
                                    state.length -= copy;
                                    break;
                                }
                                //Tracev((stderr, "inflate:       stored end\n"));
                                state.mode = TYPE;
                                break;
                            case TABLE:
                                //=== NEEDBITS(14); */
                                while (bits < 14) {
                                    if (have === 0) {
                                        break inf_leave;
                                    }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                }
                                //===//
                                state.nlen = (hold & 0x1f) /*BITS(5)*/ + 257;
                                //--- DROPBITS(5) ---//
                                hold >>>= 5;
                                bits -= 5;
                                //---//
                                state.ndist = (hold & 0x1f) /*BITS(5)*/ + 1;
                                //--- DROPBITS(5) ---//
                                hold >>>= 5;
                                bits -= 5;
                                //---//
                                state.ncode = (hold & 0x0f) /*BITS(4)*/ + 4;
                                //--- DROPBITS(4) ---//
                                hold >>>= 4;
                                bits -= 4;
                                //---//
                                //#ifndef PKZIP_BUG_WORKAROUND
                                if (state.nlen > 286 || state.ndist > 30) {
                                    strm.msg = 'too many length or distance symbols';
                                    state.mode = BAD;
                                    break;
                                }
                                //#endif
                                //Tracev((stderr, "inflate:       table sizes ok\n"));
                                state.have = 0;
                                state.mode = LENLENS;
                                /* falls through */
                            case LENLENS:
                                while (state.have < state.ncode) {
                                    //=== NEEDBITS(3);
                                    while (bits < 3) {
                                        if (have === 0) {
                                            break inf_leave;
                                        }
                                        have--;
                                        hold += input[next++] << bits;
                                        bits += 8;
                                    }
                                    //===//
                                    state.lens[order[state.have++]] = (hold & 0x07); //BITS(3);
                                    //--- DROPBITS(3) ---//
                                    hold >>>= 3;
                                    bits -= 3;
                                    //---//
                                }
                                while (state.have < 19) {
                                    state.lens[order[state.have++]] = 0;
                                }
                                // We have separate tables & no pointers. 2 commented lines below not needed.
                                //state.next = state.codes;
                                //state.lencode = state.next;
                                // Switch to use dynamic table
                                state.lencode = state.lendyn;
                                state.lenbits = 7;

                                opts = {
                                    bits: state.lenbits
                                };
                                ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
                                state.lenbits = opts.bits;

                                if (ret) {
                                    strm.msg = 'invalid code lengths set';
                                    state.mode = BAD;
                                    break;
                                }
                                //Tracev((stderr, "inflate:       code lengths ok\n"));
                                state.have = 0;
                                state.mode = CODELENS;
                                /* falls through */
                            case CODELENS:
                                while (state.have < state.nlen + state.ndist) {
                                    for (;;) {
                                        here = state.lencode[hold & ((1 << state.lenbits) - 1)]; /*BITS(state.lenbits)*/
                                        here_bits = here >>> 24;
                                        here_op = (here >>> 16) & 0xff;
                                        here_val = here & 0xffff;

                                        if ((here_bits) <= bits) {
                                            break;
                                        }
                                        //--- PULLBYTE() ---//
                                        if (have === 0) {
                                            break inf_leave;
                                        }
                                        have--;
                                        hold += input[next++] << bits;
                                        bits += 8;
                                        //---//
                                    }
                                    if (here_val < 16) {
                                        //--- DROPBITS(here.bits) ---//
                                        hold >>>= here_bits;
                                        bits -= here_bits;
                                        //---//
                                        state.lens[state.have++] = here_val;
                                    } else {
                                        if (here_val === 16) {
                                            //=== NEEDBITS(here.bits + 2);
                                            n = here_bits + 2;
                                            while (bits < n) {
                                                if (have === 0) {
                                                    break inf_leave;
                                                }
                                                have--;
                                                hold += input[next++] << bits;
                                                bits += 8;
                                            }
                                            //===//
                                            //--- DROPBITS(here.bits) ---//
                                            hold >>>= here_bits;
                                            bits -= here_bits;
                                            //---//
                                            if (state.have === 0) {
                                                strm.msg = 'invalid bit length repeat';
                                                state.mode = BAD;
                                                break;
                                            }
                                            len = state.lens[state.have - 1];
                                            copy = 3 + (hold & 0x03); //BITS(2);
                                            //--- DROPBITS(2) ---//
                                            hold >>>= 2;
                                            bits -= 2;
                                            //---//
                                        } else if (here_val === 17) {
                                            //=== NEEDBITS(here.bits + 3);
                                            n = here_bits + 3;
                                            while (bits < n) {
                                                if (have === 0) {
                                                    break inf_leave;
                                                }
                                                have--;
                                                hold += input[next++] << bits;
                                                bits += 8;
                                            }
                                            //===//
                                            //--- DROPBITS(here.bits) ---//
                                            hold >>>= here_bits;
                                            bits -= here_bits;
                                            //---//
                                            len = 0;
                                            copy = 3 + (hold & 0x07); //BITS(3);
                                            //--- DROPBITS(3) ---//
                                            hold >>>= 3;
                                            bits -= 3;
                                            //---//
                                        } else {
                                            //=== NEEDBITS(here.bits + 7);
                                            n = here_bits + 7;
                                            while (bits < n) {
                                                if (have === 0) {
                                                    break inf_leave;
                                                }
                                                have--;
                                                hold += input[next++] << bits;
                                                bits += 8;
                                            }
                                            //===//
                                            //--- DROPBITS(here.bits) ---//
                                            hold >>>= here_bits;
                                            bits -= here_bits;
                                            //---//
                                            len = 0;
                                            copy = 11 + (hold & 0x7f); //BITS(7);
                                            //--- DROPBITS(7) ---//
                                            hold >>>= 7;
                                            bits -= 7;
                                            //---//
                                        }
                                        if (state.have + copy > state.nlen + state.ndist) {
                                            strm.msg = 'invalid bit length repeat';
                                            state.mode = BAD;
                                            break;
                                        }
                                        while (copy--) {
                                            state.lens[state.have++] = len;
                                        }
                                    }
                                }

                                /* handle error breaks in while */
                                if (state.mode === BAD) {
                                    break;
                                }

                                /* check for end-of-block code (better have one) */
                                if (state.lens[256] === 0) {
                                    strm.msg = 'invalid code -- missing end-of-block';
                                    state.mode = BAD;
                                    break;
                                }

                                /* build code tables -- note: do not change the lenbits or distbits
                                   values here (9 and 6) without reading the comments in inftrees.h
                                   concerning the ENOUGH constants, which depend on those values */
                                state.lenbits = 9;

                                opts = {
                                    bits: state.lenbits
                                };
                                ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
                                // We have separate tables & no pointers. 2 commented lines below not needed.
                                // state.next_index = opts.table_index;
                                state.lenbits = opts.bits;
                                // state.lencode = state.next;

                                if (ret) {
                                    strm.msg = 'invalid literal/lengths set';
                                    state.mode = BAD;
                                    break;
                                }

                                state.distbits = 6;
                                //state.distcode.copy(state.codes);
                                // Switch to use dynamic table
                                state.distcode = state.distdyn;
                                opts = {
                                    bits: state.distbits
                                };
                                ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
                                // We have separate tables & no pointers. 2 commented lines below not needed.
                                // state.next_index = opts.table_index;
                                state.distbits = opts.bits;
                                // state.distcode = state.next;

                                if (ret) {
                                    strm.msg = 'invalid distances set';
                                    state.mode = BAD;
                                    break;
                                }
                                //Tracev((stderr, 'inflate:       codes ok\n'));
                                state.mode = LEN_;
                                if (flush === Z_TREES) {
                                    break inf_leave;
                                }
                                /* falls through */
                            case LEN_:
                                state.mode = LEN;
                                /* falls through */
                            case LEN:
                                if (have >= 6 && left >= 258) {
                                    //--- RESTORE() ---
                                    strm.next_out = put;
                                    strm.avail_out = left;
                                    strm.next_in = next;
                                    strm.avail_in = have;
                                    state.hold = hold;
                                    state.bits = bits;
                                    //---
                                    inflate_fast(strm, _out);
                                    //--- LOAD() ---
                                    put = strm.next_out;
                                    output = strm.output;
                                    left = strm.avail_out;
                                    next = strm.next_in;
                                    input = strm.input;
                                    have = strm.avail_in;
                                    hold = state.hold;
                                    bits = state.bits;
                                    //---

                                    if (state.mode === TYPE) {
                                        state.back = -1;
                                    }
                                    break;
                                }
                                state.back = 0;
                                for (;;) {
                                    here = state.lencode[hold & ((1 << state.lenbits) - 1)]; /*BITS(state.lenbits)*/
                                    here_bits = here >>> 24;
                                    here_op = (here >>> 16) & 0xff;
                                    here_val = here & 0xffff;

                                    if (here_bits <= bits) {
                                        break;
                                    }
                                    //--- PULLBYTE() ---//
                                    if (have === 0) {
                                        break inf_leave;
                                    }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                    //---//
                                }
                                if (here_op && (here_op & 0xf0) === 0) {
                                    last_bits = here_bits;
                                    last_op = here_op;
                                    last_val = here_val;
                                    for (;;) {
                                        here = state.lencode[last_val +
                                            ((hold & ((1 << (last_bits + last_op)) - 1)) /*BITS(last.bits + last.op)*/ >> last_bits)];
                                        here_bits = here >>> 24;
                                        here_op = (here >>> 16) & 0xff;
                                        here_val = here & 0xffff;

                                        if ((last_bits + here_bits) <= bits) {
                                            break;
                                        }
                                        //--- PULLBYTE() ---//
                                        if (have === 0) {
                                            break inf_leave;
                                        }
                                        have--;
                                        hold += input[next++] << bits;
                                        bits += 8;
                                        //---//
                                    }
                                    //--- DROPBITS(last.bits) ---//
                                    hold >>>= last_bits;
                                    bits -= last_bits;
                                    //---//
                                    state.back += last_bits;
                                }
                                //--- DROPBITS(here.bits) ---//
                                hold >>>= here_bits;
                                bits -= here_bits;
                                //---//
                                state.back += here_bits;
                                state.length = here_val;
                                if (here_op === 0) {
                                    //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
                                    //        "inflate:         literal '%c'\n" :
                                    //        "inflate:         literal 0x%02x\n", here.val));
                                    state.mode = LIT;
                                    break;
                                }
                                if (here_op & 32) {
                                    //Tracevv((stderr, "inflate:         end of block\n"));
                                    state.back = -1;
                                    state.mode = TYPE;
                                    break;
                                }
                                if (here_op & 64) {
                                    strm.msg = 'invalid literal/length code';
                                    state.mode = BAD;
                                    break;
                                }
                                state.extra = here_op & 15;
                                state.mode = LENEXT;
                                /* falls through */
                            case LENEXT:
                                if (state.extra) {
                                    //=== NEEDBITS(state.extra);
                                    n = state.extra;
                                    while (bits < n) {
                                        if (have === 0) {
                                            break inf_leave;
                                        }
                                        have--;
                                        hold += input[next++] << bits;
                                        bits += 8;
                                    }
                                    //===//
                                    state.length += hold & ((1 << state.extra) - 1) /*BITS(state.extra)*/ ;
                                    //--- DROPBITS(state.extra) ---//
                                    hold >>>= state.extra;
                                    bits -= state.extra;
                                    //---//
                                    state.back += state.extra;
                                }
                                //Tracevv((stderr, "inflate:         length %u\n", state.length));
                                state.was = state.length;
                                state.mode = DIST;
                                /* falls through */
                            case DIST:
                                for (;;) {
                                    here = state.distcode[hold & ((1 << state.distbits) - 1)]; /*BITS(state.distbits)*/
                                    here_bits = here >>> 24;
                                    here_op = (here >>> 16) & 0xff;
                                    here_val = here & 0xffff;

                                    if ((here_bits) <= bits) {
                                        break;
                                    }
                                    //--- PULLBYTE() ---//
                                    if (have === 0) {
                                        break inf_leave;
                                    }
                                    have--;
                                    hold += input[next++] << bits;
                                    bits += 8;
                                    //---//
                                }
                                if ((here_op & 0xf0) === 0) {
                                    last_bits = here_bits;
                                    last_op = here_op;
                                    last_val = here_val;
                                    for (;;) {
                                        here = state.distcode[last_val +
                                            ((hold & ((1 << (last_bits + last_op)) - 1)) /*BITS(last.bits + last.op)*/ >> last_bits)];
                                        here_bits = here >>> 24;
                                        here_op = (here >>> 16) & 0xff;
                                        here_val = here & 0xffff;

                                        if ((last_bits + here_bits) <= bits) {
                                            break;
                                        }
                                        //--- PULLBYTE() ---//
                                        if (have === 0) {
                                            break inf_leave;
                                        }
                                        have--;
                                        hold += input[next++] << bits;
                                        bits += 8;
                                        //---//
                                    }
                                    //--- DROPBITS(last.bits) ---//
                                    hold >>>= last_bits;
                                    bits -= last_bits;
                                    //---//
                                    state.back += last_bits;
                                }
                                //--- DROPBITS(here.bits) ---//
                                hold >>>= here_bits;
                                bits -= here_bits;
                                //---//
                                state.back += here_bits;
                                if (here_op & 64) {
                                    strm.msg = 'invalid distance code';
                                    state.mode = BAD;
                                    break;
                                }
                                state.offset = here_val;
                                state.extra = (here_op) & 15;
                                state.mode = DISTEXT;
                                /* falls through */
                            case DISTEXT:
                                if (state.extra) {
                                    //=== NEEDBITS(state.extra);
                                    n = state.extra;
                                    while (bits < n) {
                                        if (have === 0) {
                                            break inf_leave;
                                        }
                                        have--;
                                        hold += input[next++] << bits;
                                        bits += 8;
                                    }
                                    //===//
                                    state.offset += hold & ((1 << state.extra) - 1) /*BITS(state.extra)*/ ;
                                    //--- DROPBITS(state.extra) ---//
                                    hold >>>= state.extra;
                                    bits -= state.extra;
                                    //---//
                                    state.back += state.extra;
                                }
                                //#ifdef INFLATE_STRICT
                                if (state.offset > state.dmax) {
                                    strm.msg = 'invalid distance too far back';
                                    state.mode = BAD;
                                    break;
                                }
                                //#endif
                                //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
                                state.mode = MATCH;
                                /* falls through */
                            case MATCH:
                                if (left === 0) {
                                    break inf_leave;
                                }
                                copy = _out - left;
                                if (state.offset > copy) { /* copy from window */
                                    copy = state.offset - copy;
                                    if (copy > state.whave) {
                                        if (state.sane) {
                                            strm.msg = 'invalid distance too far back';
                                            state.mode = BAD;
                                            break;
                                        }
                                        // (!) This block is disabled in zlib defailts,
                                        // don't enable it for binary compatibility
                                        //#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
                                        //          Trace((stderr, "inflate.c too far\n"));
                                        //          copy -= state.whave;
                                        //          if (copy > state.length) { copy = state.length; }
                                        //          if (copy > left) { copy = left; }
                                        //          left -= copy;
                                        //          state.length -= copy;
                                        //          do {
                                        //            output[put++] = 0;
                                        //          } while (--copy);
                                        //          if (state.length === 0) { state.mode = LEN; }
                                        //          break;
                                        //#endif
                                    }
                                    if (copy > state.wnext) {
                                        copy -= state.wnext;
                                        from = state.wsize - copy;
                                    } else {
                                        from = state.wnext - copy;
                                    }
                                    if (copy > state.length) {
                                        copy = state.length;
                                    }
                                    from_source = state.window;
                                } else { /* copy from output */
                                    from_source = output;
                                    from = put - state.offset;
                                    copy = state.length;
                                }
                                if (copy > left) {
                                    copy = left;
                                }
                                left -= copy;
                                state.length -= copy;
                                do {
                                    output[put++] = from_source[from++];
                                } while (--copy);
                                if (state.length === 0) {
                                    state.mode = LEN;
                                }
                                break;
                            case LIT:
                                if (left === 0) {
                                    break inf_leave;
                                }
                                output[put++] = state.length;
                                left--;
                                state.mode = LEN;
                                break;
                            case CHECK:
                                if (state.wrap) {
                                    //=== NEEDBITS(32);
                                    while (bits < 32) {
                                        if (have === 0) {
                                            break inf_leave;
                                        }
                                        have--;
                                        // Use '|' insdead of '+' to make sure that result is signed
                                        hold |= input[next++] << bits;
                                        bits += 8;
                                    }
                                    //===//
                                    _out -= left;
                                    strm.total_out += _out;
                                    state.total += _out;
                                    if (_out) {
                                        strm.adler = state.check =
                                            /*UPDATE(state.check, put - _out, _out);*/
                                            (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

                                    }
                                    _out = left;
                                    // NB: crc32 stored as signed 32-bit int, zswap32 returns signed too
                                    if ((state.flags ? hold : zswap32(hold)) !== state.check) {
                                        strm.msg = 'incorrect data check';
                                        state.mode = BAD;
                                        break;
                                    }
                                    //=== INITBITS();
                                    hold = 0;
                                    bits = 0;
                                    //===//
                                    //Tracev((stderr, "inflate:   check matches trailer\n"));
                                }
                                state.mode = LENGTH;
                                /* falls through */
                            case LENGTH:
                                if (state.wrap && state.flags) {
                                    //=== NEEDBITS(32);
                                    while (bits < 32) {
                                        if (have === 0) {
                                            break inf_leave;
                                        }
                                        have--;
                                        hold += input[next++] << bits;
                                        bits += 8;
                                    }
                                    //===//
                                    if (hold !== (state.total & 0xffffffff)) {
                                        strm.msg = 'incorrect length check';
                                        state.mode = BAD;
                                        break;
                                    }
                                    //=== INITBITS();
                                    hold = 0;
                                    bits = 0;
                                    //===//
                                    //Tracev((stderr, "inflate:   length matches trailer\n"));
                                }
                                state.mode = DONE;
                                /* falls through */
                            case DONE:
                                ret = Z_STREAM_END;
                                break inf_leave;
                            case BAD:
                                ret = Z_DATA_ERROR;
                                break inf_leave;
                            case MEM:
                                return Z_MEM_ERROR;
                            case SYNC:
                                /* falls through */
                            default:
                                return Z_STREAM_ERROR;
                        }
                    }

                // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

                /*
                   Return from inflate(), updating the total counts and the check value.
                   If there was no progress during the inflate() call, return a buffer
                   error.  Call updatewindow() to create and/or update the window state.
                   Note: a memory error from inflate() is non-recoverable.
                 */

                //--- RESTORE() ---
                strm.next_out = put;
                strm.avail_out = left;
                strm.next_in = next;
                strm.avail_in = have;
                state.hold = hold;
                state.bits = bits;
                //---

                if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
                        (state.mode < CHECK || flush !== Z_FINISH))) {
                    if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
                        state.mode = MEM;
                        return Z_MEM_ERROR;
                    }
                }
                _in -= strm.avail_in;
                _out -= strm.avail_out;
                strm.total_in += _in;
                strm.total_out += _out;
                state.total += _out;
                if (state.wrap && _out) {
                    strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
                        (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
                }
                strm.data_type = state.bits + (state.last ? 64 : 0) +
                    (state.mode === TYPE ? 128 : 0) +
                    (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
                if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
                    ret = Z_BUF_ERROR;
                }
                return ret;
            }

            function inflateEnd(strm) {

                if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/ ) {
                    return Z_STREAM_ERROR;
                }

                var state = strm.state;
                if (state.window) {
                    state.window = null;
                }
                strm.state = null;
                return Z_OK;
            }

            function inflateGetHeader(strm, head) {
                var state;

                /* check state */
                if (!strm || !strm.state) {
                    return Z_STREAM_ERROR;
                }
                state = strm.state;
                if ((state.wrap & 2) === 0) {
                    return Z_STREAM_ERROR;
                }

                /* save header structure */
                state.head = head;
                head.done = false;
                return Z_OK;
            }

            function inflateSetDictionary(strm, dictionary) {
                var dictLength = dictionary.length;

                var state;
                var dictid;
                var ret;

                /* check state */
                if (!strm /* == Z_NULL */ || !strm.state /* == Z_NULL */ ) {
                    return Z_STREAM_ERROR;
                }
                state = strm.state;

                if (state.wrap !== 0 && state.mode !== DICT) {
                    return Z_STREAM_ERROR;
                }

                /* check for correct dictionary identifier */
                if (state.mode === DICT) {
                    dictid = 1; /* adler32(0, null, 0)*/
                    /* dictid = adler32(dictid, dictionary, dictLength); */
                    dictid = adler32(dictid, dictionary, dictLength, 0);
                    if (dictid !== state.check) {
                        return Z_DATA_ERROR;
                    }
                }
                /* copy dictionary to window using updatewindow(), which will amend the
                 existing dictionary if appropriate */
                ret = updatewindow(strm, dictionary, dictLength, dictLength);
                if (ret) {
                    state.mode = MEM;
                    return Z_MEM_ERROR;
                }
                state.havedict = 1;
                // Tracev((stderr, "inflate:   dictionary set\n"));
                return Z_OK;
            }

            exports.inflateReset = inflateReset;
            exports.inflateReset2 = inflateReset2;
            exports.inflateResetKeep = inflateResetKeep;
            exports.inflateInit = inflateInit;
            exports.inflateInit2 = inflateInit2;
            exports.inflate = inflate;
            exports.inflateEnd = inflateEnd;
            exports.inflateGetHeader = inflateGetHeader;
            exports.inflateSetDictionary = inflateSetDictionary;
            exports.inflateInfo = 'pako inflate (from Nodeca project)';

            /* Not implemented
            exports.inflateCopy = inflateCopy;
            exports.inflateGetDictionary = inflateGetDictionary;
            exports.inflateMark = inflateMark;
            exports.inflatePrime = inflatePrime;
            exports.inflateSync = inflateSync;
            exports.inflateSyncPoint = inflateSyncPoint;
            exports.inflateUndermine = inflateUndermine;
            */

        }, {
            "../utils/common": 62,
            "./adler32": 64,
            "./crc32": 66,
            "./inffast": 69,
            "./inftrees": 71
        }],
        71: [function(require, module, exports) {
            'use strict';

            // (C) 1995-2013 Jean-loup Gailly and Mark Adler
            // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
            //
            // This software is provided 'as-is', without any express or implied
            // warranty. In no event will the authors be held liable for any damages
            // arising from the use of this software.
            //
            // Permission is granted to anyone to use this software for any purpose,
            // including commercial applications, and to alter it and redistribute it
            // freely, subject to the following restrictions:
            //
            // 1. The origin of this software must not be misrepresented; you must not
            //   claim that you wrote the original software. If you use this software
            //   in a product, an acknowledgment in the product documentation would be
            //   appreciated but is not required.
            // 2. Altered source versions must be plainly marked as such, and must not be
            //   misrepresented as being the original software.
            // 3. This notice may not be removed or altered from any source distribution.

            var utils = require('../utils/common');

            var MAXBITS = 15;
            var ENOUGH_LENS = 852;
            var ENOUGH_DISTS = 592;
            //var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

            var CODES = 0;
            var LENS = 1;
            var DISTS = 2;

            var lbase = [ /* Length codes 257..285 base */
                3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
                35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
            ];

            var lext = [ /* Length codes 257..285 extra */
                16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
                19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
            ];

            var dbase = [ /* Distance codes 0..29 base */
                1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
                257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
                8193, 12289, 16385, 24577, 0, 0
            ];

            var dext = [ /* Distance codes 0..29 extra */
                16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
                23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
                28, 28, 29, 29, 64, 64
            ];

            module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
                var bits = opts.bits;
                //here = opts.here; /* table entry for duplication */

                var len = 0; /* a code's length in bits */
                var sym = 0; /* index of code symbols */
                var min = 0,
                    max = 0; /* minimum and maximum code lengths */
                var root = 0; /* number of index bits for root table */
                var curr = 0; /* number of index bits for current table */
                var drop = 0; /* code bits to drop for sub-table */
                var left = 0; /* number of prefix codes available */
                var used = 0; /* code entries in table used */
                var huff = 0; /* Huffman code */
                var incr; /* for incrementing code, index */
                var fill; /* index for replicating entries */
                var low; /* low bits for current root entry */
                var mask; /* mask for low root bits */
                var next; /* next available space in table */
                var base = null; /* base value table to use */
                var base_index = 0;
                //  var shoextra;    /* extra bits table to use */
                var end; /* use base and extra for symbol > end */
                var count = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
                var offs = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
                var extra = null;
                var extra_index = 0;

                var here_bits, here_op, here_val;

                /*
                 Process a set of code lengths to create a canonical Huffman code.  The
                 code lengths are lens[0..codes-1].  Each length corresponds to the
                 symbols 0..codes-1.  The Huffman code is generated by first sorting the
                 symbols by length from short to long, and retaining the symbol order
                 for codes with equal lengths.  Then the code starts with all zero bits
                 for the first code of the shortest length, and the codes are integer
                 increments for the same length, and zeros are appended as the length
                 increases.  For the deflate format, these bits are stored backwards
                 from their more natural integer increment ordering, and so when the
                 decoding tables are built in the large loop below, the integer codes
                 are incremented backwards.

                 This routine assumes, but does not check, that all of the entries in
                 lens[] are in the range 0..MAXBITS.  The caller must assure this.
                 1..MAXBITS is interpreted as that code length.  zero means that that
                 symbol does not occur in this code.

                 The codes are sorted by computing a count of codes for each length,
                 creating from that a table of starting indices for each length in the
                 sorted table, and then entering the symbols in order in the sorted
                 table.  The sorted table is work[], with that space being provided by
                 the caller.

                 The length counts are used for other purposes as well, i.e. finding
                 the minimum and maximum length codes, determining if there are any
                 codes at all, checking for a valid set of lengths, and looking ahead
                 at length counts to determine sub-table sizes when building the
                 decoding tables.
                 */

                /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
                for (len = 0; len <= MAXBITS; len++) {
                    count[len] = 0;
                }
                for (sym = 0; sym < codes; sym++) {
                    count[lens[lens_index + sym]]++;
                }

                /* bound code lengths, force root to be within code lengths */
                root = bits;
                for (max = MAXBITS; max >= 1; max--) {
                    if (count[max] !== 0) {
                        break;
                    }
                }
                if (root > max) {
                    root = max;
                }
                if (max === 0) { /* no symbols to code at all */
                    //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
                    //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
                    //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
                    table[table_index++] = (1 << 24) | (64 << 16) | 0;


                    //table.op[opts.table_index] = 64;
                    //table.bits[opts.table_index] = 1;
                    //table.val[opts.table_index++] = 0;
                    table[table_index++] = (1 << 24) | (64 << 16) | 0;

                    opts.bits = 1;
                    return 0; /* no symbols, but wait for decoding to report error */
                }
                for (min = 1; min < max; min++) {
                    if (count[min] !== 0) {
                        break;
                    }
                }
                if (root < min) {
                    root = min;
                }

                /* check for an over-subscribed or incomplete set of lengths */
                left = 1;
                for (len = 1; len <= MAXBITS; len++) {
                    left <<= 1;
                    left -= count[len];
                    if (left < 0) {
                        return -1;
                    } /* over-subscribed */
                }
                if (left > 0 && (type === CODES || max !== 1)) {
                    return -1; /* incomplete set */
                }

                /* generate offsets into symbol table for each length for sorting */
                offs[1] = 0;
                for (len = 1; len < MAXBITS; len++) {
                    offs[len + 1] = offs[len] + count[len];
                }

                /* sort symbols by length, by symbol order within each length */
                for (sym = 0; sym < codes; sym++) {
                    if (lens[lens_index + sym] !== 0) {
                        work[offs[lens[lens_index + sym]]++] = sym;
                    }
                }

                /*
                 Create and fill in decoding tables.  In this loop, the table being
                 filled is at next and has curr index bits.  The code being used is huff
                 with length len.  That code is converted to an index by dropping drop
                 bits off of the bottom.  For codes where len is less than drop + curr,
                 those top drop + curr - len bits are incremented through all values to
                 fill the table with replicated entries.

                 root is the number of index bits for the root table.  When len exceeds
                 root, sub-tables are created pointed to by the root entry with an index
                 of the low root bits of huff.  This is saved in low to check for when a
                 new sub-table should be started.  drop is zero when the root table is
                 being filled, and drop is root when sub-tables are being filled.

                 When a new sub-table is needed, it is necessary to look ahead in the
                 code lengths to determine what size sub-table is needed.  The length
                 counts are used for this, and so count[] is decremented as codes are
                 entered in the tables.

                 used keeps track of how many table entries have been allocated from the
                 provided *table space.  It is checked for LENS and DIST tables against
                 the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
                 the initial root table size constants.  See the comments in inftrees.h
                 for more information.

                 sym increments through all symbols, and the loop terminates when
                 all codes of length max, i.e. all codes, have been processed.  This
                 routine permits incomplete codes, so another loop after this one fills
                 in the rest of the decoding tables with invalid code markers.
                 */

                /* set up for code type */
                // poor man optimization - use if-else instead of switch,
                // to avoid deopts in old v8
                if (type === CODES) {
                    base = extra = work; /* dummy value--not used */
                    end = 19;

                } else if (type === LENS) {
                    base = lbase;
                    base_index -= 257;
                    extra = lext;
                    extra_index -= 257;
                    end = 256;

                } else { /* DISTS */
                    base = dbase;
                    extra = dext;
                    end = -1;
                }

                /* initialize opts for loop */
                huff = 0; /* starting code */
                sym = 0; /* starting code symbol */
                len = min; /* starting code length */
                next = table_index; /* current table to fill in */
                curr = root; /* current table index bits */
                drop = 0; /* current bits to drop from code for index */
                low = -1; /* trigger new sub-table when len > root */
                used = 1 << root; /* use root table entries */
                mask = used - 1; /* mask for comparing low */

                /* check available table space */
                if ((type === LENS && used > ENOUGH_LENS) ||
                    (type === DISTS && used > ENOUGH_DISTS)) {
                    return 1;
                }

                /* process all codes and make table entries */
                for (;;) {
                    /* create table entry */
                    here_bits = len - drop;
                    if (work[sym] < end) {
                        here_op = 0;
                        here_val = work[sym];
                    } else if (work[sym] > end) {
                        here_op = extra[extra_index + work[sym]];
                        here_val = base[base_index + work[sym]];
                    } else {
                        here_op = 32 + 64; /* end of block */
                        here_val = 0;
                    }

                    /* replicate for those indices with low len bits equal to huff */
                    incr = 1 << (len - drop);
                    fill = 1 << curr;
                    min = fill; /* save offset to next table */
                    do {
                        fill -= incr;
                        table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val | 0;
                    } while (fill !== 0);

                    /* backwards increment the len-bit code huff */
                    incr = 1 << (len - 1);
                    while (huff & incr) {
                        incr >>= 1;
                    }
                    if (incr !== 0) {
                        huff &= incr - 1;
                        huff += incr;
                    } else {
                        huff = 0;
                    }

                    /* go to next symbol, update count, len */
                    sym++;
                    if (--count[len] === 0) {
                        if (len === max) {
                            break;
                        }
                        len = lens[lens_index + work[sym]];
                    }

                    /* create new sub-table if needed */
                    if (len > root && (huff & mask) !== low) {
                        /* if first time, transition to sub-tables */
                        if (drop === 0) {
                            drop = root;
                        }

                        /* increment past last table */
                        next += min; /* here min is 1 << curr */

                        /* determine length of next table */
                        curr = len - drop;
                        left = 1 << curr;
                        while (curr + drop < max) {
                            left -= count[curr + drop];
                            if (left <= 0) {
                                break;
                            }
                            curr++;
                            left <<= 1;
                        }

                        /* check for enough space */
                        used += 1 << curr;
                        if ((type === LENS && used > ENOUGH_LENS) ||
                            (type === DISTS && used > ENOUGH_DISTS)) {
                            return 1;
                        }

                        /* point entry in root table to sub-table */
                        low = huff & mask;
                        /*table.op[low] = curr;
                        table.bits[low] = root;
                        table.val[low] = next - opts.table_index;*/
                        table[low] = (root << 24) | (curr << 16) | (next - table_index) | 0;
                    }
                }

                /* fill in remaining table entry if code is incomplete (guaranteed to have
                 at most one remaining entry, since if the code is incomplete, the
                 maximum code length that was allowed to get this far is one bit) */
                if (huff !== 0) {
                    //table.op[next + huff] = 64;            /* invalid code marker */
                    //table.bits[next + huff] = len - drop;
                    //table.val[next + huff] = 0;
                    table[next + huff] = ((len - drop) << 24) | (64 << 16) | 0;
                }

                /* set return parameters */
                //opts.table_index += used;
                opts.bits = root;
                return 0;
            };

        }, {
            "../utils/common": 62
        }],
        72: [function(require, module, exports) {
            'use strict';

            // (C) 1995-2013 Jean-loup Gailly and Mark Adler
            // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
            //
            // This software is provided 'as-is', without any express or implied
            // warranty. In no event will the authors be held liable for any damages
            // arising from the use of this software.
            //
            // Permission is granted to anyone to use this software for any purpose,
            // including commercial applications, and to alter it and redistribute it
            // freely, subject to the following restrictions:
            //
            // 1. The origin of this software must not be misrepresented; you must not
            //   claim that you wrote the original software. If you use this software
            //   in a product, an acknowledgment in the product documentation would be
            //   appreciated but is not required.
            // 2. Altered source versions must be plainly marked as such, and must not be
            //   misrepresented as being the original software.
            // 3. This notice may not be removed or altered from any source distribution.

            module.exports = {
                2: 'need dictionary',
                /* Z_NEED_DICT       2  */
                1: 'stream end',
                /* Z_STREAM_END      1  */
                0: '',
                /* Z_OK              0  */
                '-1': 'file error',
                /* Z_ERRNO         (-1) */
                '-2': 'stream error',
                /* Z_STREAM_ERROR  (-2) */
                '-3': 'data error',
                /* Z_DATA_ERROR    (-3) */
                '-4': 'insufficient memory',
                /* Z_MEM_ERROR     (-4) */
                '-5': 'buffer error',
                /* Z_BUF_ERROR     (-5) */
                '-6': 'incompatible version' /* Z_VERSION_ERROR (-6) */
            };

        }, {}],
        73: [function(require, module, exports) {
            'use strict';

            // (C) 1995-2013 Jean-loup Gailly and Mark Adler
            // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
            //
            // This software is provided 'as-is', without any express or implied
            // warranty. In no event will the authors be held liable for any damages
            // arising from the use of this software.
            //
            // Permission is granted to anyone to use this software for any purpose,
            // including commercial applications, and to alter it and redistribute it
            // freely, subject to the following restrictions:
            //
            // 1. The origin of this software must not be misrepresented; you must not
            //   claim that you wrote the original software. If you use this software
            //   in a product, an acknowledgment in the product documentation would be
            //   appreciated but is not required.
            // 2. Altered source versions must be plainly marked as such, and must not be
            //   misrepresented as being the original software.
            // 3. This notice may not be removed or altered from any source distribution.

            var utils = require('../utils/common');

            /* Public constants ==========================================================*/
            /* ===========================================================================*/


            //var Z_FILTERED          = 1;
            //var Z_HUFFMAN_ONLY      = 2;
            //var Z_RLE               = 3;
            var Z_FIXED = 4;
            //var Z_DEFAULT_STRATEGY  = 0;

            /* Possible values of the data_type field (though see inflate()) */
            var Z_BINARY = 0;
            var Z_TEXT = 1;
            //var Z_ASCII             = 1; // = Z_TEXT
            var Z_UNKNOWN = 2;

            /*============================================================================*/


            function zero(buf) {
                var len = buf.length;
                while (--len >= 0) {
                    buf[len] = 0;
                }
            }

            // From zutil.h

            var STORED_BLOCK = 0;
            var STATIC_TREES = 1;
            var DYN_TREES = 2;
            /* The three kinds of block type */

            var MIN_MATCH = 3;
            var MAX_MATCH = 258;
            /* The minimum and maximum match lengths */

            // From deflate.h
            /* ===========================================================================
             * Internal compression state.
             */

            var LENGTH_CODES = 29;
            /* number of length codes, not counting the special END_BLOCK code */

            var LITERALS = 256;
            /* number of literal bytes 0..255 */

            var L_CODES = LITERALS + 1 + LENGTH_CODES;
            /* number of Literal or Length codes, including the END_BLOCK code */

            var D_CODES = 30;
            /* number of distance codes */

            var BL_CODES = 19;
            /* number of codes used to transfer the bit lengths */

            var HEAP_SIZE = 2 * L_CODES + 1;
            /* maximum heap size */

            var MAX_BITS = 15;
            /* All codes must not exceed MAX_BITS bits */

            var Buf_size = 16;
            /* size of bit buffer in bi_buf */


            /* ===========================================================================
             * Constants
             */

            var MAX_BL_BITS = 7;
            /* Bit length codes must not exceed MAX_BL_BITS bits */

            var END_BLOCK = 256;
            /* end of block literal code */

            var REP_3_6 = 16;
            /* repeat previous bit length 3-6 times (2 bits of repeat count) */

            var REPZ_3_10 = 17;
            /* repeat a zero length 3-10 times  (3 bits of repeat count) */

            var REPZ_11_138 = 18;
            /* repeat a zero length 11-138 times  (7 bits of repeat count) */

            /* eslint-disable comma-spacing,array-bracket-spacing */
            var extra_lbits = /* extra bits for each length code */
                [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];

            var extra_dbits = /* extra bits for each distance code */
                [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];

            var extra_blbits = /* extra bits for each bit length code */
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7];

            var bl_order =
                [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
            /* eslint-enable comma-spacing,array-bracket-spacing */

            /* The lengths of the bit length codes are sent in order of decreasing
             * probability, to avoid transmitting the lengths for unused bit length codes.
             */

            /* ===========================================================================
             * Local data. These are initialized only once.
             */

            // We pre-fill arrays with 0 to avoid uninitialized gaps

            var DIST_CODE_LEN = 512; /* see definition of array dist_code below */

            // !!!! Use flat array insdead of structure, Freq = i*2, Len = i*2+1
            var static_ltree = new Array((L_CODES + 2) * 2);
            zero(static_ltree);
            /* The static literal tree. Since the bit lengths are imposed, there is no
             * need for the L_CODES extra codes used during heap construction. However
             * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
             * below).
             */

            var static_dtree = new Array(D_CODES * 2);
            zero(static_dtree);
            /* The static distance tree. (Actually a trivial tree since all codes use
             * 5 bits.)
             */

            var _dist_code = new Array(DIST_CODE_LEN);
            zero(_dist_code);
            /* Distance codes. The first 256 values correspond to the distances
             * 3 .. 258, the last 256 values correspond to the top 8 bits of
             * the 15 bit distances.
             */

            var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
            zero(_length_code);
            /* length code for each normalized match length (0 == MIN_MATCH) */

            var base_length = new Array(LENGTH_CODES);
            zero(base_length);
            /* First normalized length for each code (0 = MIN_MATCH) */

            var base_dist = new Array(D_CODES);
            zero(base_dist);
            /* First normalized distance for each code (0 = distance of 1) */


            function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {

                this.static_tree = static_tree; /* static tree or NULL */
                this.extra_bits = extra_bits; /* extra bits for each code or NULL */
                this.extra_base = extra_base; /* base index for extra_bits */
                this.elems = elems; /* max number of elements in the tree */
                this.max_length = max_length; /* max bit length for the codes */

                // show if `static_tree` has data or dummy - needed for monomorphic objects
                this.has_stree = static_tree && static_tree.length;
            }


            var static_l_desc;
            var static_d_desc;
            var static_bl_desc;


            function TreeDesc(dyn_tree, stat_desc) {
                this.dyn_tree = dyn_tree; /* the dynamic tree */
                this.max_code = 0; /* largest code with non zero frequency */
                this.stat_desc = stat_desc; /* the corresponding static tree */
            }



            function d_code(dist) {
                return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
            }


            /* ===========================================================================
             * Output a short LSB first on the stream.
             * IN assertion: there is enough room in pendingBuf.
             */
            function put_short(s, w) {
                //    put_byte(s, (uch)((w) & 0xff));
                //    put_byte(s, (uch)((ush)(w) >> 8));
                s.pending_buf[s.pending++] = (w) & 0xff;
                s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
            }


            /* ===========================================================================
             * Send a value on a given number of bits.
             * IN assertion: length <= 16 and value fits in length bits.
             */
            function send_bits(s, value, length) {
                if (s.bi_valid > (Buf_size - length)) {
                    s.bi_buf |= (value << s.bi_valid) & 0xffff;
                    put_short(s, s.bi_buf);
                    s.bi_buf = value >> (Buf_size - s.bi_valid);
                    s.bi_valid += length - Buf_size;
                } else {
                    s.bi_buf |= (value << s.bi_valid) & 0xffff;
                    s.bi_valid += length;
                }
            }


            function send_code(s, c, tree) {
                send_bits(s, tree[c * 2] /*.Code*/ , tree[c * 2 + 1] /*.Len*/ );
            }


            /* ===========================================================================
             * Reverse the first len bits of a code, using straightforward code (a faster
             * method would use a table)
             * IN assertion: 1 <= len <= 15
             */
            function bi_reverse(code, len) {
                var res = 0;
                do {
                    res |= code & 1;
                    code >>>= 1;
                    res <<= 1;
                } while (--len > 0);
                return res >>> 1;
            }


            /* ===========================================================================
             * Flush the bit buffer, keeping at most 7 bits in it.
             */
            function bi_flush(s) {
                if (s.bi_valid === 16) {
                    put_short(s, s.bi_buf);
                    s.bi_buf = 0;
                    s.bi_valid = 0;

                } else if (s.bi_valid >= 8) {
                    s.pending_buf[s.pending++] = s.bi_buf & 0xff;
                    s.bi_buf >>= 8;
                    s.bi_valid -= 8;
                }
            }


            /* ===========================================================================
             * Compute the optimal bit lengths for a tree and update the total bit length
             * for the current block.
             * IN assertion: the fields freq and dad are set, heap[heap_max] and
             *    above are the tree nodes sorted by increasing frequency.
             * OUT assertions: the field len is set to the optimal bit length, the
             *     array bl_count contains the frequencies for each bit length.
             *     The length opt_len is updated; static_len is also updated if stree is
             *     not null.
             */
            function gen_bitlen(s, desc)
            //    deflate_state *s;
            //    tree_desc *desc;    /* the tree descriptor */
            {
                var tree = desc.dyn_tree;
                var max_code = desc.max_code;
                var stree = desc.stat_desc.static_tree;
                var has_stree = desc.stat_desc.has_stree;
                var extra = desc.stat_desc.extra_bits;
                var base = desc.stat_desc.extra_base;
                var max_length = desc.stat_desc.max_length;
                var h; /* heap index */
                var n, m; /* iterate over the tree elements */
                var bits; /* bit length */
                var xbits; /* extra bits */
                var f; /* frequency */
                var overflow = 0; /* number of elements with bit length too large */

                for (bits = 0; bits <= MAX_BITS; bits++) {
                    s.bl_count[bits] = 0;
                }

                /* In a first pass, compute the optimal bit lengths (which may
                 * overflow in the case of the bit length tree).
                 */
                tree[s.heap[s.heap_max] * 2 + 1] /*.Len*/ = 0; /* root of the heap */

                for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
                    n = s.heap[h];
                    bits = tree[tree[n * 2 + 1] /*.Dad*/ * 2 + 1] /*.Len*/ + 1;
                    if (bits > max_length) {
                        bits = max_length;
                        overflow++;
                    }
                    tree[n * 2 + 1] /*.Len*/ = bits;
                    /* We overwrite tree[n].Dad which is no longer needed */

                    if (n > max_code) {
                        continue;
                    } /* not a leaf node */

                    s.bl_count[bits]++;
                    xbits = 0;
                    if (n >= base) {
                        xbits = extra[n - base];
                    }
                    f = tree[n * 2] /*.Freq*/ ;
                    s.opt_len += f * (bits + xbits);
                    if (has_stree) {
                        s.static_len += f * (stree[n * 2 + 1] /*.Len*/ + xbits);
                    }
                }
                if (overflow === 0) {
                    return;
                }

                // Trace((stderr,"\nbit length overflow\n"));
                /* This happens for example on obj2 and pic of the Calgary corpus */

                /* Find the first bit length which could increase: */
                do {
                    bits = max_length - 1;
                    while (s.bl_count[bits] === 0) {
                        bits--;
                    }
                    s.bl_count[bits]--; /* move one leaf down the tree */
                    s.bl_count[bits + 1] += 2; /* move one overflow item as its brother */
                    s.bl_count[max_length]--;
                    /* The brother of the overflow item also moves one step up,
                     * but this does not affect bl_count[max_length]
                     */
                    overflow -= 2;
                } while (overflow > 0);

                /* Now recompute all bit lengths, scanning in increasing frequency.
                 * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
                 * lengths instead of fixing only the wrong ones. This idea is taken
                 * from 'ar' written by Haruhiko Okumura.)
                 */
                for (bits = max_length; bits !== 0; bits--) {
                    n = s.bl_count[bits];
                    while (n !== 0) {
                        m = s.heap[--h];
                        if (m > max_code) {
                            continue;
                        }
                        if (tree[m * 2 + 1] /*.Len*/ !== bits) {
                            // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
                            s.opt_len += (bits - tree[m * 2 + 1] /*.Len*/ ) * tree[m * 2] /*.Freq*/ ;
                            tree[m * 2 + 1] /*.Len*/ = bits;
                        }
                        n--;
                    }
                }
            }


            /* ===========================================================================
             * Generate the codes for a given tree and bit counts (which need not be
             * optimal).
             * IN assertion: the array bl_count contains the bit length statistics for
             * the given tree and the field len is set for all tree elements.
             * OUT assertion: the field code is set for all tree elements of non
             *     zero code length.
             */
            function gen_codes(tree, max_code, bl_count)
            //    ct_data *tree;             /* the tree to decorate */
            //    int max_code;              /* largest code with non zero frequency */
            //    ushf *bl_count;            /* number of codes at each bit length */
            {
                var next_code = new Array(MAX_BITS + 1); /* next code value for each bit length */
                var code = 0; /* running code value */
                var bits; /* bit index */
                var n; /* code index */

                /* The distribution counts are first used to generate the code values
                 * without bit reversal.
                 */
                for (bits = 1; bits <= MAX_BITS; bits++) {
                    next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
                }
                /* Check that the bit counts in bl_count are consistent. The last code
                 * must be all ones.
                 */
                //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
                //        "inconsistent bit counts");
                //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

                for (n = 0; n <= max_code; n++) {
                    var len = tree[n * 2 + 1] /*.Len*/ ;
                    if (len === 0) {
                        continue;
                    }
                    /* Now reverse the bits */
                    tree[n * 2] /*.Code*/ = bi_reverse(next_code[len]++, len);

                    //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
                    //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
                }
            }


            /* ===========================================================================
             * Initialize the various 'constant' tables.
             */
            function tr_static_init() {
                var n; /* iterates over tree elements */
                var bits; /* bit counter */
                var length; /* length value */
                var code; /* code value */
                var dist; /* distance index */
                var bl_count = new Array(MAX_BITS + 1);
                /* number of codes at each bit length for an optimal tree */

                // do check in _tr_init()
                //if (static_init_done) return;

                /* For some embedded targets, global variables are not initialized: */
                /*#ifdef NO_INIT_GLOBAL_POINTERS
                  static_l_desc.static_tree = static_ltree;
                  static_l_desc.extra_bits = extra_lbits;
                  static_d_desc.static_tree = static_dtree;
                  static_d_desc.extra_bits = extra_dbits;
                  static_bl_desc.extra_bits = extra_blbits;
                #endif*/

                /* Initialize the mapping length (0..255) -> length code (0..28) */
                length = 0;
                for (code = 0; code < LENGTH_CODES - 1; code++) {
                    base_length[code] = length;
                    for (n = 0; n < (1 << extra_lbits[code]); n++) {
                        _length_code[length++] = code;
                    }
                }
                //Assert (length == 256, "tr_static_init: length != 256");
                /* Note that the length 255 (match length 258) can be represented
                 * in two different ways: code 284 + 5 bits or code 285, so we
                 * overwrite length_code[255] to use the best encoding:
                 */
                _length_code[length - 1] = code;

                /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
                dist = 0;
                for (code = 0; code < 16; code++) {
                    base_dist[code] = dist;
                    for (n = 0; n < (1 << extra_dbits[code]); n++) {
                        _dist_code[dist++] = code;
                    }
                }
                //Assert (dist == 256, "tr_static_init: dist != 256");
                dist >>= 7; /* from now on, all distances are divided by 128 */
                for (; code < D_CODES; code++) {
                    base_dist[code] = dist << 7;
                    for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
                        _dist_code[256 + dist++] = code;
                    }
                }
                //Assert (dist == 256, "tr_static_init: 256+dist != 512");

                /* Construct the codes of the static literal tree */
                for (bits = 0; bits <= MAX_BITS; bits++) {
                    bl_count[bits] = 0;
                }

                n = 0;
                while (n <= 143) {
                    static_ltree[n * 2 + 1] /*.Len*/ = 8;
                    n++;
                    bl_count[8]++;
                }
                while (n <= 255) {
                    static_ltree[n * 2 + 1] /*.Len*/ = 9;
                    n++;
                    bl_count[9]++;
                }
                while (n <= 279) {
                    static_ltree[n * 2 + 1] /*.Len*/ = 7;
                    n++;
                    bl_count[7]++;
                }
                while (n <= 287) {
                    static_ltree[n * 2 + 1] /*.Len*/ = 8;
                    n++;
                    bl_count[8]++;
                }
                /* Codes 286 and 287 do not exist, but we must include them in the
                 * tree construction to get a canonical Huffman tree (longest code
                 * all ones)
                 */
                gen_codes(static_ltree, L_CODES + 1, bl_count);

                /* The static distance tree is trivial: */
                for (n = 0; n < D_CODES; n++) {
                    static_dtree[n * 2 + 1] /*.Len*/ = 5;
                    static_dtree[n * 2] /*.Code*/ = bi_reverse(n, 5);
                }

                // Now data ready and we can init static trees
                static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
                static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
                static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);

                //static_init_done = true;
            }


            /* ===========================================================================
             * Initialize a new block.
             */
            function init_block(s) {
                var n; /* iterates over tree elements */

                /* Initialize the trees. */
                for (n = 0; n < L_CODES; n++) {
                    s.dyn_ltree[n * 2] /*.Freq*/ = 0;
                }
                for (n = 0; n < D_CODES; n++) {
                    s.dyn_dtree[n * 2] /*.Freq*/ = 0;
                }
                for (n = 0; n < BL_CODES; n++) {
                    s.bl_tree[n * 2] /*.Freq*/ = 0;
                }

                s.dyn_ltree[END_BLOCK * 2] /*.Freq*/ = 1;
                s.opt_len = s.static_len = 0;
                s.last_lit = s.matches = 0;
            }


            /* ===========================================================================
             * Flush the bit buffer and align the output on a byte boundary
             */
            function bi_windup(s) {
                if (s.bi_valid > 8) {
                    put_short(s, s.bi_buf);
                } else if (s.bi_valid > 0) {
                    //put_byte(s, (Byte)s->bi_buf);
                    s.pending_buf[s.pending++] = s.bi_buf;
                }
                s.bi_buf = 0;
                s.bi_valid = 0;
            }

            /* ===========================================================================
             * Copy a stored block, storing first the length and its
             * one's complement if requested.
             */
            function copy_block(s, buf, len, header)
            //DeflateState *s;
            //charf    *buf;    /* the input data */
            //unsigned len;     /* its length */
            //int      header;  /* true if block header must be written */
            {
                bi_windup(s); /* align on byte boundary */

                if (header) {
                    put_short(s, len);
                    put_short(s, ~len);
                }
                //  while (len--) {
                //    put_byte(s, *buf++);
                //  }
                utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
                s.pending += len;
            }

            /* ===========================================================================
             * Compares to subtrees, using the tree depth as tie breaker when
             * the subtrees have equal frequency. This minimizes the worst case length.
             */
            function smaller(tree, n, m, depth) {
                var _n2 = n * 2;
                var _m2 = m * 2;
                return (tree[_n2] /*.Freq*/ < tree[_m2] /*.Freq*/ ||
                    (tree[_n2] /*.Freq*/ === tree[_m2] /*.Freq*/ && depth[n] <= depth[m]));
            }

            /* ===========================================================================
             * Restore the heap property by moving down the tree starting at node k,
             * exchanging a node with the smallest of its two sons if necessary, stopping
             * when the heap property is re-established (each father smaller than its
             * two sons).
             */
            function pqdownheap(s, tree, k)
            //    deflate_state *s;
            //    ct_data *tree;  /* the tree to restore */
            //    int k;               /* node to move down */
            {
                var v = s.heap[k];
                var j = k << 1; /* left son of k */
                while (j <= s.heap_len) {
                    /* Set j to the smallest of the two sons: */
                    if (j < s.heap_len &&
                        smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
                        j++;
                    }
                    /* Exit if v is smaller than both sons */
                    if (smaller(tree, v, s.heap[j], s.depth)) {
                        break;
                    }

                    /* Exchange v with the smallest son */
                    s.heap[k] = s.heap[j];
                    k = j;

                    /* And continue down the tree, setting j to the left son of k */
                    j <<= 1;
                }
                s.heap[k] = v;
            }


            // inlined manually
            // var SMALLEST = 1;

            /* ===========================================================================
             * Send the block data compressed using the given Huffman trees
             */
            function compress_block(s, ltree, dtree)
            //    deflate_state *s;
            //    const ct_data *ltree; /* literal tree */
            //    const ct_data *dtree; /* distance tree */
            {
                var dist; /* distance of matched string */
                var lc; /* match length or unmatched char (if dist == 0) */
                var lx = 0; /* running index in l_buf */
                var code; /* the code to send */
                var extra; /* number of extra bits to send */

                if (s.last_lit !== 0) {
                    do {
                        dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
                        lc = s.pending_buf[s.l_buf + lx];
                        lx++;

                        if (dist === 0) {
                            send_code(s, lc, ltree); /* send a literal byte */
                            //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
                        } else {
                            /* Here, lc is the match length - MIN_MATCH */
                            code = _length_code[lc];
                            send_code(s, code + LITERALS + 1, ltree); /* send the length code */
                            extra = extra_lbits[code];
                            if (extra !== 0) {
                                lc -= base_length[code];
                                send_bits(s, lc, extra); /* send the extra length bits */
                            }
                            dist--; /* dist is now the match distance - 1 */
                            code = d_code(dist);
                            //Assert (code < D_CODES, "bad d_code");

                            send_code(s, code, dtree); /* send the distance code */
                            extra = extra_dbits[code];
                            if (extra !== 0) {
                                dist -= base_dist[code];
                                send_bits(s, dist, extra); /* send the extra distance bits */
                            }
                        } /* literal or match pair ? */

                        /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
                        //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
                        //       "pendingBuf overflow");

                    } while (lx < s.last_lit);
                }

                send_code(s, END_BLOCK, ltree);
            }


            /* ===========================================================================
             * Construct one Huffman tree and assigns the code bit strings and lengths.
             * Update the total bit length for the current block.
             * IN assertion: the field freq is set for all tree elements.
             * OUT assertions: the fields len and code are set to the optimal bit length
             *     and corresponding code. The length opt_len is updated; static_len is
             *     also updated if stree is not null. The field max_code is set.
             */
            function build_tree(s, desc)
            //    deflate_state *s;
            //    tree_desc *desc; /* the tree descriptor */
            {
                var tree = desc.dyn_tree;
                var stree = desc.stat_desc.static_tree;
                var has_stree = desc.stat_desc.has_stree;
                var elems = desc.stat_desc.elems;
                var n, m; /* iterate over heap elements */
                var max_code = -1; /* largest code with non zero frequency */
                var node; /* new node being created */

                /* Construct the initial heap, with least frequent element in
                 * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
                 * heap[0] is not used.
                 */
                s.heap_len = 0;
                s.heap_max = HEAP_SIZE;

                for (n = 0; n < elems; n++) {
                    if (tree[n * 2] /*.Freq*/ !== 0) {
                        s.heap[++s.heap_len] = max_code = n;
                        s.depth[n] = 0;

                    } else {
                        tree[n * 2 + 1] /*.Len*/ = 0;
                    }
                }

                /* The pkzip format requires that at least one distance code exists,
                 * and that at least one bit should be sent even if there is only one
                 * possible code. So to avoid special checks later on we force at least
                 * two codes of non zero frequency.
                 */
                while (s.heap_len < 2) {
                    node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
                    tree[node * 2] /*.Freq*/ = 1;
                    s.depth[node] = 0;
                    s.opt_len--;

                    if (has_stree) {
                        s.static_len -= stree[node * 2 + 1] /*.Len*/ ;
                    }
                    /* node is 0 or 1 so it does not have extra bits */
                }
                desc.max_code = max_code;

                /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
                 * establish sub-heaps of increasing lengths:
                 */
                for (n = (s.heap_len >> 1 /*int /2*/ ); n >= 1; n--) {
                    pqdownheap(s, tree, n);
                }

                /* Construct the Huffman tree by repeatedly combining the least two
                 * frequent nodes.
                 */
                node = elems; /* next internal node of the tree */
                do {
                    //pqremove(s, tree, n);  /* n = node of least frequency */
                    /*** pqremove ***/
                    n = s.heap[1 /*SMALLEST*/ ];
                    s.heap[1 /*SMALLEST*/ ] = s.heap[s.heap_len--];
                    pqdownheap(s, tree, 1 /*SMALLEST*/ );
                    /***/

                    m = s.heap[1 /*SMALLEST*/ ]; /* m = node of next least frequency */

                    s.heap[--s.heap_max] = n; /* keep the nodes sorted by frequency */
                    s.heap[--s.heap_max] = m;

                    /* Create a new node father of n and m */
                    tree[node * 2] /*.Freq*/ = tree[n * 2] /*.Freq*/ + tree[m * 2] /*.Freq*/ ;
                    s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
                    tree[n * 2 + 1] /*.Dad*/ = tree[m * 2 + 1] /*.Dad*/ = node;

                    /* and insert the new node in the heap */
                    s.heap[1 /*SMALLEST*/ ] = node++;
                    pqdownheap(s, tree, 1 /*SMALLEST*/ );

                } while (s.heap_len >= 2);

                s.heap[--s.heap_max] = s.heap[1 /*SMALLEST*/ ];

                /* At this point, the fields freq and dad are set. We can now
                 * generate the bit lengths.
                 */
                gen_bitlen(s, desc);

                /* The field len is now set, we can generate the bit codes */
                gen_codes(tree, max_code, s.bl_count);
            }


            /* ===========================================================================
             * Scan a literal or distance tree to determine the frequencies of the codes
             * in the bit length tree.
             */
            function scan_tree(s, tree, max_code)
            //    deflate_state *s;
            //    ct_data *tree;   /* the tree to be scanned */
            //    int max_code;    /* and its largest code of non zero frequency */
            {
                var n; /* iterates over all tree elements */
                var prevlen = -1; /* last emitted length */
                var curlen; /* length of current code */

                var nextlen = tree[0 * 2 + 1] /*.Len*/ ; /* length of next code */

                var count = 0; /* repeat count of the current code */
                var max_count = 7; /* max repeat count */
                var min_count = 4; /* min repeat count */

                if (nextlen === 0) {
                    max_count = 138;
                    min_count = 3;
                }
                tree[(max_code + 1) * 2 + 1] /*.Len*/ = 0xffff; /* guard */

                for (n = 0; n <= max_code; n++) {
                    curlen = nextlen;
                    nextlen = tree[(n + 1) * 2 + 1] /*.Len*/ ;

                    if (++count < max_count && curlen === nextlen) {
                        continue;

                    } else if (count < min_count) {
                        s.bl_tree[curlen * 2] /*.Freq*/ += count;

                    } else if (curlen !== 0) {

                        if (curlen !== prevlen) {
                            s.bl_tree[curlen * 2] /*.Freq*/ ++;
                        }
                        s.bl_tree[REP_3_6 * 2] /*.Freq*/ ++;

                    } else if (count <= 10) {
                        s.bl_tree[REPZ_3_10 * 2] /*.Freq*/ ++;

                    } else {
                        s.bl_tree[REPZ_11_138 * 2] /*.Freq*/ ++;
                    }

                    count = 0;
                    prevlen = curlen;

                    if (nextlen === 0) {
                        max_count = 138;
                        min_count = 3;

                    } else if (curlen === nextlen) {
                        max_count = 6;
                        min_count = 3;

                    } else {
                        max_count = 7;
                        min_count = 4;
                    }
                }
            }


            /* ===========================================================================
             * Send a literal or distance tree in compressed form, using the codes in
             * bl_tree.
             */
            function send_tree(s, tree, max_code)
            //    deflate_state *s;
            //    ct_data *tree; /* the tree to be scanned */
            //    int max_code;       /* and its largest code of non zero frequency */
            {
                var n; /* iterates over all tree elements */
                var prevlen = -1; /* last emitted length */
                var curlen; /* length of current code */

                var nextlen = tree[0 * 2 + 1] /*.Len*/ ; /* length of next code */

                var count = 0; /* repeat count of the current code */
                var max_count = 7; /* max repeat count */
                var min_count = 4; /* min repeat count */

                /* tree[max_code+1].Len = -1; */
                /* guard already set */
                if (nextlen === 0) {
                    max_count = 138;
                    min_count = 3;
                }

                for (n = 0; n <= max_code; n++) {
                    curlen = nextlen;
                    nextlen = tree[(n + 1) * 2 + 1] /*.Len*/ ;

                    if (++count < max_count && curlen === nextlen) {
                        continue;

                    } else if (count < min_count) {
                        do {
                            send_code(s, curlen, s.bl_tree);
                        } while (--count !== 0);

                    } else if (curlen !== 0) {
                        if (curlen !== prevlen) {
                            send_code(s, curlen, s.bl_tree);
                            count--;
                        }
                        //Assert(count >= 3 && count <= 6, " 3_6?");
                        send_code(s, REP_3_6, s.bl_tree);
                        send_bits(s, count - 3, 2);

                    } else if (count <= 10) {
                        send_code(s, REPZ_3_10, s.bl_tree);
                        send_bits(s, count - 3, 3);

                    } else {
                        send_code(s, REPZ_11_138, s.bl_tree);
                        send_bits(s, count - 11, 7);
                    }

                    count = 0;
                    prevlen = curlen;
                    if (nextlen === 0) {
                        max_count = 138;
                        min_count = 3;

                    } else if (curlen === nextlen) {
                        max_count = 6;
                        min_count = 3;

                    } else {
                        max_count = 7;
                        min_count = 4;
                    }
                }
            }


            /* ===========================================================================
             * Construct the Huffman tree for the bit lengths and return the index in
             * bl_order of the last bit length code to send.
             */
            function build_bl_tree(s) {
                var max_blindex; /* index of last bit length code of non zero freq */

                /* Determine the bit length frequencies for literal and distance trees */
                scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
                scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

                /* Build the bit length tree: */
                build_tree(s, s.bl_desc);
                /* opt_len now includes the length of the tree representations, except
                 * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
                 */

                /* Determine the number of bit length codes to send. The pkzip format
                 * requires that at least 4 bit length codes be sent. (appnote.txt says
                 * 3 but the actual value used is 4.)
                 */
                for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
                    if (s.bl_tree[bl_order[max_blindex] * 2 + 1] /*.Len*/ !== 0) {
                        break;
                    }
                }
                /* Update opt_len to include the bit length tree and counts */
                s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
                //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
                //        s->opt_len, s->static_len));

                return max_blindex;
            }


            /* ===========================================================================
             * Send the header for a block using dynamic Huffman trees: the counts, the
             * lengths of the bit length codes, the literal tree and the distance tree.
             * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
             */
            function send_all_trees(s, lcodes, dcodes, blcodes)
            //    deflate_state *s;
            //    int lcodes, dcodes, blcodes; /* number of codes for each tree */
            {
                var rank; /* index in bl_order */

                //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
                //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
                //        "too many codes");
                //Tracev((stderr, "\nbl counts: "));
                send_bits(s, lcodes - 257, 5); /* not +255 as stated in appnote.txt */
                send_bits(s, dcodes - 1, 5);
                send_bits(s, blcodes - 4, 4); /* not -3 as stated in appnote.txt */
                for (rank = 0; rank < blcodes; rank++) {
                    //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
                    send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1] /*.Len*/ , 3);
                }
                //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

                send_tree(s, s.dyn_ltree, lcodes - 1); /* literal tree */
                //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

                send_tree(s, s.dyn_dtree, dcodes - 1); /* distance tree */
                //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
            }


            /* ===========================================================================
             * Check if the data type is TEXT or BINARY, using the following algorithm:
             * - TEXT if the two conditions below are satisfied:
             *    a) There are no non-portable control characters belonging to the
             *       "black list" (0..6, 14..25, 28..31).
             *    b) There is at least one printable character belonging to the
             *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
             * - BINARY otherwise.
             * - The following partially-portable control characters form a
             *   "gray list" that is ignored in this detection algorithm:
             *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
             * IN assertion: the fields Freq of dyn_ltree are set.
             */
            function detect_data_type(s) {
                /* black_mask is the bit mask of black-listed bytes
                 * set bits 0..6, 14..25, and 28..31
                 * 0xf3ffc07f = binary 11110011111111111100000001111111
                 */
                var black_mask = 0xf3ffc07f;
                var n;

                /* Check for non-textual ("black-listed") bytes. */
                for (n = 0; n <= 31; n++, black_mask >>>= 1) {
                    if ((black_mask & 1) && (s.dyn_ltree[n * 2] /*.Freq*/ !== 0)) {
                        return Z_BINARY;
                    }
                }

                /* Check for textual ("white-listed") bytes. */
                if (s.dyn_ltree[9 * 2] /*.Freq*/ !== 0 || s.dyn_ltree[10 * 2] /*.Freq*/ !== 0 ||
                    s.dyn_ltree[13 * 2] /*.Freq*/ !== 0) {
                    return Z_TEXT;
                }
                for (n = 32; n < LITERALS; n++) {
                    if (s.dyn_ltree[n * 2] /*.Freq*/ !== 0) {
                        return Z_TEXT;
                    }
                }

                /* There are no "black-listed" or "white-listed" bytes:
                 * this stream either is empty or has tolerated ("gray-listed") bytes only.
                 */
                return Z_BINARY;
            }


            var static_init_done = false;

            /* ===========================================================================
             * Initialize the tree data structures for a new zlib stream.
             */
            function _tr_init(s) {

                if (!static_init_done) {
                    tr_static_init();
                    static_init_done = true;
                }

                s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
                s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
                s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

                s.bi_buf = 0;
                s.bi_valid = 0;

                /* Initialize the first block of the first file: */
                init_block(s);
            }


            /* ===========================================================================
             * Send a stored block
             */
            function _tr_stored_block(s, buf, stored_len, last)
            //DeflateState *s;
            //charf *buf;       /* input block */
            //ulg stored_len;   /* length of input block */
            //int last;         /* one if this is the last block for a file */
            {
                send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3); /* send block type */
                copy_block(s, buf, stored_len, true); /* with header */
            }


            /* ===========================================================================
             * Send one empty static block to give enough lookahead for inflate.
             * This takes 10 bits, of which 7 may remain in the bit buffer.
             */
            function _tr_align(s) {
                send_bits(s, STATIC_TREES << 1, 3);
                send_code(s, END_BLOCK, static_ltree);
                bi_flush(s);
            }


            /* ===========================================================================
             * Determine the best encoding for the current block: dynamic trees, static
             * trees or store, and output the encoded block to the zip file.
             */
            function _tr_flush_block(s, buf, stored_len, last)
            //DeflateState *s;
            //charf *buf;       /* input block, or NULL if too old */
            //ulg stored_len;   /* length of input block */
            //int last;         /* one if this is the last block for a file */
            {
                var opt_lenb, static_lenb; /* opt_len and static_len in bytes */
                var max_blindex = 0; /* index of last bit length code of non zero freq */

                /* Build the Huffman trees unless a stored block is forced */
                if (s.level > 0) {

                    /* Check if the file is binary or text */
                    if (s.strm.data_type === Z_UNKNOWN) {
                        s.strm.data_type = detect_data_type(s);
                    }

                    /* Construct the literal and distance trees */
                    build_tree(s, s.l_desc);
                    // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
                    //        s->static_len));

                    build_tree(s, s.d_desc);
                    // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
                    //        s->static_len));
                    /* At this point, opt_len and static_len are the total bit lengths of
                     * the compressed block data, excluding the tree representations.
                     */

                    /* Build the bit length tree for the above two trees, and get the index
                     * in bl_order of the last bit length code to send.
                     */
                    max_blindex = build_bl_tree(s);

                    /* Determine the best encoding. Compute the block lengths in bytes. */
                    opt_lenb = (s.opt_len + 3 + 7) >>> 3;
                    static_lenb = (s.static_len + 3 + 7) >>> 3;

                    // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
                    //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
                    //        s->last_lit));

                    if (static_lenb <= opt_lenb) {
                        opt_lenb = static_lenb;
                    }

                } else {
                    // Assert(buf != (char*)0, "lost buf");
                    opt_lenb = static_lenb = stored_len + 5; /* force a stored block */
                }

                if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
                    /* 4: two words for the lengths */

                    /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
                     * Otherwise we can't have processed more than WSIZE input bytes since
                     * the last block flush, because compression would have been
                     * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
                     * transform a block into a stored block.
                     */
                    _tr_stored_block(s, buf, stored_len, last);

                } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

                    send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
                    compress_block(s, static_ltree, static_dtree);

                } else {
                    send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
                    send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
                    compress_block(s, s.dyn_ltree, s.dyn_dtree);
                }
                // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
                /* The above check is made mod 2^32, for files larger than 512 MB
                 * and uLong implemented on 32 bits.
                 */
                init_block(s);

                if (last) {
                    bi_windup(s);
                }
                // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
                //       s->compressed_len-7*last));
            }

            /* ===========================================================================
             * Save the match info and tally the frequency counts. Return true if
             * the current block must be flushed.
             */
            function _tr_tally(s, dist, lc)
            //    deflate_state *s;
            //    unsigned dist;  /* distance of matched string */
            //    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
            {
                //var out_length, in_length, dcode;

                s.pending_buf[s.d_buf + s.last_lit * 2] = (dist >>> 8) & 0xff;
                s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

                s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
                s.last_lit++;

                if (dist === 0) {
                    /* lc is the unmatched char */
                    s.dyn_ltree[lc * 2] /*.Freq*/ ++;
                } else {
                    s.matches++;
                    /* Here, lc is the match length - MIN_MATCH */
                    dist--; /* dist = match distance - 1 */
                    //Assert((ush)dist < (ush)MAX_DIST(s) &&
                    //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
                    //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

                    s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2] /*.Freq*/ ++;
                    s.dyn_dtree[d_code(dist) * 2] /*.Freq*/ ++;
                }

                // (!) This block is disabled in zlib defailts,
                // don't enable it for binary compatibility

                //#ifdef TRUNCATE_BLOCK
                //  /* Try to guess if it is profitable to stop the current block here */
                //  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
                //    /* Compute an upper bound for the compressed length */
                //    out_length = s.last_lit*8;
                //    in_length = s.strstart - s.block_start;
                //
                //    for (dcode = 0; dcode < D_CODES; dcode++) {
                //      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
                //    }
                //    out_length >>>= 3;
                //    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
                //    //       s->last_lit, in_length, out_length,
                //    //       100L - out_length*100L/in_length));
                //    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
                //      return true;
                //    }
                //  }
                //#endif

                return (s.last_lit === s.lit_bufsize - 1);
                /* We avoid equality with lit_bufsize because of wraparound at 64K
                 * on 16 bit machines and because stored blocks are restricted to
                 * 64K-1 bytes.
                 */
            }

            exports._tr_init = _tr_init;
            exports._tr_stored_block = _tr_stored_block;
            exports._tr_flush_block = _tr_flush_block;
            exports._tr_tally = _tr_tally;
            exports._tr_align = _tr_align;

        }, {
            "../utils/common": 62
        }],
        74: [function(require, module, exports) {
            'use strict';

            // (C) 1995-2013 Jean-loup Gailly and Mark Adler
            // (C) 2014-2017 Vitaly Puzrin and Andrey Tupitsin
            //
            // This software is provided 'as-is', without any express or implied
            // warranty. In no event will the authors be held liable for any damages
            // arising from the use of this software.
            //
            // Permission is granted to anyone to use this software for any purpose,
            // including commercial applications, and to alter it and redistribute it
            // freely, subject to the following restrictions:
            //
            // 1. The origin of this software must not be misrepresented; you must not
            //   claim that you wrote the original software. If you use this software
            //   in a product, an acknowledgment in the product documentation would be
            //   appreciated but is not required.
            // 2. Altered source versions must be plainly marked as such, and must not be
            //   misrepresented as being the original software.
            // 3. This notice may not be removed or altered from any source distribution.

            function ZStream() {
                /* next input byte */
                this.input = null; // JS specific, because we have no pointers
                this.next_in = 0;
                /* number of bytes available at input */
                this.avail_in = 0;
                /* total number of input bytes read so far */
                this.total_in = 0;
                /* next output byte should be put there */
                this.output = null; // JS specific, because we have no pointers
                this.next_out = 0;
                /* remaining free space at output */
                this.avail_out = 0;
                /* total number of bytes output so far */
                this.total_out = 0;
                /* last error message, NULL if no error */
                this.msg = '' /*Z_NULL*/ ;
                /* not visible by applications */
                this.state = null;
                /* best guess about the data type: binary or text */
                this.data_type = 2 /*Z_UNKNOWN*/ ;
                /* adler32 value of the uncompressed data */
                this.adler = 0;
            }

            module.exports = ZStream;

        }, {}]
    };

    var expose = init(cache,{},[10]);

    return expose(10);
});
define('skylark-data-zip/zip',[
    "skylark-langx/skylark",
    "skylark-langx/langx",
    "./_stuk/jszip"
], function(skylark, langx,JSZip) {

    var zip = function(data, options) {
        var zip =  new JSZip();
        if (arguments.length>0) {
        	return zip.loadAsync(data, options);
        } else {
        	return zip;
        }
    };

    langx.mixin(zip, {
        "ZipFile": JSZip
    });

    return skylark.attach("data.zip", zip);

});
define('skylark-data-zip/main',[
    "skylark-langx/skylark",
    "./zip"
], function(skylark) {
    return skylark;
});

define('skylark-data-zip', ['skylark-data-zip/main'], function (main) { return main; });


},this);