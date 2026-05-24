export function getDeviceInfo() {

  return {

    userAgent:
      navigator.userAgent,

    language:
      navigator.language,

    memory:
      navigator.deviceMemory || 0,

    online:
      navigator.onLine,

  };

}