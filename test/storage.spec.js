describe('ccTokenSecurity.storage module', function(){

    beforeEach(module('ccTokenSecurity.storage'));

    var user = {
        login: 'user1',
        email: 'user1@email.com',
        token: 'token1',
        roles: ['ROLE_USER']
    };

    describe('Session', function() {
        var mockSession;

        beforeEach(inject(function(Session) {
            mockSession = Session;
        }));

        afterEach(function() {
            mockSession.invalidate();
        });

        it('should authToken() return null', function(){
            expect(mockSession.authToken()).toBeNull();
        });

        it('should user() return null', function(){
            expect(mockSession.user()).toBeNull();
        });

        it('should return authToken() after creating new user', function(){
            // given
            mockSession.create(user);
            // when
            var actualToken = mockSession.authToken();
            // then
            expect(actualToken).toBe("token1");
        });

        it('should return user() after creating new user', function(){
            // given
            mockSession.create(user);
            // when
            var actualUser = mockSession.user();
            // then
            expect(actualUser).toEqual(user);
        });

        it('should invalidate user', function(){
            // given
            mockSession.create(user);
            // when
            mockSession.invalidate();
            // then
            expect(mockSession.user()).toBeNull();
            expect(mockSession.authToken()).toBeNull();
        });
    });

});
