(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = global.dom = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global.dom = global.$ = factory());
}(this, (function () {
  'use strict';
  var win = window, doc = win.document;
  var ArrayT = Array,
    isArray = ArrayT.isArray,
    arrayProto = ArrayT.prototype,
    arraySlice = arrayProto.slice,
    arrayIndexOf = arrayProto.indexOf,
    indexOfCall = function (arr, value) {
      return arrayIndexOf.call(arr, value)
    },
    Obj = Object,
    defineProperty = Obj.defineProperty,
    hasOwnProperty = Obj.prototype.hasOwnProperty,
    getKeys = Obj.keys,
    UNDEFINED = undefined,
    FALSE = false,
    TRUE = true,
    NULL = null,
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    tempTable = 'table',
    tempTableRow = 'tr',
    containers = {
      'tr': 'tbody',
      'tbody': tempTable,
      'thead': tempTable,
      'tfoot': tempTable,
      'td': tempTableRow,
      'th': tempTableRow,
      '*': 'div'
    },
    head = doc.querySelector('head');
  /**
   * @alias window.dom
   * @param selector
   * @param context
   * @param once
   * @return DomManipulation
   */
  var $ = function (selector, context, once) {
    if (isFunction(selector)) {
      domReady(selector);
      return $.byNode(doc);
    }
    return createDomM(selector, context, once)
  };
  $.byId = function (id, newDoc) {
    return domFromNode((newDoc || doc).getElementById(id))
  };
  $.byTag = $.byt = function (tagName, context) {
    return domFromNodeList((context || doc).getElementsByTagName(tagName))
  };
  $.byName = $.byn = function (name, context) {
    return domFromNodeList((context || doc).getElementsByName(name))
  };
  $.byClass = $.byc = function (className, context) {
    return domFromNodeList((context || doc).getElementsByClassName(className))
  };
  $.byHTML = $.byh = function (html) {
    return domFromNodeList(innerHTMLToTemp(html).childNodes)
  };
  $.one = function (selector, context) {
    return domFromNode((context || doc).querySelector(selector))
  };
  $.all = function (selector, context) {
    return domFromNodeList((context || doc).querySelectorAll(selector))
  };
  var $console = $.console = console, noop = $.noop = function () {
    }, domFromNode = $.byNode = $.by = function (node) {
      var dom = createDomM();
      if (node) {
        dom.push(node);
      }
      return dom
    }, domFromNodes = $.byNodes = $.bys = function (nodes) {
      var newDom = createDomM();
      if (nodes) {
        newDom.push.apply(newDom, nodes);
      }
      return newDom
    }, domFromNodeList = $.byNodeList = $.byl = function (nodeList) {
      /*var dom = createDomM();
      if (nodeList.length) {
        dom.push.apply(dom, nodeList);
      }*/
      return domFromNodes(nodeList)
    },
    assign = $.assign = Obj.assign,
    isWindow = $.isWindow = function (obj) {
      return obj instanceof Window
    }, isObjectT = $.isObjectT = function (obj) {
      return typeof obj === "object";
    }, isObject = $.isObject = function (obj) {
      return !!obj && isObjectT(obj)
    }, isPlainObject = $.isPlainObject = function (obj) {
      return isObject(obj) && !isWindow(obj) && Obj.getPrototypeOf(obj) === Obj.prototype
    }, isEmptyObject = $.isEmptyObject = function (obj, checkHasOwn) {
      if (isObject(obj)) {
        for (var name in obj) {
          if (!checkHasOwn || hasOwnProperty.call(obj, name)) {
            return FALSE;
          }
        }
      }
      return TRUE;
    },
    isFunction = $.isFunction = function (obj) {
      return typeof obj === "function"
    }, isString = $.isString = function (obj) {
      return typeof obj === "string"
    }, iifString = $.iifString = function (obj) {
      return isString(obj) ? obj : ''
    }, isNumberT = $.isNumberT = function (obj) {
      return typeof obj === "number"
    }, isNumber = $.isNumber = function (obj) {
      return isNumberT(obj) && isFinite(obj)
    }, isInt = $.isInt = function (obj) {
      return obj | 0 === obj
    }, toNumeral = $.toNumeral = function (obj) {
      return (isNumber(obj) ? obj : isString(obj) ? parseFloat(obj) : +obj) || 0;
    }, isBoolean = $.isBoolean = function (obj) {
      return typeof obj === "boolean"
    }, instanceOf = $.instanceOf = function (obj, Class) {
      return obj instanceof Class
    }, isElement = $.isElement = function (obj) {
      return instanceOf(obj, Element)
    }, isDocument = $.isDocument = function (obj) {
      return instanceOf(obj, Document)
    }, isNode = $.isNode = function (obj) {
      return instanceOf(obj, Node)
    }, isArrayLike = $.isArrayLike = function (obj) {
      if (isArray(obj) || isString(obj)) {
        return TRUE
      }
      if (!isObject(obj)) {
        return FALSE
      }
      var length = obj.length;
      return length === 0 || isNumber(length) && length > 0 && (length - 1) in obj
    }, isNodeList = $.isNodeList = function (obj) {
      return instanceOf(obj, NodeList)
    }, isHTMLCollection = $.isHTMLCollection = function (obj) {
      return instanceOf(obj, HTMLCollection)
    }, isDocumentFragment = $.isDocumentFragment = function (obj) {
      return instanceOf(obj, DocumentFragment)
    }, nonEmptyString = $.nonEmptyString = function (obj) {
      return !!obj && isString(obj);
    }, eachI = $.eachI = function (arr, callback, from_index, arg3) {
      if (arr) {
        var i, rt, value;
        if (isObject(from_index)) {
          arg3 = from_index;
          from_index = 0;
        }
        from_index = from_index >> 0;
        if (from_index < 0) {
          for (i = arr.length + from_index; i >= 0; i--) {
            rt = callback.call(value = arr[i], i, value, arr, arg3);
            if (rt === FALSE) {
              return rt
            } else if (isInt(rt)) {
              i = rt
            }
          }
        } else {
          for (i = from_index; i < arr.length; i++) {
            rt = callback.call(value = arr[i], i, value, arr, arg3);
            if (rt === FALSE) {
              return rt
            } else if (isInt(rt)) {
              i = rt
            }
          }
        }
      }
      return TRUE
    }, eachIn = $.eachIn = function (obj, callback, notCheckHasOwn, arg3) {
      if (isObject(obj)) {
        var value;
        if (arg3 === UNDEFINED && !isBoolean(notCheckHasOwn)) {
          arg3 = notCheckHasOwn;
          notCheckHasOwn = FALSE;
        }
        for (var key in obj) {
          if ((notCheckHasOwn || hasOwnProperty.call(obj, key)) && callback.call(value = obj[key], key, value, obj, arg3) === FALSE) {
            return FALSE
          }
        }
      }
      return TRUE;
    }, isEleWinDoc = $.isEleWinDoc = function (obj) {
      return isElement(obj) || isWindow(obj) || isDocument(obj)
    };
  $.iifObject = function (obj) {
    return isObjectT(obj) ? obj : NULL
  };
  $.isFloat = function (obj) {
    return isNumber(obj) && !isInt(obj)
  };
  $.isCurrentWindow = function (obj) {
    return obj === window
  };
  $.isRegExp = function (obj) {
    return instanceOf(obj, RegExp)
  };
  $.isDate = function (obj) {
    return instanceOf(obj, Date)
  };
  $.iifNumber = function (obj) {
    return isNumber(obj) || 0
  };
  $.isEmpty = function (obj) {
    return !obj || isObject(obj) && isEmptyObject(obj, TRUE);
  };
  $.each = function (obj, callback, fromIndexOrNotCheck, arg3) {
    return isArrayLike(obj) ? eachI(obj, callback, fromIndexOrNotCheck, arg3) : eachIn(obj, callback, fromIndexOrNotCheck, arg3)
  };
  $.parseXML = function (data, type) {
    var xml;
    if (data && isString(data)) {
      try {
        xml = (new DOMParser()).parseFromString(data, type || "application/xml");
      } catch (e) {
        $console.error(e);
      }
      if (!xml || xml.getElementsByTagName("parsererror").length) {
        xml = NULL;
        $console.error("Invalid XML: ", data)
      }
    }
    return xml;
  };

  $.parseHTML = function parseHTML(html, context, keepScripts) {
    if (!isString(html)) {
      return [];
    }
    if (isBoolean(context)) {
      keepScripts = context;
      context = FALSE
    }
    html = innerHTMLToTemp(html, context);
    if (!keepScripts) {
      var scripts = html.getElementsByTagName('script');
      for (var i = 0, l = scripts.length; i < l; i++) {
        var script = scripts[i];
        script.parentNode.removeChild(script);
      }
    }
    return arraySlice.call(html.childNodes)
  };
  $.syntaxCheck = function (code) {
    try {
      return [TRUE, new Function(code)]
    } catch (err) {
      return [FALSE, err]
    }
  };

  var newDocument = $.newDocument = function () {
    return doc.implementation.createHTMLDocument('')
  };
  $.newXMLDocument = function (nURI, qName, doctype) {
    return doc.implementation.createDocument(nURI, qName, doctype)
  };

  $.createTempElement = function (tagName, document) {
    return (document || newDocument()).createElement(tagName);
  };

  function innerHTMLToTemp(html, tagName, document) {
    if (isObject(tagName)) {
      document = tagName;
      tagName = '';
    }
    var temp = (document || newDocument()).createElement(tagName || 'div');
    temp.innerHTML = html;
    return temp;
  }

  $.createDocFragment = function (children) {
    var f = doc.createDocumentFragment();
    if (children) {
      f = $(f).append(children)[0]
    }
    return f
  };

  var aCharCode = $.aCharCode = 97;
  var zCharCode = $.zCharCode = 122;
  var ACharCode = $.ACharCode = 65;
  var ZCharCode = $.ZCharCode = 90;


  var initCap = $.initCap = function (words) {
    if (!words) {
      return words
    }
    var code = words.charCodeAt(0);
    return code >= aCharCode && code <= zCharCode ? words[0].toUpperCase() + words.slice(1) : words;
  }, invertCap = $.invertCap = function (words) {
    if (!words) {
      return words
    }
    var code = words.charCodeAt(0);
    return code >= ACharCode && code <= ZCharCode ? words[0].toLowerCase() + words.slice(1) : words;
  };
  $.invertCase = function (words) {
    if (!words) {
      return words
    }
    var a = [];
    for (var i = 0, l = words.length, ch, code; i < l; i++) {
      ch = words[0];
      code = ch.charCodeAt(0);
      a[i] = code >= aCharCode && code <= zCharCode ? ch.toUpperCase() :
        code >= ACharCode && code <= ZCharCode ? ch.toLowerCase() : ch;
    }
    return a.join('')
  };

  var hasOwnProxy = function (obj, key) {
      return obj.hasOwnProperty(key)
    }, getHasOwnFn = $.getHasOwnFn = function (obj) {
      return obj == NULL ? returnFalse : isFunction(obj.hasOwnProperty) ? hasOwnProxy : hasOwnCall;
    },
    hasOwnCall = $.hasOwnCall = function (obj, key) {
      return hasOwnProperty.call(obj, key);
    }, returnFalse = $.returnFalse = function () {
      return FALSE;
    },
    returnTrue = $.returnTrue = function () {
      return TRUE
    },
    supportPassive,
    BSupport = $.support = {
      ie: function () {
        var ie = navigator.userAgent.match(/MSIE\s*(\d+)/i);
        return ie ? document.documentMode || parseInt(ie[1]) : 20
      }(),
      touch: 'ontouchstart' in document.createElement('div'), passive: supportPassive = function () {
        var name = 'passive';
        var passiveSupported = FALSE;
        try {
          var options = defineProperty({}, name, {
            get: function () {
              passiveSupported = TRUE;
            }
          });
          win.addEventListener(name, NULL, options);
          win.removeEventListener(name, NULL, options);
        } catch (err) {
        }
        return passiveSupported;
      }()
    };

  $.hasOwn = function (obj, key) {
    return getHasOwnFn(obj)(obj, key);
  };
  var domStorageGroupName = '__DOM_STORAGE_GROUP__',
    eventListenersMapName = 'events';
  var ElementPrototype = Element.prototype;
  if (!ElementPrototype.matches) {
    ElementPrototype.matches =
      ElementPrototype.matchesSelector ||
      ElementPrototype.mozMatchesSelector ||
      ElementPrototype.msMatchesSelector ||
      ElementPrototype.oMatchesSelector ||
      ElementPrototype.webkitMatchesSelector ||
      function (selector) {
        var matches = optimalDomQuery(selector, this.ownerDocument),
          i = matches.length;

        while (--i >= 0 && matches[i] !== this) {
        }
        return i > -1;
      };
  }
  //var arrayProto = Array.prototype;

  var removeProperty = $.removeProperty = function (object, property) {
    let ret;
    if (!isObject(object)) {
      ret = NULL
    } else if (arguments.length < 2 || property === TRUE) {
      ret = TRUE;
      eachIn(object, function (key, value) {
        ret = ret && removeProperty(object, key) !== FALSE
      });
    } else if (isArray(property)) {
      eachI(property, function (i, key) {
        ret = ret && removeProperty(object, key) !== FALSE
      })
    } else if (property in object) {
      ret = FALSE;
      try {
        object[property] = UNDEFINED;
        ret = delete object[property];
      } catch (e) {
        // e['@'] = "removeProperty";
        // console.error(e);
      }
    }
    return ret;
  };
  var testElement = document.createElement('div');
  var supportClassList = !!testElement.classList;
  var addClass, removeClass;
  if (supportClassList) {
    addClass = function (element, className) {
      element.classList.add(className)
    };
    removeClass = function (element, className) {
      element.classList.remove(className)
    }
  } else {
    addClass = function (element, className) {
      var eClassName = element.className.trim();
      if (!eClassName) {
        element.className = className;
      } else {
        var classes = eClassName.split(' ');
        if (classes.indexOf(className) < 0) {
          classes.push(className);
          element.className = classes.join(' ')
        }
      }
    };
    removeClass = function (element, className) {
      var eClassName = element.className.trim();
      if (eClassName) {
        var classes = [];
        var eClassNameArr = eClassName.split(' ');
        for (var i = 0, l = eClassNameArr.length, value; i < l; i++) {
          value = eClassNameArr[i];
          if (className !== value) {
            classes.push(value)
          }
        }
        element.className = classes.join(' ')
      }
    }
  }

  function hasClass(node, className) {
    if (!className || !isElement(node)) {
      return FALSE
    }
    if (!isArray(className)) {
      className = className.split(' ');
    }
    var classes = node.className.split(' ');
    for (var compareWith, i = 0, l = className.length; i < l; i++) {
      compareWith = className[i];
      if (compareWith && classes.indexOf(compareWith) > -1) {
        return TRUE;
      }
    }
    return FALSE;
  }

  function hasClassIndexOf(nodes, className) {
    if (className) {
      if (!isArray(className)) {
        className = className.split(' ');
      }
      for (var i = 0, l = nodes.length; i < l; i++) {
        if (hasClass(nodes[i], className)) {
          return i
        }
      }
    }
    return -1
  }

  function toggleClass(node, className) {
    if (hasClass(node, className)) {
      removeClass(node, className)
    } else {
      addClass(node, className)
    }
  }

  var selectorArrayNodeIs = function (node, selector) {
    for (var i = 0, l = selector.length; i < l; i++) {
      if (nodeIs(node, selector[i])) {
        return TRUE
      }
    }
    return FALSE;
  };

  function nodeIs(node, selector) {
    return selector && node ?
      selector === doc ? node === doc :
        selector === win ? node === win :
          isString(selector) ? (node.matches ? node.matches(selector) : FALSE) :
            isFunction(selector) ? selector(node) :
              instanceOf(selector, DomManipulation) ? selector.gets(node, 1).length > 0 :
                isArray(selector) ? selectorArrayNodeIs(node, selector) :
                  node === selector : FALSE;
  }

  function noSelectorOrNodeIs(node, selector) {
    return node ? node && !selector || nodeIs(node, selector) : FALSE
  }

  function _isStyle(element, name, value) {
    if (isElement(element)) {
      var style = getComputedStyle(element);
      return style[name] === value
    }
    return TRUE
  }

  function isHide(element) {
    return _isStyle(element, 'display', 'none')
  }

  function isInvisible(element) {
    return _isStyle(element, 'visibility', 'hidden')
  }

  function showHide(element, show) {
    if (isElement(element)) {
      var style = element.style;
      var styleDisplay = style.display;
      if (show) {
        if (styleDisplay === "none") {
          style.display = getDomStorageDataByKey(element, 'style', 'display') || '';
        }
        if (style.display === '' && getStyleValue(element, 'display') === 'none') {
          style.display = getDefaultDisplay(element);
        }
        // if(style.visibility==='hidden'||getStyleValue(element, 'visibility') === 'none'){
        //   style.visibility='visible'
        // }
      } else if (styleDisplay !== "none") {
        style.display = 'none';
        setDomStorageData(element, 'style', 'display', styleDisplay)
      }
    }
  }

  function showHideEach(nodes, show) {
    for (var l = nodes.length, i = 0; i < l; i++) {
      showHide(nodes[i], show);
    }
    return nodes;
  }

  var getDomStorageGroup = function (obj, initData) {
    var storage = obj[domStorageGroupName];
    if (!storage && initData) {
      storage = {};
      domStorageGroupName in obj ? obj[domStorageGroupName] = storage : defineProperty(obj, domStorageGroupName, {
        value: storage,
        enumerable: FALSE,
        writable: TRUE,
        configurable: TRUE
      })
    }
    return storage;
  }, removeDomStorageGroup = function (obj) {
    removeProperty(obj, domStorageGroupName);
  }, getDomStorage = function (obj, storageName, initData) {
    var storage = getDomStorageGroup(obj, initData);
    var data;
    if (storage) {
      data = storage[storageName];
      if (data == NULL && initData) {
        data = storage[storageName] = {}
      }
    }
    return data;
  }/*, setDomStorage = function (obj, storageName, data) {
    var storage = getDomStorageGroup(obj, TRUE);
    storage[storageName] = data;
  }*/, removeDomStorage = function (obj, storageName) {
    removeProperty(getDomStorageGroup(obj), storageName)
  }, getDomStorageDataByKey = function (obj, storageName, key) {
    var nullKey = key == NULL, data = getDomStorage(obj, storageName, nullKey);
    if (nullKey) {
      return data
    }
    if (data) {
      return data[key]
    }
  }, setDomStorageData = function (obj, storageName, key, value) {
    var data = getDomStorage(obj, storageName, TRUE);
    data[key] = value;
  }, getAttr = function (element, name) {
    return element.getAttribute(name)
  }, setAttr = function (element, name, value) {
    element.setAttribute(name, value)
  }, removeAttr = function (element, name) {
    element.removeAttribute(name)
  }, toStyleNameList = $.toStyleNameList = function (name) {
    name = toDataSetKey(name.replace(/^-/, ''));
    if (!name) {
      return
    }
    name = initCap(name);
    var webkitName = 'webkit' + name;
    var mozName = 'moz' + name;
    var msName = 'ms' + name;
    return [invertCap(name), webkitName, mozName, msName]
  }, catchCurrentStyle = {
    getPropertyValue: function getPropertyValue() {
      return '';
    }
  }, getComputedStyle = $.getComputedStyle = function (element) {
    if (!element) {
      return catchCurrentStyle
    }
    try {
      return (element.ownerDocument.defaultView || window).getComputedStyle(element)
    } catch (e) {
      return element.style || catchCurrentStyle
    }
  }, getStyleValue = function (element, nameList) {
    if (!element) {
      return UNDEFINED
    }
    var currentStyle = getComputedStyle(element), value;
    if (!isArray(nameList)) {
      return isString(value = currentStyle[nameList]) ? value : UNDEFINED;
    }
    for (var i = 0, l = nameList.length; i < l; i++) {
      if (isString(value = currentStyle[nameList[i]])) {
        return value;
      }
    }
  }, setStyleValue = function (elements, nameList, value) {
    if (!isArray(elements)) {
      elements = [elements];
    }
    var element = elements[0];
    if (!element) {
      return
    }
    if (!isArray(nameList)) {
      nameList = [nameList];
    }
    value = iifString(isFunction(value) ? value() : (isNumber(value) ? (value + 'px') : value)).trim();
    var isAddTogether = FALSE, unit;
    if (value && (!value.indexOf('+=') || !value.indexOf('-='))) {
      unit = value.match(/([^\d.\s]*)$/)[0] || 'px';
      value = toNumeral(value.replace('=', ''));
      isAddTogether = TRUE
    }
    var currentStyle = getComputedStyle(element);
    var validName;
    for (var ni = 0, nl = nameList.length, name; ni < nl; ni++) {
      if (isString(currentStyle[name = nameList[ni]])) {
        validName = name;
        break;
      }
    }
    if (validName) {
      for (var i = 0, l = elements.length; i < l; i++) {
        if ((element = elements[i])) {
          if (isAddTogether) {
            value = (toNumeral(getStyleValue(element, validName))) + value + unit;
          }
          element.style && element.style.setProperty(validName, value);
        }
      }
    }
  };
  var defaultDisplayMap = {};

  var getDefaultDisplay = function (element) {
    var elementName = element.nodeName,
      display = defaultDisplayMap[elementName];
    if (!display) {
      display = getComputedStyle(element.ownerDocument.createElement(elementName)).display;
      if (!display || display === "none") {
        display = "block";
      }
      defaultDisplayMap[elementName] = display;
    }
    return display;
  };


  var toDataAttrName = $.toDataAttrName = function (key) {
    if (nonEmptyString(key)) {
      var newKey = [];
      var AC = ACharCode, ZC = ZCharCode;
      var start = 0;
      for (var firstCode, l = key.length, i = 0; i < l; i++) {
        firstCode = key.charCodeAt(i);
        if (firstCode >= AC && firstCode <= ZC) {
          newKey.push(key.slice(start, i), '-' + key.charAt(i).toLowerCase());
          start = i + 1;
        }
      }
      return newKey.length ? newKey.join('') : key;
    } else {
      return ''
    }
  };
  var toDataSetKey = $.toDataSetKey = function (name) {
    if (nonEmptyString(name)) {
      if (name.indexOf('-') > -1) {
        var key = name.split('-');
        for (var l = key.length, i = 1, k; i < l; i++) {
          if ((k = key[i])) {
            key[i] = initCap(k)
          }
        }
        return key.join('')
      }
      return name
    } else {
      return ''
    }
  };
  var getDataSet, setDataSet, removeDataSet = function (element, key) {
    removeAttr(element, 'data-' + toDataAttrName(key))
  };
  if (testElement.dataset) {
    getDataSet = function (element, key) {
      var dataset = element.dataset;
      return key == NULL ? dataset : dataset[key];
    };
    setDataSet = function (element, key, value) {
      element.dataset[key] = value;
    };
  } else {
    getDataSet = function (element, key) {
      var dataSet = {};
      var start = 'data-';
      if (key != NULL) {
        dataSet[key] = getAttr(element, start + toDataAttrName(key));
        return dataSet[key];
      }
      var attrs = element.attributes;
      for (var i = 0, l = attrs.length, name; i < l; i++) {
        name = attrs[i];
        if (!name.indexOf(start)) {
          dataSet[toDataSetKey(name.replace(start, ''))] = getAttr(element, name)
        }
      }
      return dataSet;
    };
    setDataSet = function (element, key, value) {
      setAttr(element, 'data-' + toDataAttrName(key), value);
    };
  }
  var getDataSetJSON = function (element, key) {
    return (key == NULL ? tryParseJSON : dataSetParse)(getDataSet(element, key))
  };
  var setDataSetJSON = function (element, key, value) {
    setDataSet(element, key, tryStringifyJSON(value))
  };
  var tryParseJSON = $.tryParseJSON = function (json) {
    if (isString(json)) {
      try {
        return JSON.parse(json)
      } catch (e) {
        return json
      }
    }
    return json;
  };
  $.parseJSON = function (json) {
    try {
      return JSON.parse(json)
    } catch (e) {
    }
  };
  var tryStringifyJSON = $.tryStringifyJSON = function (obj) {
    try {
      return JSON.stringify(obj);
    } catch (e) {
      return obj
    }
  };
  $.stringifyJSON = function (obj) {
    try {
      return JSON.stringify(obj);
    } catch (e) {
      return ''
    }
  };
  var dataSetParse = function (dataSet, key) {
    if (key != NULL) {
      return tryParseJSON(dataSet[key]);
    }
    var data = {};
    var hasOwn = getHasOwnFn(dataSet);
    for (key in dataSet) {
      if (hasOwn(dataSet, key)) {
        data[key] = tryParseJSON(dataSet[key]);
      }
    }
    return data;
  };

  var getDomData = function (obj, key) {
      return getDomStorageDataByKey(obj, 'data', key)
    },
    setDomData = function (obj, key, value) {
      setDomStorageData(obj, 'data', key, value)
    },
    removeDomData = function (obj, key) {
      removeProperty(getDomData(obj), key)
    };

  function optimalDomQuery(selector, doc, context, once) {
    if (selector) {
      context = context || doc;
      if (once) {
        var node = context.querySelector(selector);
        return node ? [node] : []
      } else {
        return context.querySelectorAll(selector);
      }
    }
    return [];
  }

  var getPaths = function (elements, paths, pathName, selector, until, interval, depth) {
    if (!elements) {
      return paths
    }
    if (!isArray(elements)) {
      elements = [elements];
    }
    interval = isNumber(interval) ? interval : UNDEFINED;
    var dep = 0;
    depth = isNumber(depth) ? depth : UNDEFINED;
    var selectorFn = isFunction(selector) ? selector : noSelectorOrNodeIs;
    var untilFn = isFunction(until) ? until : nodeIs;
    for (var element, pathElement, _dep, _depth, count, i = 0, il = elements.length; i < il; i++) {
      element = elements[i];
      pathElement = element[pathName];
      _dep = dep;
      _depth = depth;
      count = 0;
      while (pathElement && !(_dep >= _depth) && !(count >= interval)) {
        _dep++;
        if (untilFn(pathElement, until)) {
          break
        }
        if (selectorFn(pathElement, selector)) {
          count++;
          if (paths.indexOf(pathElement) < 0) {
            paths.push(pathElement);
          } else if (!_depth || _dep >= _depth || !interval || count >= interval) {
            break;
          }
        }
        pathElement = pathElement[pathName];
      }
    }
    return paths;
  };
  var getParents = function (elements, parents, selector, until, interval, depth) {
    return getPaths(elements, parents, 'parentNode', selector, until, interval, depth);
  };

  var createCustomEvent = function () {
    try {
      new CustomEvent("test", {
        detail: "DOMEvent",
        bubbles: true,
        cancelable: true
      });
      return function (type) {
        return new (win[getEventClass(type = type.type || type)])(type, {
          detail: "DOMEvent",
          bubbles: true,
          cancelable: true
        });
      }
    } catch (e) {
      return function (type) {
        var event = doc.createEvent(getEventClass(type = type.type || type));
        if (event.initCustomEvent) {
          event.initCustomEvent(type, TRUE, TRUE, "DOMEvent");
        } else {
          event.initEvent(type, TRUE, TRUE)
        }
        return event;
      };
    }
  }(), eventClass = {
    key: 'KeyboardEvent',
    mouse: 'MouseEvent',
    custom: 'CustomEvent'
  };
  eachI([['input', 'key'], 'focus', ['blur', 'focus', TRUE], ['touch', 'mouse', !BSupport.touch],
    'animation', 'transition', ['click', 'mouse', TRUE]], function (i, name) {
    var alias, isAlias;
    if (isArray(name)) {
      isAlias = name[2];
      alias = name[1];
      name = name[0];
    } else {
      alias = 'custom';
      name = name[0];
    }
    if (name) {
      var EventName = initCap(name) + 'Event';
      eventClass[name] = !isAlias && win[EventName] ? EventName : eventClass[alias]
    }
  });

  var eventNameList = getKeys(eventClass);
  var getEventClass = function (type) {
    for (var i = 0, name, l = eventNameList.length; i < l; i++) {
      if (!type.indexOf(name = eventNameList[i])) {
        return eventClass[name]
      }
    }
    return eventClass.custom
  };

  var _DT_ = 'data', _NS_ = 'namespace', _RV_ = 'returnValue', _SP_ = 'stopPropagation', _SIP_ = 'stopImmediatePropagation', _OE_ = 'originalEvent';

  function setDOMEventProp(key, value, data, domEvent) {
    if (key !== _OE_ && key !== _DT_ && !isFunction(value)) {
      domEvent[key] = value
    }
  }


  function DOMEvent(event, props) {
    if (!instanceOf(event, Event)) {
      event = createCustomEvent(event)
    }
    var domEvent = this;
    domEvent[_OE_] = event;
    eachIn(event, setDOMEventProp, TRUE, domEvent);
    eachIn(props, setDOMEventProp, domEvent);
    domEvent.keyCode = domEvent.keyCode || domEvent.charCode;
    domEvent.key = domEvent.key || domEvent.char || domEvent.code;
  }

  function getOriginalEventValue(_this, key) {
    return _this[_OE_][key]
  }

  function callOriginalEventValue(_this, key) {
    return _this[_OE_][key]()
  }

  function setOriginalEventValue(_this, key, value) {
    _this[_OE_][key] = value;
  }

  DOMEvent.prototype = {
    set isTrusted(v) {
    },
    get isTrusted() {
      return getOriginalEventValue(this, 'isTrusted')
    },
    get data() {
      return getOriginalEventValue(this, _DT_)
    },
    set data(data) {
      setOriginalEventValue(this, _DT_, data)
    },
    get namespace() {
      return getOriginalEventValue(this, _NS_)
    },
    set namespace(value) {
      setOriginalEventValue(this, _NS_, value)
    },
    get isDOMEvent() {
      return TRUE
    },
    get returnValue() {
      return getOriginalEventValue(this, _RV_)
    },
    set returnValue(value) {
      setOriginalEventValue(this, _RV_, value)
    },
    stopPropagation() {
      callOriginalEventValue(this, _SP_)
    },
    stopImmediatePropagation() {
      callOriginalEventValue(this, _SIP_);
      this.isImmediatePropagationStopped = true;
    },
    preventDefault() {
      var evt = this[_OE_];
      if (evt.cancelable) {
        evt.preventDefault();
      }
      this.returnValue = FALSE
    }
  };
  var fixDOMEvent = $.fixDOMEvent = function (originalEvent, props) {
    return originalEvent && originalEvent.isDOMEvent ? originalEvent : new DOMEvent(originalEvent, props);
  };

  $.merge = function (first, second) {
    var len = +second.length,
      j = 0,
      i = first.length;
    for (; j < len; j++) {
      first[i++] = second[j];
    }
    first.length = i;
    return first;
  };
  var indexOfFn = function (arr, value) {
    return arr.indexOf(value)
  };
  $.uniqueMerge = function (first, second) {
    if (second) {
      var len = +second.length,
        j = 0,
        i = first.length;
      var indexOf = isArray(first) ? indexOfFn : indexOfCall;
      for (; j < len; j++) {
        var val = second[j];
        if (indexOf(first, val) < 0) {
          first[i++] = val;
        }
      }
      first.length = i;
    }
  };
  $.uniqueAdd = function (obj, value, indexOf) {
    if (indexOf) {
      indexOf = isArray(obj) ? indexOfFn : indexOfCall;
    }
    var i = obj.length;
    if (indexOf(obj, value) < 0) {
      obj[i++] = value;
    }
    obj.length = i;
  };
  var uniquePush = $.uniquePush = function (arr, value) {
    if (arr.indexOf(value) < 0) {
      arr.push(value)
    }
  };
  var uniqueConcat = $.uniqueConcat = function (first, second) {
    var args = arguments;
    for (var l = args.length, i = 1; i < l; i++)
      if ((second = args[i])) {
        for (var len = second.length, j = 0; j < len; j++) {
          uniquePush(first, second[j])
        }
      }
  };

  var isValidNodeByContext = function (node, context) {
    return isElement(node) && getParents(node, [], context, NULL, 1).length > 0
  };

  /**
   *
   * @param {DomManipulation} $dom
   * @param selector
   * @param [context]
   * @param [once]
   */
  function queryDom($dom, selector, context, once) {
    if (selector) {
      if (isEleWinDoc(selector)) {
        $dom.push(selector);
        return
      }
      if (isBoolean(context)) {
        once = once || context;
        context = NULL;
      }
      var isValidContext = !context || isElement(context) || isDocument(context);
      if (isString(selector)) {
        var html = selector;
        selector = selector.trim();
        if (html.indexOf('<') > -1 && html.indexOf('>') > -1) {
          var name = selector.match(fragmentRE);
          var childNodes = innerHTMLToTemp(selector, name && containers[name[1]] || 'div').childNodes;
          $dom.push.apply($dom, childNodes);
          return
        } else {
          if (isValidContext) {
            $dom.push.apply($dom, optimalDomQuery(selector, doc, context, once))
          } else {
            $dom.push.apply($dom, _findNodes(createDomM(context), [], selector));
          }
        }
        return
      }
      var isValidNode = context ? isValidNodeByContext : returnTrue, i, node, l;
      if ((isDocumentFragment(selector) && (selector = selector.childNodes)) || isNodeList(selector) || isHTMLCollection(selector)) {
        if (!context) {
          $dom.push.apply($dom, selector)
        } else {
          l = selector.length;
          for (i = 0; i < l; i++) {
            if (isValidNode(node = selector[i], context)) {
              $dom.push(node)
            }
          }
        }
        return
      }

      if (instanceOf(selector, DomManipulation)) {
        if (context) {
          l = selector.length;
          for (i = 0; i < l; i++) {
            if (isValidNode(node = selector[i], context)) {
              $dom.push(node)
            }
          }
        } else {
          $dom.push.apply($dom, selector)
        }
        return
      }

      if (isObject(selector)) {
        l = selector.length;
        for (i = 0; i < l; i++) {
          uniqueConcat($dom, queryDom(selector[i], context, once));
        }
      }
    }
  }

  var DomManipulation = function (selector, context, once) {
    this.length = 0;
    queryDom(this, selector, context, once);
  };

  var createDomM = $.newDM = function (selector, context, once) {
    return new DomManipulation(selector, context, once)
  };

  function getNodes(nodes, newList, selector, callback, once) {
    var nl = nodes.length, isFn = isFunction(callback), _nodeIs = isFunction(selector) ? selector : noSelectorOrNodeIs;
    if (once === UNDEFINED) {
      once = callback && !isFn;
    }
    for (var node, i = 0; i < nl; i++) {
      if (_nodeIs(node = nodes[i], selector)) {
        isFn && callback(node);
        newList.push(node);
        if (once) {
          break;
        }
      }
    }
    return newList
  }

  function _findNodes(nodes, findList, selector) {
    var isStr = isString(selector), node, len = nodes.length, i;
    if (isStr) {
      selector = selector.trim();
      if (selector) {
        for (i = 0; i < len; i++) {
          node = nodes[i];
          if (isElement(node) || isDocument(node)) {
            uniqueConcat(findList, node.querySelectorAll(selector))
          }
        }
      }
    } else if (isFunction(selector)) {
      for (i = 0; i < len; i++) {
        node = selector(nodes[i]);
        if (isElement(node)) {
          uniquePush(findList, node);
        } else if (isNodeList(node) || isHTMLCollection(node) || isArray(node)) {
          for (var j = 0, jl = node.length, n; j < jl; j++) {
            if (isElement(n = node[i])) {
              uniquePush(findList, n)
            }
          }
        }
      }
    }
    return findList;
  }

  function _getChildList(nodes, children, setType, selector) {
    var setName = setType === 1 ? 'children' : 'childNodes';
    var length = nodes.length;
    var _nodeIs = isFunction(selector) ? selector : noSelectorOrNodeIs;
    for (var node, i = 0; i < length; i++) {
      if (isNode(node = nodes[i]) && _nodeIs(node, selector)) {
        uniqueConcat(children, node[setName])
      }
    }
    return children;
  }

  function _addNode(dom, node, transposition, selector) {
    var nodes = dom;
    if (isObject(node)) {
      if (isNode(node) || isWindow(node)) {
        var _nodeIs = isFunction(selector) ? selector : noSelectorOrNodeIs;
        if (_nodeIs(node, selector)) {
          var index = nodes.indexOf(node);
          if (index < 0) {
            nodes.push(node)
          } else if (transposition && index !== nodes.length - 1) {
            nodes.splice(index, 1);
            nodes.push(node);
          }
        }
      } else {
        var l = node.length;
        if (l > 0) {
          for (var i = 0, _node; i < l; i++) {
            if (_node) {
              _addNode(dom, _node, transposition, selector)
            }
          }
        }
      }
    }
    return dom;
  }

  function _nextPrev(dom, isNext, elements, list, selector, until, depth) {
    var m = isNext ? 'nextElementSibling' : 'previousElementSibling';
    getPaths(elements || dom.gets(isElement), list, m, selector, until, UNDEFINED, depth);
    if (!isNext) {
      list.reverse();
    }
    return list;
  }

  function _classNameManage(dom, method, className) {
    if (method && className) {
      var classes = className.split(' ');
      var nodes = dom;
      for (var l = nodes.length, i = 0, node; i < l; i++) {
        node = nodes[i];
        if (isElement(node)) {
          for (var cl = classes.length, j = 0; j < cl; j++) {
            if (nonEmptyString(className = classes[j])) {
              method(node, className)
            }
          }
        }
      }
    }
    return dom;
  }


  function _dataManage(dom, args, getMethod, setMethod, isMethod) {
    var map, key = args[0], al = args.length;

    if (al < 2) {
      if (key && isObject(key)) {
        map = key;
      } else {
        if (al && key != NULL) {
          key = key + ''
        }
        var element = dom.gets(isMethod, 1)[0];
        return element && getMethod(element, key)
      }
    } else {
      map = {};
      var value = args[1];
      if (isArray(key)) {
        for (var ki = 0, kl = key.length; ki < kl; ki++) {
          map[key[ki]] = value;
        }
      } else {
        map[key] = value;
      }
    }
    if (map) {
      var elements = dom.gets(isMethod);
      var l = elements.length;
      if (l) {
        var i;
        var hasOwn = getHasOwnFn(map);
        for (key in map) {
          if (hasOwn(map, key)) {
            for (i = 0; i < l; i++) {
              setMethod(elements[i], key, map[key]);
            }
          }
        }
      }
    }
    return dom
  }

  function _removeDataManage(dom, keys, removeMethod, isMethod, ifNullRemoveAll) {
    if (keys != NULL) {
      keys = isArray(keys) ? keys : [keys];
      dom.gets(isMethod, function (element) {
        for (var i = 0, l = keys.length; i < l; i++) {
          removeMethod(element, keys[i])
        }
      });
    } else if (ifNullRemoveAll) {
      dom.gets(isMethod, function (element) {
        removeDomStorage(element, 'data')
      })
    }
    return dom
  }

  function $removeDataset(keys) {
    return _removeDataManage(this, keys, removeDataSet, isElement)
  }

  $.DomManipulation = DomManipulation;
  var $fn = $.fn = DomManipulation.prototype = {
    indexOf: arrayIndexOf,
    push: arrayProto.push,
    splice: arrayProto.splice,
    arrSlice: arrayProto.slice,
    size: function () {
      return this.length
    },
    filter: function (selector, once) {
      return getNodes(this, createDomM(), selector, once)
    },
    /*    filterHide: function (once) {
          return this.filter(function (node) {
            return isElement(node) && (node)
          }, once)
        },
        filterVisible: function (once) {
          return this.filter(isVisible, once)
        },
        filterByClass: function (className) {
          return filterByClass(this,createDomM(), className)
        },*/
    gets: function (selector, callback, once) {
      return getNodes(this, [], selector, callback, once)
    },
    get: function (index) {
      return this[index]
    },
    eq: function (index) {
      var nodes = this;
      return domFromNode(nodes[index < 0 ? nodes.length + index : index])
    },
    index: function (elem) {
      var nodes = this;
      var node = nodes[0];
      if (!node) {
        return -1
      }
      if (!elem) {
        return (node.parentNode) ? this.first().prevAll().length : -1;
      }
      return domFromNode(elem).indexOf(node);
    },

    first: function () {
      return this.eq(0)
    },
    last: function () {
      return this.eq(-1)
    },
    findNodes: function (selector) {
      return _findNodes(this, [], selector)
    },
    find: function (selector) {
      return _findNodes(this, createDomM(), selector)
    },
    closest: function (selector) {
      return getParents(this.gets(isElement), createDomM(), selector, UNDEFINED, 1)
    },
    parent: function (selector) {
      return getParents(this.gets(isElement), createDomM(), selector, UNDEFINED, 1, 1)
    },
    offsetParent: function () {
      var list = [], nodes = this, l = nodes.length;
      for (var element, i = 0; i < l; i++) {
        if (isElement(element = nodes[i])) {
          var offsetParent = element.offsetParent;
          while (offsetParent && getStyleValue(offsetParent, 'position') === "static") {
            offsetParent = offsetParent.offsetParent;
          }
          offsetParent = offsetParent || element.ownerDocument.documentElement;
          if (offsetParent && list.indexOf(offsetParent) < 0) {
            list.push(offsetParent);
          }
        }
      }
      return domFromNodes(list);
    },
    parents: function (selector) {
      return getParents(this.gets(isElement), createDomM(), selector)
    },
    parentsUntil: function (selector) {
      return getParents(this.gets(isElement), createDomM(), UNDEFINED, selector)
    },
    children: function (selector) {
      return _getChildList(this, createDomM(), 1, selector)
    },
    /**
     * childNodes
     * @param selector
     * @return {DomManipulation}
     */
    childNodes: function (selector) {
      return _getChildList(this, createDomM(), 0, selector);
    },

    next: function (selector) {
      return _nextPrev(this, 1, UNDEFINED, createDomM(), selector, UNDEFINED, 1);
    },
    nextAll: function (selector) {
      return _nextPrev(this, 1, UNDEFINED, createDomM(), selector)
    },
    nextUntil: function (selector) {
      return _nextPrev(this, 1, UNDEFINED, createDomM(), UNDEFINED, selector);
    },
    prev: function (selector) {
      return _nextPrev(this, 0, UNDEFINED, createDomM(), selector, UNDEFINED, 1);
    },
    prevAll: function (selector) {
      return _nextPrev(this, 0, UNDEFINED, createDomM(), selector)
    },
    prevUntil: function (selector) {
      return _nextPrev(this, 0, UNDEFINED, createDomM(), UNDEFINED, selector)
    },
    siblings: function (selector) {
      var dom = this, siblings = createDomM();
      var elements = dom.gets(isElement), list = [];
      _nextPrev(dom, 0, elements, list, selector);
      _nextPrev(dom, 1, elements, list, selector);
      uniqueConcat(siblings, list);
      return siblings;
    },
    css: function (name, value) {
      var $this = this;
      if (isObject(name)) {
        for (var key in name) {
          if (hasOwnProperty.call(name, key)) {
            value = name[key];
            $this.css(key, value);
          }
        }
        return $this
      }
      if (!name) {
        return
      }
      if (name === 'scrollTop' || name === 'scrollLeft') {
        return $this[name](value)
      }
      var nameList = toStyleNameList(name);
      if (!nameList) {
        return
      }
      if (value != NULL) {
        var isNumberSet = /^(width|height|top|left|right|bottom|margin|padding|border)/.test(name);
        var isColor = !isNumberSet && /(backgound|color)$/.test(name);
        var elements = getNodes($this, [], isElement);
        if (elements.length) {
          var numValue = +value;
          setStyleValue(elements, nameList, isFinite(numValue) ? isNumberSet ? numValue + 'px' : isColor ? numValue.toString(16) : value : value);
        }
        return $this;
      }
      var element = $this[0];
      if (isElement(element)) {
        value = getStyleValue(element, nameList);
        if (value === "normal" && name in cssNormalTransform) {
          value = cssNormalTransform[name];
        }
        return value
      }
    },

    addClass: function (className) {
      return _classNameManage(this, addClass, className)
    },
    removeClass: function (className) {
      return _classNameManage(this, removeClass, className);
    },
    hasClass: function (className) {
      return hasClass(this[0], className)
    },
    hasClassIndexOf: function (className) {
      return hasClassIndexOf(this, className)
    },
    toggleClass: function (className) {
      return _classNameManage(this, toggleClass, className);
    },
    isHide: function () {
      return isHide(this.gets(isElement, 1)[0])
    },
    isInvisible: function () {
      return isInvisible(this.gets(isElement, 1)[0])
    },
    isShow: function () {
      return !this.isHide()
    },
    isVisible: function () {
      return !this.isInvisible();
    },
    show: function () {
      return showHideEach(this, TRUE)
    },
    hide: function () {
      return showHideEach(this, FALSE)
    },
    toggle: function (state) {
      if (typeof state === "boolean") {
        return showHideEach(this, state);
      }
      var nodes = this;
      for (var i = 0, l = nodes.length, node; i < l; i++) {
        node = nodes[i];
        showHide(node, isHide(node))
      }
      return this
    },
    add: function (node, selector) {
      return _addNode(this, node, FALSE, selector);
    },
    pushStack: function (node, selector) {
      return _addNode(this, node, TRUE, selector);
    },
    each: function (callback) {
      for (var i = 0, nodes = this, l = nodes.length, node; i < l; i++) {
        if (callback.call(node = nodes[i], i, node, nodes) === FALSE) {
          break;
        }
      }
      return this;
    },
    reverse: arrayProto.reverse,
    sort: arrayProto.sort,
    map: function (callback) {
      var $new = createDomM();
      this.each(function (elem, i) {
        return $new.add(callback.call(elem, i, elem));
      });
      return $new;
    },
    slice: function (start, end) {
      return domFromNodes(this.arrSlice(start, end));
    },
    /**
     *
     * @returns T[]
     */
    toArray: function () {
      return this.arrSlice()
    },
    is: function (selector) {
      for (var i = 0, nodes = this, l = nodes.length; i < l; i++) {
        if (nodeIs(nodes[i], selector)) {
          return TRUE;
        }
      }
      return FALSE;
    },
    isIndexOf: function (selector) {
      for (var i = 0, nodes = this, l = nodes.length; i < l; i++) {
        if (nodeIs(nodes[i], selector)) {
          return i;
        }
      }
      return -1;
    },
    not: function (selector) {
      return this.filter(function (node) {
        return !nodeIs(node, selector)
      })
    },
    has: function (selector) {
      return _findNodes(this, [], selector).length > 0
    },
    prop: function (propName, value) {
      var nodes = this;
      if (arguments.length > 1) {
        for (var i = 0, l = nodes.length, node; i < l; i++) {
          if ((node = nodes[i])) {
            node[propName] = value;
          }
        }
        return this;
      } else {
        return nodes[0] && nodes[0][propName]
      }
    },
    removeProp: function (name) {
      var nodes = this;
      for (var i = 0, l = nodes.length, node; i < l; i++) {
        if ((node = nodes[i])) {
          removeProperty(node, name)
        }
      }
      return this;
    },
    call: function (method) {
      var dom = this, nodes = dom;
      if (nodes.length) {
        var args = arguments, arg, hasArg, useApply, l = args.length;
        if ((useApply = l > 2)) {
          args = arraySlice.call(args, 1)
        } else if ((hasArg = l > 1)) {
          arg = args[0]
        }
        l = nodes.length;
        for (var i = 0, node; i < l; i++) {
          node = nodes[i];
          if (isFunction(node[method])) {
            if (useApply) {
              node[method].apply(node, args)
            } else if (hasArg) {
              node[method](arg)
            } else {
              node[method]()
            }
          }
        }
      }
      return dom
    },
    attr: function (name, value) {
      return _dataManage(this, arguments, getAttr, setAttr, isElement);
    },
    removeAttr: function (attrs) {
      return _removeDataManage(this, attrs, removeAttr, isElement)
    },
    data: function (key, value) {
      return _dataManage(this, arguments, getDomData, setDomData, isObject);
    },
    removeData: function (keys) {
      return _removeDataManage(this, keys, removeDomData, isObject, TRUE)
    },
    dataset: function (key, value) {
      return _dataManage(this, arguments, getDataSet, setDataSet, isElement)
    },
    dataSet: function (key, value) {
      return _dataManage(this, arguments, getDataSetJSON, setDataSetJSON, isElement)
    },
    removeDataset: $removeDataset,
    removeDataSet: $removeDataset,
    hover: function (fnOver, fnOut) {
      return this.on('mouseenter')(fnOver).on('mouseleave', fnOut || fnOver);
    },
    removeHover: function (fnOver, fnOut) {
      if (fnOver) {
        this.off('mouseenter', fnOver).off('mouseleave', fnOut || fnOver)
      }
      return this;
    },
    val: function (value) {
      var dom = this;
      var elements = dom.gets(isElement);
      var i, l, element;
      if (!arguments.length) {
        element = elements[0];
        if (element) {
          if (element.multiple && element.nodeName.toLowerCase() === 'select') {
            var values = [];
            var selectedOptions = element.selectedOptions;
            l = selectedOptions.length;
            for (i = 0; i < l; i += 1) {
              values.push(selectedOptions[i].value);
            }
            return values;
          }
          return element.value || element.defaultValue || '';
        }
        return '';
      }
      if (value !== UNDEFINED) {
        l = elements.length;
        for (i = 0; i < l; i++) {
          element = elements[i];
          if (isArray(value) && element.multiple && element.nodeName.toLowerCase() === 'select') {
            for (var j = 0, _options = element.options, len = _options.length; j < len; j += 1) {
              _options[j].selected = value.indexOf(_options[j].value) > -1;
            }
          } else {
            element.value = value;
          }
        }
      }
      return dom;
    },
    text: function (text) {
      var noneArg = !arguments.length;
      var element;
      if (noneArg) {
        element = this.gets(isElement, 1)[0];
        return element ? iifString(element.textContent) : '';
      }
      if (text !== UNDEFINED) {
        for (var nodes = this, l = nodes.length, i = 0; i < l; i++) {
          if (isElement(element = nodes[i])) {
            domFromNode(element).empty();
            element.textContent = text
          }
        }
      }
      return this;
    },
    html: function (html) {
      var noneArg = !arguments.length;
      var element;
      if (noneArg) {
        element = this.gets(isElement, 1)[0];
        return element ? element.innerHTML : undefined;
      }

      if (html !== UNDEFINED) {
        var isObj = isObject(html);
        for (var nodes = this, l = nodes.length, i = 0, $node; i < l; i++) {
          if (isElement(element = nodes[i])) {
            $node = domFromNode(element).empty();
            if (isObj) {
              $node.append(html);
            } else {
              element.innerHTML = html
            }
          }
        }
      }
      return this;
    },
    ready: function (readyCall) {
      if (isFunction(readyCall)) {
        domReady(readyCall)
      }
      return this;
    },
    nativeClick: function (data) {
      for (var nodes = this, l = nodes.length, node, i = 0; i < l; i++) {
        var $node = domFromNode(node = nodes[i]);
        if (data) {
          $node.data("nativeClickData", data)
        }
        (isFunction(node.click) ? node : $node).click();
        $node.removeData("nativeClickData")
      }
      return this;
    },
    nativeEventShortcuts: ['click', 'blur', 'focus', 'change', 'select', 'submit'],
    _eventShortcut: function (type, data, handler) {
      var dom = this;
      var nes = dom.nativeEventShortcuts;
      if (isFunction(data)) {
        handler = data;
        data = NULL;
      }
      if (!isFunction(handler)) {
        var nodes = dom;
        for (var i = 0, l = nodes.length, node; i < l; i++) {
          if ((node = nodes[i])) {
            if (isFunction(node[type]) && nes.indexOf(type) > -1) {
              node[type]()
            } else {
              $.byNode(node).trigger(type)
            }
          }
        }
      } else {
        dom.on(type, NULL, data, handler)
      }
      return dom
    },
    _bindEventShortcut: function (name) {
      this[name] = function (data, func) {
        return this._eventShortcut(name, data, func)
      }
    },
    detach: function (selector) {
      for (var i = 0, nodes = this, l = nodes.length, node; i < l; i++) {
        node = nodes[i];
        if (noSelectorOrNodeIs(node, selector)) {
          if (node.parentNode && node.parentNode.removeChild) {
            node.parentNode.removeChild(node);
          }
        }
      }
      return this;
    },
    remove: function (selector) {
      var dom = this, isNum = isNumber(selector);
      for (var i = 0, nodes = dom, l = nodes.length, node; i < l; i++) {
        node = nodes[i];
        if (isNum ? i === selector : noSelectorOrNodeIs(node, selector)) {
          removeEventAndDomStorageAll(node);
          detach(node);
        }
      }
      return dom;
    },
    empty: function () {
      this.childNodes().remove();
      return this.each(function (i, el) {
        if (isElement(el) && el.innerHTML != NULL) {
          el.innerHTML = '';
        }
      });
    },
    offset: function () {
      var rect, win,
        elem = this[0];
      if (!isElement(elem)) {
        return {top: 0, left: 0}
      }
      if (!elem.getClientRects().length) {
        return {top: 0, left: 0};
      }
      // Get document-relative position by adding viewport scroll to viewport-relative gBCR
      rect = elem.getBoundingClientRect();
      win = elem.ownerDocument.defaultView;
      return {
        top: rect.top + win.pageYOffset,
        left: rect.left + win.pageXOffset
      };
    },
    position: function () {
      var dom = this;
      var elem = dom[0];
      if (!isElement(elem)) {
        return
      }
      var offsetParent, offset, doc,
        parentOffset = {top: 0, left: 0};
      if (getStyleValue(elem, "position") === "fixed") {
        offset = elem.getBoundingClientRect();
      } else {
        offset = dom.offset();
        doc = elem.ownerDocument;
        offsetParent = elem.offsetParent || doc.documentElement;
        while (offsetParent &&
        (offsetParent === doc.body || offsetParent === doc.documentElement) &&
        getStyleValue(offsetParent, "position") === "static") {
          offsetParent = offsetParent.parentNode;
        }
        if (offsetParent && offsetParent !== elem && offsetParent.nodeType === 1) {
          parentOffset = domFromNode(offsetParent).offset();
          parentOffset.top += toNumeral(getStyleValue(offsetParent, "borderTopWidth"));
          parentOffset.left += toNumeral(getStyleValue(offsetParent, "borderLeftWidth"));
        }
      }
      return {
        top: offset.top - parentOffset.top - toNumeral(getStyleValue(elem, "marginTop", TRUE)),
        left: offset.left - parentOffset.left - toNumeral(getStyleValue(elem, "marginLeft", TRUE))
      };
    },
    width: function (value) {
      return innerSize(this, 'width', value);
    },
    height: function (value) {
      return innerSize(this, 'height', value)
    },
    outerWidth: function (valueOrIncludeMargins) {
      return outerSize(this, 'width', valueOrIncludeMargins);
    },
    outerHeight: function (valueOrIncludeMargins) {
      return outerSize(this, 'height', valueOrIncludeMargins);
    },
    scrollTop: function (value) {
      return scrollValue(this, TRUE, value)
    },
    scrollLeft: function (value) {
      return scrollValue(this, FALSE, value)
    },
    scrollTo: function (x, y) {
      var nodes = this;
      for (var i = 0, l = nodes.length, node; i < l; i++) {
        node = nodes[i];
        if (node && isFunction(node.scrollTo)) {
          node.scrollTo(x, y)
        }
      }
      return this;
    },
    append: function append() {
      for (var i = 0, nodes = this, l = nodes.length, element; i < l; i++) {
        if (isElement(element = nodes[i])) {
          element.appendChild(appendToFragment(arguments, element))
        }
      }
      return this;
    },
    appendTo: function (parent) {
      $(parent).append(this.toArray().reverse());
      return this;
    },
    prepend: function () {
      for (var i = 0, nodes = this, l = nodes.length, element; i < l; i++) {
        if (isElement(element = nodes[i])) {
          element.insertBefore(appendToFragment(arguments, element, TRUE), element.firstChild)
        }
      }
      return this;
    },
    prependTo: function (parent) {
      $(parent).prepend(this);
      return this;
    },
    before: function () {
      for (var i = 0, nodes = this, l = nodes.length, node, parentNode; i < l; i++) {
        if (isNode(node = nodes[i]) && (parentNode = node.parentNode)) {
          parentNode.insertBefore(appendToFragment(arguments, parentNode), node)
        }
      }
      return this;
    },
    insertBefore: function (nextNode) {
      $(nextNode).before(this);
      return this;
    },
    after: function () {
      for (var i = 0, nodes = this, l = nodes.length, node; i < l; i++) {
        if (isNode(node = nodes[i]) && node.parentNode) {
          var parentNode = node.parentNode;
          var nextNode = node.nextSibling;
          node = appendToFragment(arguments, parentNode, TRUE);
          if (nextNode) {
            parentNode.insertBefore(node, nextNode)
          } else {
            parentNode.appendChild(node)
          }
        }
      }
      return this;
    },
    insertAfter: function (prevNode) {
      $(prevNode).after(this);
      return this;
    },
    wrapAll: function (wrap) {
      var nodes = this.gets(isNode), l = nodes.length;
      if (l) {
        var newWrap = appendToFragment(wrap).children[0];
        if (newWrap) {
          for (var i = 0, node, parentNode; i < l; i++) {
            node = nodes[i];
            if ((parentNode = node.parentNode) && !newWrap.contains(parentNode)) {
              node.parentNode.replaceChild(newWrap, node);
              break;
            }
          }
          newWrap.appendChild(appendToFragment(nodes, newWrap))
        }
      }
      return this
    },
    wrapInner: function (wrap) {
      var nodes = this.gets(isElement), l = nodes.length;
      if (l) {
        var isStr = isString(wrap);
        var wrapElement = appendToFragment(wrap).children[0];
        if (wrapElement) {
          for (var i = 0, node; i < l; i++) {
            node = nodes[i];
            if (node.firstChild) {
              var newWrap = isStr ? wrapElement.cloneNode(TRUE) : wrapElement;
              wrap = getDeepestInnerElement(newWrap);
              wrap.appendChild(appendToFragment(node.childNodes, !isStr && wrap));
            }
            if (!newWrap.contains(node)) {
              node.appendChild(newWrap)
            }
          }
        }
      }
      return this;
    },
    wrap: function (wrap) {
      var nodes = this.gets(isNode), l = nodes.length;
      if (l) {
        var isStr = isString(wrap);
        var wrapElement = appendToFragment(wrap).children[0];
        if (wrapElement) {
          for (var i = 0, node, parentNode; i < l; i++) {
            node = nodes[i];
            var newWrap = isStr ? wrapElement.cloneNode(TRUE) : wrapElement;
            if ((parentNode = node.parentNode) && (isStr || !newWrap.contains(parentNode))) {
              parentNode.replaceChild(newWrap, node)
            }
            wrap = getDeepestInnerElement(newWrap);
            if (isStr || !node.contains(node)) {
              wrap.appendChild(node);
            }
          }
        }
      }
      return this
    },
    unwrap: function (selector) {
      var $parent = this.parent(selector).not("body");
      var nodes = $parent;
      for (var i = 0, l = nodes.length, element; i < l; i++) {
        domFromNode(element = nodes[i]).replaceWith(element.childNodes);
      }
      return this;
    },
    replaceWith: function (newReplace) {
      var nodes = this, l = nodes.length;
      if (l && newReplace != NULL) {
        for (var i = 0, node, parentNode, fragment; i < l; i++) {
          if (isNode(node = nodes[i]) && (parentNode = node.parentNode)) {
            fragment = appendToFragment(newReplace, parentNode);
            parentNode.replaceChild(fragment, node)
          }
        }
      }
      return this;
    },
    replaceAll: function (targetReplace) {
      if (targetReplace) {
        var fragment = appendToFragment(this.gets(isElement));
        var nodes = $(targetReplace);
        for (var i = 0, l = nodes.length, node, parentNode; i < l; i++) {
          if (isNode(node = nodes[i]) && (parentNode = node.parentNode)) {
            parentNode.replaceChild(fragment.cloneNode(TRUE), node)
          }
        }
      }
      return this;
    },
    clone: function (deep) {
      var cloneNodes = [];
      deep = deep !== FALSE;
      for (var i = 0, nodes = this, l = nodes.length, node; i < l; i++) {
        if (isNode(node = nodes[i])) {
          cloneNodes.push(node.cloneNode(deep))
        }
      }
      return domFromNodes(cloneNodes)
    },
    one: function (event, childSelector, listener, options) {
      return this.on(event, childSelector, listener, options, TRUE)
    },
    on: function (event, childSelector, listener, options, isOne) {
      var _this = this;
      if (!_this.length) {
        return _this
      }
      event = parseEvent(event);
      var _sel, _fn, _e = event.e;
      if (_e) {
        if (isFunction(childSelector)) {
          _sel = '';
          if (!isFunction(listener)) {
            _fn = childSelector;
            options = listener;
          }
        } else {
          _sel = isString(childSelector) ? childSelector.trim() : '';
          _fn = listener;
        }
      }
      if (!isFunction(_fn)) {
        return _this;
      }
      var eventOption = FALSE, once;
      if (isObject(options)) {
        once = isOne === TRUE || !!options.once;
        eventOption = supportPassive && {capture: FALSE, passive: options.passive}
      } else {
        once = isOne === TRUE || options === TRUE;
      }
      event.fn = _fn;
      event.sel = _sel;
      event.once = once;
      return _this.each(function (i, el) {
        if (isObject(el)) {
          var handlersMap = getDomStorage(el, eventListenersMapName, TRUE), isAdd;
          var handlers = handlersMap[_e] || (isAdd = TRUE) && (handlersMap[_e] = []);
          handlers.push(event);
          if (isAdd) {
            addEventListener(el, _e, eventProxy, eventOption)
          }
        }
      })
    },
    off: function (event, childSelector, listener) {
      var _this = this;
      if (!_this.length) {
        return _this
      }
      var _sel, _fn;
      if (isFunction(childSelector)) {
        _fn = childSelector;
      } else {
        _sel = childSelector;
        _fn = listener
      }
      var targetHandler = parseEvent(event), type = targetHandler.e, ns = targetHandler.ns, nonSelector = !childSelector,
        isFn = isFunction(_fn), isRemoveEvent = type && nonSelector && isFn;
      if (!type && !ns && nonSelector && !isFn) {
        return _this
      }
      if (type === '') {
        return _this.offAll(ns, _sel, listener);
      }
      targetHandler.fn = _fn;
      targetHandler.sel = _sel;
      return _this.each(function (i, el) {
        if (isObject(el)) {
          removeEventEach(el, type, targetHandler);
          if (isRemoveEvent) {
            removeEventListener(el, type, _fn);
          }
        }
      });
    },
    offAll: function (namespace, childSelector, listener) {
      if (isFunction(namespace)) {
        listener = namespace;
        namespace = '';
      } else if (isFunction(childSelector)) {
        listener = childSelector;
        childSelector = '';
      }
      namespace = isString(namespace) ? namespace : '';
      return this.each(function (i, el) {
        offAll(el, namespace, childSelector, listener)
      })
    },
    trigger: function (event, data) {
      var _this = this;
      if (!_this.length) {
        return _this
      }
      var handler = parseEvent(event);
      var type = handler.e, ns = handler.ns;
      return _this.each(function (i, el) {
        if (isObject(el)) {
          var _event = instanceOf(event, Event) ? event : createCustomEvent(type);
          _event.data = data === UNDEFINED ? _event.data : data;
          _event.namespace = ns;
          if (el.dispatchEvent) {
            el.dispatchEvent(_event)
          } else if (el.triggerEvent) {
            el.triggerEvent(event, data)
          } else {
            eventProxy(new DOMEvent(event, {currentTarget: el, target: el}));
          }
        }
      })
    }
  };

  function offAll(el, namespace, childSelector, listener) {
    if (isObject(el)) {
      var handlersMap = getDomStorage(el, eventListenersMapName);
      if (isObject(handlersMap)) {
        for (var type in handlersMap) {
          if (handlersMap.hasOwnProperty(type)) {
            domFromNode(el).off(type + namespace, childSelector, listener);
          }
        }
        removeDomStorage(el, eventListenersMapName);
      }
    }
  }

  function parseEvent(evt) {
    var e, ns;
    if (evt) {
      if (isString(evt)) {
        var index = evt.indexOf('.');
        if (index !== -1) {
          e = evt.slice(0, index).trim();
          ns = evt.slice(index).trim() + '.';
        } else {
          e = evt.trim();
          ns = ''
        }
      } else if (instanceOf(evt, Event)) {
        e = evt.type;
        ns = evt.namespace || ''
      } else if (isObject(evt)) {
        return assign({}, evt)
      }
    }

    return {e: e, ns: ns}
  }

  function removeEventListener(el, type, listener) {
    if (el && el.removeEventListener) {
      el.removeEventListener(type, listener)
    }
  }

  function addEventListener(el, type, listener, options) {
    if (el && el.addEventListener) {
      el.addEventListener(type, listener, options)
    }
  }


  function isSameHandler(handler, event, isOff) {
    var e = event.e, fn = event.fn, ns = event.ns, sel = event.sel;
    return handler
      && (!e || handler.e === e)
      && (!ns || (isOff ? handler.ns === ns : handler.ns.indexOf(ns) === 0))
      && (!fn || handler.fn === fn)
      && (!sel || handler.sel === sel)
  }

  function matchesTargetSelector(current, target, selector) {
    var isMatches = !selector;
    while (!isMatches && isElement(target) && target !== current) {
      if (target.matches(selector)) {
        isMatches = TRUE;
      }
      target = target.parentNode;
    }
    return isMatches;
  }

  function handleEventReturn(result, evt) {
    if (result === FALSE) {
      evt.preventDefault();
      evt.stopPropagation();
      evt.stopImmediatePropagation();
      return result
    }
    return evt.isImmediatePropagationStopped;
  }

  function eventProxy(event) {
    var currentTarget = event.currentTarget, target = event.target;
    var handlersMap = getDomStorage(currentTarget, eventListenersMapName);
    if (handlersMap) {
      var type = event.type, ns = event.namespace || '';
      var targetHandler = {e: type, ns: ns};
      var handlers = handlersMap[type];
      if (handlers) {
        event = fixDOMEvent(event);
        eachI(handlers.concat(), function (i, currentHandler) {
          if (isSameHandler(currentHandler, targetHandler) && matchesTargetSelector(currentTarget, target, currentHandler.sel)) {
            if (currentHandler.once) {
              removeEventOne(handlers, handlersMap, currentHandler, targetHandler, currentTarget, type)
            }
            return handleEventReturn(currentHandler.fn.call(currentTarget, event), event);
          }
        });
        deleteHandlersMap(currentTarget, handlersMap)
      }
    }
  }

  function removeEventOne(handlers, handlersMap, currentHandler, targetHandler, currentElement, type) {
    handlers.splice(handlers.indexOf(currentHandler), 1);
    if (!handlers.length) {
      tryDelete(handlersMap, type);
      removeEventListener(currentElement, type, eventProxy);
    }
  }

  function deleteHandlersMap(element, handlersMap) {
    if (isEmptyObject(handlersMap, TRUE)) {
      removeDomStorage(element, eventListenersMapName);
    }
  }

  function removeEventEach(currentElement, type, targetHandler) {
    var handlersMap = getDomStorage(currentElement, eventListenersMapName);
    if (handlersMap) {
      var handlers = handlersMap[type];
      if (handlers) {
        handlers.concat().forEach(function (currentHandler) {
          if (isSameHandler(currentHandler, targetHandler, TRUE)) {
            removeEventOne(handlers, handlersMap, currentHandler, targetHandler, currentElement, type)
          }
        })
      }
      deleteHandlersMap(handlersMap)
    }
  }


  $.jquery = 'X';
  var getDeepestInnerElement = function (element) {
    var children;
    while ((children = element.children[0])) {
      element = children
    }
    return element;
  };
  var appendToFragment = function (newChild, target, isPrepend) {
    var fragment = document.createDocumentFragment();
    if (!newChild) {
      return fragment
    }
    if (isDocumentFragment(newChild)) {
      newChild = newChild.childNodes;
    }
    if (isString(newChild)) {
      var tempDiv = doc.createElement('div');
      tempDiv.innerHTML = newChild;
      var tempNodes = tempDiv.childNodes;
      for (var t = 0, tl = tempNodes.length; t < tl; t++) {
        fragment.appendChild(tempNodes[t])
      }
    } else if (isNode(newChild)) {
      var nt = newChild.nodeType;
      if (nt && nt !== 2 && (!target || !newChild.contains(target))) {
        try {
          fragment.appendChild(newChild)
        } catch (e) {

        }
      }
    } else {
      newChild = instanceOf(newChild, DomManipulation) ? newChild.toArray() : newChild;
      var i, l = newChild.length;
      if (isPrepend) {
        for (i = l - 1; i >= 0; i--) {
          fragment.appendChild(appendToFragment(newChild[i], target, isPrepend))
        }
      } else {
        for (i = 0; i < l; i++) {
          fragment.appendChild(appendToFragment(newChild[i], target, isPrepend))
        }
      }
    }
    return fragment;
  };
  var scrollValue = function (dom, isTop, value) {
    var nodes = dom, el = nodes[0], isUn = value === UNDEFINED;
    var scrollTop = 'scrollTop', scrollLet = 'scrollLet', scroll = isTop ? scrollTop : scrollLet;
    var elIsWindow = isWindow(el);
    if (elIsWindow) {
      scrollTop = 'pageYOffset';
      scrollLet = 'pageXOffset';
      if (isUn) {
        return isTop ? el[scrollTop] : el[scrollLet];
      }
    }
    if (!isUn) {
      for (var i = 0, l = nodes.length, node; i < l; i++) {
        node = nodes[i];
        if (node) {
          if (isFunction(el.scrollTo)) {
            if (isTop) {
              el.scrollTo(el[scrollTop], value)
            } else {
              el.scrollTo(value, el[scrollLet])
            }
          } else if (scroll in el) {
            el[scroll] = value;
          }
        }
      }
      return dom
    }
    return el && el[scroll] || 0;
  };

  function getOuterSize(node, dimension, includeMargins, dimensionProperty) {
    dimensionProperty = dimensionProperty || initCap(dimension);
    var margin = dimensionProperty === 'Width' ? ['marginLeft', 'marginRight'] : ['marginTop', 'marginBottom'];
    if (isElement(node)) {
      var size = node['offset' + dimensionProperty];
      if (includeMargins) {
        var styles = getComputedStyle(node);
        return size + (parseInt(styles[margin[0]]) || 0) + (parseInt(styles[margin[1]]) || 0);
      }
      return size;
    } else {
      return getInnerSize(node, dimension, dimensionProperty)
    }
  }

  function getInnerSize(node, dimension, dimensionProperty) {
    if (!node) {
      return 0;
    }
    dimensionProperty = dimensionProperty || initCap(dimension);
    var client = "client" + dimensionProperty;
    if (isDocument(node)) {
      var html = node.documentElement, body = node.body, max = Math.max,
        scroll = "scroll" + dimensionProperty, offset = "offset" + dimensionProperty,
        htmlSize = html ? max(html[scroll], html[offset], html[client]) : 0,
        bodySize = body ? max(body[scroll], body[offset], body[client]) : 0;
      return max(bodySize, htmlSize);
    }
    if (isWindow(node)) {
      return node['inner' + dimensionProperty]
    } else if (isElement(node)) {
      var value = parseFloat(getComputedStyle(node).width);
      return isNaN(value) ? node[client] : value
    } else {
      return +node[client] || 0
    }
  }

  function innerSize($this, name, value) {

    return value === UNDEFINED ? getInnerSize($this[0], name) : $this.css(name, value)
  }

  function outerSize($this, name, valueOrIncludeMargins) {
    return valueOrIncludeMargins === UNDEFINED || isBoolean(valueOrIncludeMargins) ? getOuterSize($this[0], name, valueOrIncludeMargins) : setOuterSize($this, name, valueOrIncludeMargins)
  }

  function setOuterSize($this, name, value) {
    var outerName = 'outer' + initCap(name);
    $this.each(function (i, el) {
      var $el = $(el);
      var w = $el[outerName]() - $el[name]();
      $el.css(name, value).css(name, $el[name]() - w);
    })
  }

  var detach = function (node) {
    if (isNode(node) && node.parentNode) {
      node.parentNode.removeChild(node)
    }
  };

  var removeEventAndDomStorageAll = function (node, childSelector) {
    offAll(node, '', UNDEFINED, UNDEFINED);
    removeDomStorageGroup(node);
    removeChildEventAndDomStorage(node, childSelector);
  };
  var removeChildEventAndDomStorage = function (node, selector) {
    var nodes = _getChildList([node], [], 0, selector), l = nodes.length;
    if (l) {
      for (var i = 0; i < l; i++) {
        removeEventAndDomStorageAll(nodes[i], selector)
      }
    }
  };
  var cssNormalTransform = $.cssNormalTransform = {
    letterSpacing: "0",
    fontWeight: "400"
  };
  //eventShortcut
  eachI(['blur', 'focus', 'focusin', 'focusout', 'resize', 'scroll', 'click',
    'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout',
    'mouseenter', 'mouseleave', 'change', 'select', 'submit', 'keydown', 'keypress', 'keyup', 'contextmenu'], function (i, name) {
    $fn._bindEventShortcut(name)
  });

  $.proxy = function (fn, context) {
    var tmp, args, proxy;

    if (typeof context === "string") {
      tmp = fn && fn[context];
      context = fn;
      fn = tmp;
    }

    if (!isFunction(fn)) {
      return undefined;
    }

    args = arraySlice.call(arguments, 2);
    proxy = function () {
      return fn.apply(context === UNDEFINED ? this : context, args.concat(arraySlice.call(arguments)));
    };

    return proxy;
  };

  $.trim = function (text) {
    return (text + '').trim()
  };
  var extend = $.assigns = function extend(target, source, deep) {
    if (!source || (!isObject(source) && !isFunction(source))) {
      return;
    }
    for (var key in source) {
      if (hasOwnProperty.call(source, key)) {
        if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
          if (isPlainObject(source[key]) && !isPlainObject(target[key]))
            target[key] = {};
          if (isArray(source[key]) && !isArray(target[key]))
            target[key] = [];
          extend(target[key], source[key], deep)
        } else if (source[key] !== UNDEFINED) target[key] = source[key]
      }
    }
  };
  $.extend = $fn.extend = function () {
    var args = arguments,
      target = args[0] || {},
      length = args.length, newArgs;
    if (typeof target === "boolean") {
      newArgs = [target];
      if (length === 2) {
        newArgs.unshift(this);
      }
      newArgs = newArgs.concat(arraySlice.call(args, 1));
    } else if (length === 1) {
      newArgs = [this, target];
    }
    extend.apply(this, newArgs || args);
    return target;
  };


  //ajax
  function formatParams(data) {
    if (isObject(data)) {
      var arr = [], v;
      for (var name in data) {
        if (hasOwnProperty.call(data, name) && (v = data[name]) != NULL) {
          arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(v))
        }
      }
      return arr.join('&')
    } else {
      return data;
    }
  }

  function parseArguments(url, data, success, dataType, type, length) {
    if (isObject(url)) {
      return url;
    }
    if (isFunction(data)) {
      type = dataType;
      dataType = success;
      success = data;
      data = UNDEFINED;
    }
    if (!isFunction(success) && length < 5) {
      type = dataType;
      dataType = success;
      success = UNDEFINED;
    }
    return {
      url: url,
      data: data,
      type: type,
      success: success,
      dataType: dataType
    }
  }

  function runScript(props, attrs) {
    var script = doc.createElement('script');
    assign(script, props);
    if (isObject(attrs)) {
      for (var a in attrs) {
        if (hasOwnProperty.call(attrs, a)) {
          script.setAttribute(a, attrs[a]);
        }
      }
    }
    head.appendChild(script);
    head.removeChild(script);
    return script;
  }

  function tryDelete(obj, name) {
    try {
      obj[name] = UNDEFINED;
      return delete obj[name];
    } catch (e) {
    }
  }

  function cacheQS(canCache) {
    return canCache ? '' : '&_=' + Date.now();
  }

  function addSearchToUrl(url, search) {
    var w = '?', y = '&', k = '';
    url = String(url).replace(/#[\s\S]*/, k);
    search = search.replace(/^[?&]+/, k);
    return url + (search ? url.indexOf(w) === -1 ? w : url[url.length - 1] === y ? k : y : k) + search
  }


  function ajaxJSONP(options) {
    var jsonp = options.jsonp || 'callback', jsonpCallback = options.jsonpCallback || 'jsonpCallback_' + Date.now(),
      success = options.success, error = options.onerror, complete = options.complete;
    success = isFunction(success) ? success : UNDEFINED;
    error = isFunction(error) ? error : UNDEFINED;
    complete = isFunction(complete) ? complete : UNDEFINED;
    var data = options.data || {};
    data[jsonp] = jsonpCallback;
    var sid, responseData, timeout = options.timeout;
    window[jsonpCallback] = function (data) {
      responseData = data;
    };
    var ret, RET = ret = {
      abort: function () {
        if (on) {
          on({type: 'abort', isLocaleAbort: TRUE})
        }
      }
    }, on = function (e) {
      if (sid) {
        clearTimeout(sid);
      }
      if (ret) {
        ret.abort = noop;
      }
      var script = e.currentTarget;
      var result, successCall = success, errorCall = error, _responseData = responseData, _complete = complete, type = e.type;
      ret = responseData = sid = complete = success = error = on = UNDEFINED;
      if (type !== 'timeout' || !e.isLocaleAbort) {
        if (script) {
          script = script.onerror = script.onload = script.onabort = success;
        }
        tryDelete(window, jsonpCallback);
        jsonpCallback = success;
      }


      if (type === 'load' && !(_responseData === UNDEFINED && (type = 'parseError'))) {
        result = _responseData;
        if (successCall) {
          successCall(result, type);
        }
      } else if (errorCall) {
        errorCall(result, type);
      }
      if (_complete) {
        _complete(result, type)
      }
    };

    if (timeout > 0) {
      sid = setTimeout(function () {
        if (sid) {
          sid = NULL;
          if (on) {
            on({type: 'timeout'})
          }
        }
      }, timeout)
    }
    var url = options.url;
    runScript({
      src: addSearchToUrl(url, formatParams(data)
        + cacheQS(options.cache !== FALSE)),
      onload: on,
      onerror: on,
      onabort: on,
    },/*{nonce:''}*/);
    return RET
  }

  function arrCallbackBind(arrCallback, index) {
    return function (img) {
      var _arrCallback = arrCallback, _index = index;
      arrCallback = index = UNDEFINED;
      if (_arrCallback) {
        _arrCallback(_index, img)
      }
    }
  }

  function loadImage(url, callback) {
    callback = isFunction(callback) ? callback : FALSE;
    if (isArray(url)) {
      var l = url.length, ret = [];
      if (!l) {
        if (callback) {
          callback()
        }
        return ret;
      }
      var arr = [], notError = TRUE, arrCallback = callback && function (i, img) {
        arr[i] = img;
        notError = notError && img !== UNDEFINED;
        if (--l <= 0) {
          var _callback = callback;
          arrCallback = callback = UNDEFINED;
          arr[arr.length] = notError;
          _callback.apply(NULL, arr)
        }
      };
      for (var i = 0; i < l; i++) {
        ret[i] = loadImage(url[i], arrCallback && arrCallbackBind(arrCallback, i));
      }
      return ret;
    }
    var img = new Image();
    if (callback) {
      img.onload = img.onerror = img.onabort = function (e) {
        var img = this, _callback = callback;
        img.onload = img.onerror = img.onabort = callback = UNDEFINED;
        if (e.type === 'load') {
          _callback(img)
        } else {
          _callback()
        }
      };
    }
    img.src = url;
    return img;
  }

  function ajax(options, aData, aSuccess, aDataType, aType) {
    options = parseArguments(options, aData, aSuccess, aDataType, aType, arguments.length);
    var error = options.onerror,
      complete = options.complete;
    error = isFunction(error) ? error : UNDEFINED;
    complete = isFunction(complete) ? complete : UNDEFINED;
    if (!isString(options.url)) {
      if (error || complete) {
        setTimeout(function () {
          var _error, _complete = complete, result = UNDEFINED, type = 'error:InvalidURL';
          error = complete = UNDEFINED;
          if (_error) {
            _error(result, type);
          }
          if (_complete) {
            _complete(result, type)
          }
        })
      }
      return {abort: noop}
    }
    var dataType = options.dataType ? options.dataType.toLowerCase() : 'text';
    if (dataType === 'jsonp') {
      return ajaxJSONP(options);
    }/* else if (dataType === 'image') {
      return loadImage(options);
    }*/
    var search = formatParams(options.data || {}), body = options.body;
    if (!body) {
      body = search;
      search = '';
    }
    var request = new XMLHttpRequest(), type = options.type ? options.type.toUpperCase() : 'GET',
      isAsync = dataType !== 'script' && options.async !== FALSE, k;
    request.open(
      type,
      addSearchToUrl(options.url, search, cacheQS(options.cache !== FALSE)),
      isAsync,
      options.username,
      options.password
    );

    // Apply custom fields if provided
    var xhrFields = options.xhrFields;
    if (isObject(xhrFields)) {
      for (k in xhrFields) {
        request[k] = xhrFields[k];
      }
    }
    // Override mime type if needed
    var mimeType = options.mimeType;
    if (mimeType && request.overrideMimeType) {
      request.overrideMimeType(mimeType);
    }
    var contentType = options.contentType;
    var headers = {'Content-Type': contentType || (type === 'POST' && 'application/x-www-form-urlencoded; charset=UTF-8') || ''};
    assign(headers, options.headers);
    if (!options.crossDomain && !headers["X-Requested-With"]) {
      headers["X-Requested-With"] = "XMLHttpRequest";
    }
    for (k in headers) {
      request.setRequestHeader(k, headers[k]);
    }

    var loadstart = options.loadstart,
      progress = options.progress,
      loadend = options.loadend,
      success = options.success,
      localeStart, localeEnd, localeProgress, localeProgressId, progressTimeout, progressCount = 0;
    success = isFunction(success) ? success : UNDEFINED;
    loadstart = isFunction(loadstart) ? loadstart : UNDEFINED;
    progress = isFunction(progress) ? progress : UNDEFINED;
    loadend = isFunction(loadend) ? loadend : UNDEFINED;

    var ret, sid, timeout = options.timeout, RET = ret = {
      abort: function () {
        if (on) {
          on({type: 'abort', isLocaleAbort: TRUE})
        }
      }
    }, on = function (e) {
      var type = e.type, _request = request, _dataType = dataType,
        _success = success, _error = error, _complete = complete, _localeEnd = localeEnd;

      if (sid) {
        clearTimeout(sid);
      }
      if (localeProgressId) {
        clearTimeout(localeProgressId)
      }
      if (ret) {
        ret.abort = noop;
      }
      ret = dataType = sid = localeProgress = progressCount = progressTimeout = localeProgressId = success = error = complete = loadstart = progress = localeEnd = request = on = UNDEFINED;
      if (_request) {
        _request.onload = _request.onerror = _request.onabort =
          _request.onloadstart = _request.onprogress =
            _request.ontimeout = _request.onreadystatechange = UNDEFINED;
        var status = _request.status, responseType = _request.responseType;
        if ((e.isLocaleAbort || e.isLocaleTimeout) && _request.abort) {
          _request.abort()
        }
        var script = 'script', load = 'load', result;
        type = type === load ? status >= 200 && status < 400 ? type : 'error' : type;
        if (_localeEnd) {
          _localeEnd(_request, type);
        }
        if (!_success && !_error && !_complete && _dataType !== script) {
          return;
        }
        if (type === load) {
          if (responseType === 'arraybuffer' || responseType === 'blob') {
            result = _request.response;
          } else if (_dataType === 'xml') {
            result = _request.responseXML;
          } else {
            result = _request.responseText;
            switch (_dataType) {
              case 'json':
                result = JSON.parse(result);
                break;
              case script:
                runScript({text: result},/*{nonce:''}*/);
            }
          }
          if (_success) {
            _success(result, type, _request)
          }
        } else if (_error) {
          _error(result, type, _request)
        }
        if (_complete) {
          _complete(result, type, _request)
        }
      }
    };

    if (loadstart) {
      if (request.onloadstart !== UNDEFINED) {
        request.onloadstart = loadstart
      } else {
        localeStart = function () {
          if (request && loadstart) {
            loadstart({currentTarget: request, target: request, type: 'loadstart', isLocaleLoadstart: TRUE})
          }
        }
      }
    }
    if (progress) {
      if (request.onprogress !== UNDEFINED) {
        request.onprogress = progress
      } else {
        progressTimeout = Math.min(Math.max((timeout | 0) / 100, 100), 100);
        localeProgress = function () {
          if (localeProgress && progress && request && ++progressCount < 99) {
            localeProgressId = setTimeout(localeProgress, progressTimeout);
            progress({currentTarget: request, progress: progressCount, target: request, type: 'progress', isLocaleProgress: TRUE})
          }
        }
      }
    }

    request.onload = request.onerror = on;
    if (request.onabort !== UNDEFINED) {
      request.onabort = on;
    } else {
      request.onreadystatechange = function () {
        if (on && request && request.readyState === 4) {
          setTimeout(function () {
            if (on) {
              on({type: 'abort'});
            }
          });
        }
      }
    }

    if (loadend) {
      if (request.onloadend !== UNDEFINED) {
        request.onloadend = function (event) {
          var _loadend = loadend;
          event.currentTarget.onloadend = UNDEFINED;
          _loadend(event)
        }
      } else {
        localeEnd = function (request, type) {
          setTimeout(function () {
            var _loadend = loadend, target = request, originalType = type;
            loadend = request = type = UNDEFINED;
            _loadend({type: 'loadend', currentTarget: target, target: target, originalType: originalType, isLocaleLoadend: TRUE})
          })
        }
      }
    }

    if (timeout > 0) {
      request.timeout = timeout;
      if (request.ontimeout !== UNDEFINED) {
        request.ontimeout = on
      } else if (isAsync) {
        sid = setTimeout(function () {
          if (sid) {
            sid = NULL;
            if (on) {
              on({type: 'timeout', isLocaleTimeout: TRUE})
            }
          }
        }, timeout)
      }
    }
    if (localeStart) {
      localeStart();
    }
    if (localeProgress) {
      localeProgressId = setTimeout(localeProgress, progressTimeout)
    }
    request.send(body);
    return RET
  }

  function ajaxGet(url, data, success, dataType) {
    return ajax(url, data, success, dataType, 'GET')
  }


  /**
   * @alias window.dom
   */
  assign($, {
    get: ajaxGet,
    post: function (url, data, success, dataType) {
      return ajax(url, data, success, dataType, 'POST')
    },
    getJSONP: function (url, data, success) {
      return ajaxGet(url, data, success, 'jsonp')
    },
    getJSON: function (url, data, success) {
      return ajaxGet(url, data, success, 'json', 'GET')
    },
    getScript: function (url, data, success) {
      return ajaxGet(url, data, success, 'script', 'GET')
    },
    loadImage: loadImage,
    tryDelete: tryDelete,
    runScript: runScript,
    ajax: ajax,
    replaceAjax: function (newAjax) {
      if (isFunction(newAjax)) {
        ajax = newAjax;
      }
    }
  });


  ////domReady
  var isDomReady;

  function domReady(callback) {
    if (isDomReady || (isDomReady = "complete|loaded".indexOf(doc.readyState) > -1 || (doc.readyState !== "loading" && !doc.documentElement.doScroll))) {
      setTimeout(callback);
    } else {
      var d = 'DOMContentLoaded', l = 'load';
      var c = function () {
        isDomReady = TRUE;
        if (d) {
          callback();
          removeEventListener(doc, d, c);
          removeEventListener(win, l, c);
        }
        c = d = l = callback = UNDEFINED;
      };
      addEventListener(doc, d, c);
      addEventListener(win, l, c);
    }
  }

  domReady(noop);
  /* $(win).on('error', function (e) {
     $console.error('DOMErrorListener:\t',e.error)
   });*/
  return $
})));
