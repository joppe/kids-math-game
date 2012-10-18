/*global document*/

/**
 * Thanks to John Resig's article about micro-templating
 *
 * interplation = {{ var }}
 * control = {% ctrl %}
 */
var Template = (function (doc) {
    'use stict';
    
    var Template,
        cache = {};
    
    Template = function (template_id) {
        this.element = doc.querySelector('#' + template_id);
        
        if (this.element === null) {
            throw new Exception('Template with # "' + template_id + '" was not found in the DOM');
        }
        
        this.renderFunction = this.createRenderFunction();
    };
    Template.prototype = {
        createRenderFunction: function () {
            var template = this.element.innerHTML;
            
            template = template.replace(/[\r\t\n]/g, ' ');
            template = template.replace(/\{\{/g, '\',');
            template = template.replace(/\}\}/g, ',\'');
            template = template.replace(/\{%/g, '\');');
            template = template.replace(/%\}/g, 'lines.push(\'');
            template = '\'' + template + '\'';
            
            return new Function ('_context',
                'var lines = [], trace = function () {lines.push.apply(lines, arguments);};' +
                'lines.push(' + template + ');' +
                'return lines.join(\'\');'
            );
        },
        
        render: function (data) {
            return this.renderFunction(data);
        }
    };
    
    return {
        render: function (template_id, data) {
            var template;
            
            if (typeof cache[template_id] !== 'undefined') {
                template = cache[template_id];
            } else {
                template = new Template(template_id);
            }
            
            return template.render(data);
        }
    };
}(document));
