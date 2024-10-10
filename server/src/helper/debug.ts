export default function debug(message:any) {
  try {
    if ((typeof process !== "undefined" && process.env && process.env.DEBUG && process.env.DEBUG.match(/true/)) ||
      (typeof window !== "undefined" && window.localStorage && window.localStorage.debug && window.localStorage.debug.match(/true/))) {
      console.log(message);
    }
  } catch (ex) {
    // Do nothing
  }
}
