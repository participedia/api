// Utility function to handle case when Google Analytics is down or slow.
// If the `event_callback` fn called in `sendWithCallback` hasn't been called within 1s, execute the callback.
// The following utility function accepts a function as input and returns a new function. If the returned function is called before the timeout period (the default timeout is one second), it clears the timeout and invokes the input function. If the returned function isn't called before the timeout period, the input function is called regardless.
function createFunctionWithTimeout(callback, opt_timeout) {
  var called = false;
  function fn() {
    console.log('%%%%%%%%%%%%%%%%%%%%%%%55 fn fn called ', called);
    if (!called) {
      called = true;
      callback();
    }
  }
  setTimeout(fn, opt_timeout || 1000);
  return fn;
}

const tracking = {
  send(eventCategory, eventAction, eventLabel = "") {
    if (!gtag) return;
    gtag("event", eventAction, {
      event_category: eventCategory,
      event_label: eventLabel,
      event_action: eventAction,
    });
  },

  sendWithCallback(eventCategory, eventAction, eventLabel = "", callback) {
    if (!gtag) {
      callback();
      return;
    }
    gtag("event", eventAction, {
      event_category: eventCategory,
      event_label: eventLabel,
      event_action: eventAction,
      event_callback: createFunctionWithTimeout(callback),
    });
  },
};

export default tracking;
