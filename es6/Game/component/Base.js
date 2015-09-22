import Backbone from 'backbone';
import _ from 'underscore';

React.Backbone = {
    listenToProps(props) {
        _.each(this.updateOnProps, function(type, propName) {
            let events;

            switch(type) {
                case 'collection':
                    events = 'add remove reset sort';
                    break;
                case 'model':
                    events = 'change';
            }

            this.listenTo(props[propName], events, function() {
                this.forceUpdate();
            });
        }, this)
    }

    componentDidMount() {
        this.listenToProps(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.stopListening();
        this.listenToProps(nextProps);
    }

    componentWillUnmount: function() {
        this.stopListening();
    }
};

_.extend(React.Backbone, Backbone.Events);