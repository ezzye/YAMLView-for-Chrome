/**
 * Created by ellioe03 on 01/11/2017.
 */
/**
 * @author https://github.com/acvetkov
 * @overview Test events
 */

import chrome from 'sinon-chrome'; // from 'sinon-chrome'
import {assert} from 'chai';
import EventsModule from '../WebContent/events';

describe('events.js', function () {

    before(function () {
        global.chrome = chrome;
        this.events = new EventsModule();
    });

    beforeEach(function () {
        chrome.runtime.sendMessage.flush();
    });

    it('should subscribe on chrome.tabs.onUpdated', function () {
        assert.ok(chrome.tabs.onUpdated.addListener.calledOnce);
    });

    it('should send correct url on tabs updated event', function () {
        assert.ok(chrome.runtime.sendMessage.notCalled);
        chrome.tabs.onUpdated.dispatch({url: 'my-url'});
        assert.ok(chrome.runtime.sendMessage.calledOnce);
        assert.ok(chrome.runtime.sendMessage.withArgs('my-url').calledOnce);
    });

    after(function () {
        chrome.flush();
        delete global.chrome;
    });
});

