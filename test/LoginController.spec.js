describe('LoginController', function(){

    describe('Login', function() {
        it('should permitAll when access is not defined', function(){
            // given
            var authenticationError = true;
            var tokenExpired = true && !authenticationError;
            // then
            expect(tokenExpired).toEqual(false);
        });

        it('should permitAll when access is not defined', function(){
            // given
            var authenticationError;
            var tokenExpired = true && !authenticationError;
            // then
            expect(tokenExpired).toEqual(true);
        });
    });

});
