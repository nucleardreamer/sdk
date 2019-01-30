import HuddlyDeviceAPIUSB from '@huddly/device-api-usb';
import HuddlyDeviceAPIUVC from '@huddly/device-api-uvc';
import HuddlySdk from '@huddly/sdk';

// Initialize the SDK
// Create instances of device-apis you want to use
const usbApi = new HuddlyDeviceAPIUSB();
const uvcApi = new HuddlyDeviceAPIUVC();

// Create an instance of the SDK
const sdk = new HuddlySdk(uvcApi, [usbApi, uvcApi]);

let cameraManager;
// Setup Attach/Detach Events
sdk.on('ATTACH', (d) => {
  cameraManager = d;
});

sdk.on('DETACH', () => {
  cameraManager = undefined;
});

init();

async function isConnected() {
  if (cameraManager) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    sdk.on('ATTACH', resolve);
  });
}

async function init() {
  await sdk.init();
}

async function getInfo() {
  if (cameraManager) {
    const info = await cameraManager.getInfo();
    return info;
  } else {
    return { "error": 'Camera manager not initialized' };
  }
}

async function reboot() {
  if (cameraManager) {
    await cameraManager.reboot();
    return { "message": 'Camera Rebooted!' };
  } else {
    return { "error": 'Camera manager not initialized' };
  }
}

async function setParam(name, value) {
  if (cameraManager) {
    await cameraManager.setUVCParam(name, value);
    return { "message": `New ${name} level ${value} set!` };
  } else {
    return { "error": 'Camera manager not initialized' };
  }
}


/*
GeniusFraming Start:  POST http://192.168.128.50:8080/geniusframing/start ,   Body: "" ,                                        Range: [1000, 4000]
GeniusFraming Stop:   POST http://192.168.128.50:8080/geniusframing/stop ,    Body: "" ,                                        Range: [1000, 4000]
Reboot:               POST http://192.168.128.50:8080/reboot ,                Body: "" ,                                        Range: [1000, 4000]
PanTilt:              POST http://192.168.128.50:8080/panTilt ,               Body: { "pan": 216000, "tilt": 162000 } ,         Range: Pan [216000, -216000], Tilt Pan [162000, -162000]
Zoom:                 POST http://192.168.128.50:8080/zoom ,                  Body: { "zoom": 1500 } ,                          Range: [1000, 4000]
Saturation:           POST http://192.168.128.50:8080/saturation ,            Body: { "saturation": 120 } ,                     Range: [1, 255]
Brightness:           POST http://192.168.128.50:8080/brightness ,            Body: { "brightness": 300 } ,                     Range: [-600, 600]
*/




let detector;
let detectorObj = {};
let frame = {};
async function setupDetectionListener() {
  detector.on('DETECTIONS', (d) => {
    detectorObj = d;
  });
}

function setupFramerListener() {
  detector.on('FRAMING', (f) => {
    frame = f;
  })
}

async function startAutozoom() {
  if (!detector) {
    detector = cameraManager.getDetector();
    await detector.init();
  }

  if (detector) {
    try {
      detector.start();
      // setupDetectionListener();
      // setupFramerListener();
      return { "status": "Autozoom started!" };
    } catch (e) {
      return { "error": e };
    }
  } else {
    return { "error": 'Detector not initialized!' };
  }
}

async function stopAutozoom() {
  if (detector) {
    detector.stop();
    detector = undefined;
    return { "status": "Autozoom stopped!" };
  } else {
    return { "error": 'Camera manager not initialized! Cannot stop detector!' };
  }
}

async function detect() {
  if (detector) {
    return {
      "detections": detectorObj,
      "framing": frame
    };
  } else {
    return { "error": 'Camera manager not initialized! Cannot get detectors!' };
  }
}

let upgradeState;
async function upgrade({ file }) {
  if (cameraManager) {
    try {
      const upgradePromise = cameraManager.upgrade({
        file,
      });
      upgradeState = 'in progress';
      await upgradePromise;
      upgradeState = 'complete';
      setTimeout(function () {
        upgradeState = null;
      }, 2000);
    } catch (e) {
      upgradeState = 'failed';
    }
  } else {
    return { "error": 'Camera manager not initialized' };
  }
}


function getUpgradeStatus() {
  return {
    state: upgradeState
  };
}

module.exports = {
  isConnected,
  getInfo,
  startAutozoom,
  stopAutozoom,
  detect,
  upgrade,
  getUpgradeStatus,
  reboot,
  setParam
};
