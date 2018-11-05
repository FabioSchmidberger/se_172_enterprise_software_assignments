const chai = require('chai');
const spies = require('chai-spies');
const proxyquire = require('proxyquire');
const noop = () => {
};

chai.use(spies);

const oauthStub = {
    err: undefined,
    parameters: undefined,
    OAuth: function () {
        this.post = (
            url,
            twitter_user_access_token,
            twitter_user_secret,
            params,
            method,
            callback) => {
            oauthStub.parameters = {
                url,
                twitter_user_access_token,
                twitter_user_secret,
                params,
                method,
                callback
            };
            callback(oauthStub.err, {}, {});
        }
    }
};

const Variables = function () {
    this.get = () => '';
};

const camundaStub = {
    Client: function () {
        this.subscribe = (_, callback) => callback(
            {
                task: {
                    variables: new Variables()
                },
                taskService: {
                    complete: () => Promise.resolve()
                }
            })
    },
    Variables: Variables
};

const subscribe = proxyquire('../tweet', {
    'oauth': oauthStub,
    'camunda-external-task-client-js': camundaStub,
    'config': {get: () => ''}
});

describe('taskListener()', () => {
    it('should call urlGetter', () => {
        // 1. ARRANGE
        const taskName = 'test-task';
        const urlGetter = chai.spy();
        const paramGetter = noop;
        const onSuccess = noop;
        const onError = noop;

        // 2. ACT
        subscribe(taskName, urlGetter, paramGetter, onSuccess, onError);

        // 3. ASSERT
        chai.expect(urlGetter).to.have.been.called();
    });

    it('should use url', () => {
        // 1. ARRANGE
        const injectedUrl = 'injected-url';
        const taskName = 'test-task';
        const urlGetter = () => injectedUrl;
        const paramGetter = noop;
        const onSuccess = noop;
        const onError = noop;

        // 2. ACT
        subscribe(taskName, urlGetter, paramGetter, onSuccess, onError);

        // 3. ASSERT
        chai.expect(oauthStub.parameters.url).to.equal(injectedUrl);
    });

    it('should call paramGetter', () => {
        // 1. ARRANGE
        const taskName = 'test-task';
        const urlGetter = noop;
        const paramGetter = chai.spy();
        const onSuccess = noop;
        const onError = noop;

        // 2. ACT
        subscribe(taskName, urlGetter, paramGetter, onSuccess, onError);

        // 3. ASSERT
        chai.expect(paramGetter).to.have.been.called();
    });

    it('should use params', () => {
        // 1. ARRANGE
        const injectedParams = {dummy: 'injected-param'};
        const taskName = 'test-task';
        const urlGetter = noop;
        const paramGetter = () => injectedParams;
        const onSuccess = noop;
        const onError = noop;

        // 2. ACT
        subscribe(taskName, urlGetter, paramGetter, onSuccess, onError);

        // 3. ASSERT
        chai.expect(oauthStub.parameters.params).to.equal(injectedParams);
    });

    it('should call onSuccess', () => {
        // 1. ARRANGE
        const taskName = 'test-task';
        const urlGetter = noop;
        const paramGetter = noop;
        const onSuccess = chai.spy();
        const onError = noop;

        // 2. ACT
        subscribe(taskName, urlGetter, paramGetter, onSuccess, onError);

        // 3. ASSERT
        chai.expect(onSuccess).to.have.been.called();
    });
    
    it('should call onError', () => {
        // 1. ARRANGE
        oauthStub.err = "some error"
        const taskName = 'test-task';
        const urlGetter = noop;
        const paramGetter = noop;
        const onSuccess = noop;
        const onError = chai.spy();

        // 2. ACT
        subscribe(taskName, urlGetter, paramGetter, onSuccess, onError);

        // 3. ASSERT
        chai.expect(onError).to.have.been.called();
    });
});
