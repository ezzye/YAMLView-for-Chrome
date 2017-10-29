// Back end observer.

/*
 * 1. Init listens for notifications from content and web worker scripts
 * Three types of notification:
 *  init - broadcast options;
 *  jsonToHTML - create new web worker and then broadcast yaml to parse into html
 * Then refresh menu
 */