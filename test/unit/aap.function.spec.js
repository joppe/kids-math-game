describe('Function checking', function () {
    describe('getArgumentNames', function () {
        it('should get arguments of an anonymous function', function () {
            expect(Aap.Function.getArgumentNames(function (a, b, c, d) {})).toMatch(['a', 'b', 'c', 'd']);
        });

        it('should get arguments of an anonymous function, without spacing', function () {
            expect(Aap.Function.getArgumentNames(function(a, b, c, d) {})).toMatch(['a', 'b', 'c', 'd']);
        });

        it('should get arguments of an anonymous function, with argument spacing', function () {
            expect(Aap.Function.getArgumentNames(function(  a, b   ,  c  ,   d) {})).toMatch(['a', 'b', 'c', 'd']);
        });

        it('should get arguments of a named function', function () {
            expect(Aap.Function.getArgumentNames(function foobar (a, b, c, d) {})).toMatch(['a', 'b', 'c', 'd']);
        });

        it('should return an empty array on an argument less function', function () {
            expect(Aap.Function.getArgumentNames(function() {})).toMatch([]);
        });
    });
});
