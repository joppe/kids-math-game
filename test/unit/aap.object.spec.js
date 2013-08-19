describe('Object checking', function () {
    describe('extend', function () {
        it('one object properties to another', function () {
            var t = {},
                s = {
                    foo: 'bar'
                };

            expect(Aap.Object.extend(t, s)).toEqual({foo: 'bar'});
        });

        it('to override properties', function () {
            var t = {
                   foo: 2
                },
                s = {
                    foo: 'bar'
                };

            expect(Aap.Object.extend(t, s)).toEqual({foo: 'bar'});
        });
    });

    describe('keys', function () {
        it('should return all the keys of a given object', function () {
            var o = {
                    foo: 'foo',
                    bar: 'foo',
                    foobar: 'foo'
                };

            expect(Aap.Object.keys(o)).toEqual(['foo', 'bar', 'foobar']);
        });
    });
});
