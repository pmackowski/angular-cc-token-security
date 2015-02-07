# angular-cc-security

ccTokenSecurityProvider.login({
    state: 'login',
    url: '/login',
    templateUrl: 'views/login.html',
    nextState: 'main',
    originalPath: true
})


ccTokenSecurityProvider.logout('logout', '/logout');


ccTokenSecurityProvider.accessForbidden('accessForbidden', '/accessForbidden');

