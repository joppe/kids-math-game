describe('String checking', function () {
    describe('trim', function () {
        it('should remove whitespace at the left', function () {
            expect(Aap.String.trim('  foo')).toBe('foo');
        });

        it('should remove whitespace at the right', function () {
            expect(Aap.String.trim('foo  ')).toBe('foo');
        });

        it('should remove whitespace at both sides', function () {
            expect(Aap.String.trim('  foo  ')).toBe('foo');
        });
    });
});
