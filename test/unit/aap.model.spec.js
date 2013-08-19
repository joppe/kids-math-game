describe('Model checking', function () {
    describe('__construct', function () {
        it('should handle a hash of properties', function () {
            var m = new Aap.Model({
                foo: 'bar',
                bar: 2
            });

            expect(m.export()).toEqual({foo: 'bar', bar: 2});
        });
    });

    describe('set', function () {
        it('should return it self', function () {
            var m = new Aap.Model();

            expect(m.set('foo', 'bar')).toEqual(m);
        });

        it('set the intern attributes object', function () {
            var m = new Aap.Model();
            m.set('foo', 'bar');

            expect(m.export()).toMatch({foo: 'bar'});
        });
    });

    describe('get', function () {
        it('must return the set value', function () {
            var m = new Aap.Model();
            
            m.set('foo', 'bar');

            expect(m.get('foo')).toEqual('bar');
        });
    });

    describe('events', function () {
        it('must fire a change event', function () {
            var m = new Aap.Model({
                    foo: '.',
                    bar: 2
                }),
                s;

            m.on('change', function (name, value) {
                s = 'set:' + name + '=' + value;
            });

            m.set('foo', 'bar');

            expect(s).toBe('set:foo=bar');
        });
    });
});