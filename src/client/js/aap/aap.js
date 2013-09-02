
var Aap = {};

Aap.Type = {
    isArray: function (value) {
        'use strict';

        return Object.prototype.toString.call(value) === '[object Array]';
    },

    isObject: function (value) {
        'use strict';

        return Object.prototype.toString.call(value) === '[object Object]';
    },

    isNumber: function (value) {
        'use strict';

        return Object.prototype.toString.call(value) === '[object Number]';
    },

    isInt: function (value) {
        'use strict';

        return Aap.Type.isNumber(value) && value % 1 === 0;
    }
};

Aap.String = (function () {
    'use strict';

    var TRIM_RE = /^\s+|\s+$/g;

    return {
        trim: function (str) {
            return str.replace(TRIM_RE, '');
        }
    };
}());

Aap.Array = {
    reduce: function (array, iterator, memo, context) {
        'use strict';

        Aap.Array.forEach(array, function (value, index) {
            memo = iterator.call(context, memo, value, index, array);
        });

        return memo;
    },

    map: function (array, iterator, context) {
        'use strict';

        var ret = [];

        Aap.Array.forEach(array, function (value, index) {
            ret.push(iterator.call(context, value, index, array));
        });

        return ret;
    },

    forEach: function (array, iterator, context) {
        'use strict';

        var i,
            length,
            ret;

        if (Aap.Type.isArray(array)) {
            length = array.length;

            for (i = 0; i < length; i += 1) {
                ret = iterator.call(context, array[i], i, array);

                if (ret === false) {
                    return;
                }
            }
        }
    },

    indexOf: function (array, searchElement, fromIndex) {
        'use strict';

        var i,
            resultIndex = -1;

        if (Aap.Type.isArray(array)) {
            i = Aap.Type.isInt(fromIndex) ? fromIndex : 0;

            for (; i < array.length; i += 1) {
                if (array[i] === searchElement) {
                    resultIndex = i;
                    break;
                }
            }
        }

        return resultIndex;
    },

    createFromArguments: function (args) {
        'use strict';

        return Array.prototype.slice.call(args);
    }
};

Aap.Object = {
    Class: function (proto) {
        'use strict';

        var Class;

        Class = function () {
            if (this.__constructor) {
                this.__constructor.apply(this, Aap.Array.createFromArguments(arguments));
            }
        };

        Aap.Object.forEach(proto, function (value, property) {
            Class.prototype[property] = value;
        });

        return Class;
    },

    forEach: function (object, iterator, context) {
        'use strict';

        var name;

        for (name in object) {
            if (object.hasOwnProperty(name)) {
                iterator.call(context, object[name], name, object);
            }
        }
    },

    extend: function (destination) {
        'use strict';

        var sources = Aap.Array.createFromArguments(arguments);
        sources.shift();

        Aap.Array.forEach(sources, function (source) {
            if (source) {
                Aap.Object.forEach(source, function (value, key) {
                    destination[key] = value;
                });
            }
        });

        return destination;
    },

    keys: function (object) {
        'use strict';

        var keys = [];

        Aap.Object.forEach(object, function (value, key) {
            keys.push(key);
        });

        return keys;
    }
};

Aap.Function = (function () {
    'use strict';

    var ARGS_RE = /function\s*[\w\$]*\s*\(([^)]*)\)/ig;

    return {
        getArgumentNames: function (func) {
            var args = [];

            func.toString().replace(ARGS_RE, function (match, group) {
                Aap.Array.forEach(group.split(','), function (arg) {
                    args.push(Aap.String.trim(arg));
                });
            });

            return args;
        },

        proxy: function (func, context) {
            return function () {
                func.apply(context, arguments);
            };
        }
    };
}());

Aap.Event = (function () {
    'use strict';

    var EVENT_NAME_SEPERATOR = /\s+/;

    return {
        events: {},

        on: function (eventNames, callback, context) {
            Aap.Array.forEach(eventNames.split(EVENT_NAME_SEPERATOR), function (eventName) {
                if (this.events[eventName] === undefined) {
                    this.events[eventName] = [];
                }

                this.events[eventName].push({
                    callback: callback,
                    context: context
                });
            }, this);

            return this;
        },

        off: function (eventNames, callback, context) {
            eventNames = eventNames ? eventNames.split(EVENT_NAME_SEPERATOR) : Aap.Object.keys(this.events);

            Aap.Array.forEach(eventNames, function (eventName) {
                var retain = [];

                if (callback || context) {
                    Aap.Array.forEach(this.events[eventName], function (listener) {
                        if ((!callback || callback !== listener.callback) || (!context || context !== listener.context)) {
                            retain.push(listener);
                        }
                    });
                }

                if (retain.length > 0) {
                    this.events[eventName] = retain;
                } else {
                    delete this.events[eventName];
                }
            }, this);

            return this;
        },

        trigger: function (eventNames) {
            var args = Aap.Array.createFromArguments(arguments);

            args.shift();

            Aap.Array.forEach(eventNames.split(EVENT_NAME_SEPERATOR), function (eventName) {
                Aap.Array.forEach(this.events[eventName], function (listener) {
                    listener.callback.apply(listener.context, args);
                });
            }, this);

            return this;
        }
    };
}());

Aap.Model = (function () {
    'use strict';

    var Model;

    Model = Aap.Object.Class({
        __constructor: function (properties) {
            this.attributes = {};

            if (properties !== undefined) {
                this.set(properties, null, {
                    silent: true
                });
            }
        },

        get: function (attribute) {
            return this.attributes[attribute];
        },

        set: function (attribute, value, options) {
            var oldValue;

            options = Aap.Object.extend({
                silent: false
            }, options || {});

            if (Aap.Type.isObject(attribute)) {
                Aap.Object.forEach(attribute, function (value, name) {
                    this.set(name, value, options);
                }, this);
            } else {
                oldValue = this.attributes[attribute];
                this.attributes[attribute] = value;

                if (value !== oldValue && options.silent === false) {
                    this.trigger('change:' + attribute, value);
                }
            }

            return this;
        },

        export: function () {
            return this.attributes;
        }
    });

    Aap.Object.extend(Model.prototype, Aap.Event);

    return Model;
}());

Aap.Collection = (function () {
    'use strict';

    var Collection;

    Collection = Aap.Object.Class({
        __constructor: function (model, models) {
            this.model = model;
            this.models = models || [];
        }
    });

    Aap.Object.extend(Collection.prototype, Aap.Event);

    return Collection;
}());

Aap.View = (function ($) {
    'use strict';

    var view,
        createBindings,
        createFilters;

    createFilters = (function () {
        var ARGS_RE = /\s+/g;

        return function (array) {
            var filters = [];

            Aap.Array.forEach(array, function (data) {
                var args = Aap.Array.map(data.split(ARGS_RE), function (value) {
                        return Aap.String.trim(value);
                    }),
                    name = Aap.String.trim(args.shift());

                if (Aap.Filter.exists(name)) {
                    filters.push(Aap.Filter.get(name)(args));
                }
            });

            return filters;
        };
    }());

    createBindings = (function () {
        var DATA_RE = /data\-([^=]+)/g;

        return function ($element, model) {
            var bindings = [],
                html = $element.html();

            html.replace(DATA_RE, function (match, key) {
                if (Aap.Binding.exists(key)) {
                    $element.find('[' + match + ']').each(function () {
                        var $element = $(this),
                            data = Aap.Array.map($element.data(key).split('|'), function (value) {
                                return Aap.String.trim(value);
                            }),
                            attribute = data.shift();

                        bindings.push(Aap.Binding.get(key)($(this), attribute, model, createFilters(data)));
                    });
                }
            });

            return bindings;
        };
    }());

    view = Aap.Object.Class({
        __constructor: function ($element, scope) {
            this.$element = $element;
            this.scope = scope;
            this.bindings = [];
        },

        __destructor: function () {
            Aap.Array.forEach(this.bindings, function (binding) {
                binding.__destructor();
            });

            this.bindings = [];
        },

        render: function () {
            this.bindings = createBindings(this.$element, this.scope);

            return this;
        }
    });

    return view;
}(jQuery));

Aap.Binding = (function () {
    'use strict';

    var bindings = {};

    return {
        get: function (identifier) {
            return bindings[identifier];
        },

        exists: function (identifier) {
            return bindings[identifier] !== undefined;
        },

        add: function (identifier, binding) {
            bindings[identifier] = binding;

            return this;
        }
    };
}());
Aap.Binding.Base = (function () {
    'use strict';

    var Base = Aap.Object.Class({
        __constructor: function ($element, attribute, model, filters) {
            this.$element = $element;
            this.attribute = attribute;
            this.model = model;
            this.filters = filters || [];

            this.addEventListeners();
        },

        __destructor: function () {
            this.model.off(null, null, this);
        },

        getValue: function () {
            return Aap.Array.reduce(this.filters, function (memo, filter) {
                return filter(memo);
            }, this.model.get(this.attribute));
        }
    });

    return Base;
}());
Aap.Binding.add('text', (function () {
    'use strict';

    var Binding = Aap.Object.Class({
        addEventListeners: function () {
            this.model.on('change:' + this.attribute, this.update, this);
        },

        update: function () {
            this.$element.text(this.getValue());
        }
    });

    Aap.Object.extend(Binding.prototype, Aap.Binding.Base.prototype);

    return function ($element, attribute, model, filters) {
        return new Binding($element, attribute, model, filters);
    };
})());
Aap.Binding.add('value', (function () {
    'use strict';

    var Binding = Aap.Object.Class({
        addEventListeners: function () {
            this.$element.on('keyup', Aap.Function.proxy(this.onChange, this));
            this.model.on('change:' + this.attribute, this.update, this);
        },

        onChange: function () {
            this.model.set(this.attribute, this.$element.val());
        },

        update: function () {
            this.$element.val(this.getValue());
        }
    });

    Aap.Object.extend(Binding.prototype, Aap.Binding.Base.prototype);

    return function ($element, attribute, model, filters) {
        return new Binding($element, attribute, model, filters);
    };
})());

Aap.Filter = (function () {
    'use strict';

    var filters = {};

    return {
        get: function (identifier) {
            return filters[identifier];
        },

        exists: function (identifier) {
            return filters[identifier] !== undefined;
        },

        add: function (identifier, filter) {
            filters[identifier] = filter;

            return this;
        }
    };
}());
Aap.Filter.add('ucwords', (function () {
    'use strict';

    var RE = /(^|\s+)([a-z])/g;

    return function () {
        return function (value) {
            return value.replace(RE, function (match) {
                return match.toUpperCase();
            });
        };
    };
}()));

Aap.Router = (function ($) {
    'use strict';

    var Router,
        listen,
        routes = [];

    function getHash() {
        return window.location.hash.replace('#', '');
    }

    listen = (function () {
        var listening = false;

        return function () {
            var route;

            if (!listening) {
                $(window).on('hashchange', function () {
                    route = Router.find(getHash());

                    if (route !== null) {
                        route.callback();
                    }
                });

                listening = true;
            }
        };
    }());

    function createRegEx(url) {
        url = url.replace(/{\w+}/g, '[\\w\\-]+');
        url = url.replace(/(\.|\/)/g, function (match) {
            return '\\' + match;
        });

        return new RegExp(url, 'gi');
    }

    Router = {
        add: function (url, callback) {
            routes.push({
                url: url,
                callback: callback,
                re: createRegEx(url)
            });
            listen();
        },

        find: function (url) {
            var route = null;

            Aap.Array.forEach(routes, function (value) {
                if (value.re.test(url)) {
                    route = value;
                    return false;
                }
            });

            return route;
        }
    };

    Router = Aap.Object.extend(Router, Aap.Event);

    return Router;
}(jQuery));

Aap.Kernel = (function () {
    'use strict';

    var services = {};

    return {
        registerService: function (identifier, service) {
            if (services[identifier] !== undefined) {
                throw 'Serice with identifier "' + identifier + '" already defined';
            }

            services[identifier] = service;
//        },
//
//        getService: function (identifier) {
//
        }
    };
}());