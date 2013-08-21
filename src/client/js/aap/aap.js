
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

Aap.Array = {
    forEach: function (array, iterator, context) {
        'use strict';

        var i;

        if (Aap.Type.isArray(array)) {
            for (i = 0; i < array.length; i += 1) {
                iterator.call(context, array[i], i, array);
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
            var prop;

            if (source) {
                for (prop in source) {
                    if (source.hasOwnProperty(prop)) {
                        destination[prop] = source[prop];
                    }
                }
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

    var attributes = {},
        model;

    model = Aap.Object.Class({
        __constructor: function (properties) {
            if (properties !== undefined) {
                this.set(properties, null, {
                    silent: true
                });
            }
        },

        get: function (attribute) {
            return attributes[attribute];
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
                oldValue = attributes[attribute];
                attributes[attribute] = value;

                if (value !== oldValue && options.silent === false) {
                    this.trigger('change', attribute, value);
                }
            }

            return this;
        },

        export: function () {
            return attributes;
        }
    });

    Aap.Object.extend(model.prototype, Aap.Event);

    return model;
}());

Aap.View = (function () {
    'use strict';

    var view,
        DATA_RE = /data\-([^=]+)/g;

    view = Aap.Object.Class({
        __constructor: function (scope, template) {
            this.scope = scope;
            this.template = template;
        },

        __destructor: function () {
            this.scope.off(null, null, this);
        },

        render: function () {
            var html = this.$element.html(),
                dataAttributes = [];

            html.replace(DATA_RE, function (match, dataAttribute) {
                dataAttributes.push(dataAttribute);
            });
            console.log(data);
        }
    });

    return view;
}());
Aap.View.bindings = (function () {
    'use strict';

    var bindings = {};

    return {
        get: function (identifier) {
            return bindings[identifier];
        },

        add: function (identifier, binding) {
            bindings[identifier] = binding;

            return this;
        }
    };
}());
Aap.View.bindings.add('text', function ($element, attribute, model) {
    'use strict';

    $element.text(model.get(attribute));

    model.on('change:' + attribute, function () {
        $element.text(model.get(attribute));
    });
});

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