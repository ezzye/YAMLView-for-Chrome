/**
 * Created by ellioe03 on 01/11/2017.
 */
/* global chrome */

/**
 * @author https://github.com/acvetkov
 * @overview events module
 */

export default class EventsModule {
    constructor() {
        this.observe();
    }

    observe() {
        chrome.tabs.onUpdated.addListener(tab => this.handleEvent(tab));
    }

    handleEvent(tab) {
        chrome.runtime.sendMessage(tab.url);
    }
}

