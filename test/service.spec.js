describe('security.service module', function(){

    beforeEach(module('security.service'));

    var user = {
        login: 'user1',
        email: 'user1@email.com',
        token: 'token1',
        roles: ['ROLE_USER']
    };

    describe('Auth', function() {
        var mockAuth;
        var mockSession;

        beforeEach(inject(function(Auth, Session) {
            mockAuth = Auth;
            mockSession = Session;
        }));

        it('should permitAll when access is not defined', function(){
            // given
            var state = {};
            // when
            var actual = mockAuth.permitAll(state.access);
            // then
            expect(actual).toBeTruthy();
        });

        it('should authenticate user', function(){
            // given
            spyOn(mockSession, 'user').andReturn(user);
            // when
            var actual = mockAuth.isAuthenticated();
            // then
            expect(actual).toEqual(true);
        });

        it('should authenticate user', function(){
            // given
            spyOn(mockSession, 'user').andReturn(null);
            // when
            var actual = mockAuth.isAuthenticated();
            // then
            expect(actual).toEqual(false);
        });

        it('should not authenticate user', function(){
            // given
            spyOn(mockSession, 'user').andReturn(user);
            // when
            var actual = mockAuth.isNotAuthenticated();
            // then
            expect(actual).toEqual(false);
        });

        it('should not authenticate user', function(){
            // given
            spyOn(mockSession, 'user').andReturn(null);
            // when
            var actual = mockAuth.isNotAuthenticated();
            // then
            expect(actual).toEqual(true);
        });

        it('should user has role ROLE_USER', function(){
            // given
            spyOn(mockSession, 'user').andReturn(user);
            // when
            var actual = mockAuth.hasRole('ROLE_USER');
            // then
            expect(actual).toBeTruthy();
        });

        it('should user has not role ROLE_ADMIN', function(){
            // given
            spyOn(mockSession, 'user').andReturn(user);
            // when
            var actual = mockAuth.hasRole('ROLE_ADMIN');
            // then
            expect(actual).toBeFalsy();
        });

    });
});
