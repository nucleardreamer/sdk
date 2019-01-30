import { name, version } from '../package.json';
import Router from 'koa-router';
import fs from 'fs';

const camera = require('./controllers/camera');

const router = new Router();

/**
 * GET /
 */
router.get('/info', async (ctx) => {
  try {
    ctx.body = await camera.getInfo();
  } catch (e) {
    if (e instanceof camera.SDK.CameraNotFoundError) {
      ctx.throw(404, {
        error_message: e.message
      });
    } else {
      throw e;
    }
  }
});

router.put('/reboot', async (ctx) => {
  try {
    ctx.body = await camera.reboot()
  } catch (e) {
    if (e instanceof camera.SDK.CameraNotFoundError) {
      ctx.throw(404, {
        error_message: e.message
      });
    } else {
      throw e;
    }
  }
});

router.post('/panTilt', async (ctx) => {
  try {
    const panTilt = ctx.request.body
    if ((panTilt.pan >= -216000 && panTilt.pan <= 216000) &&
      (panTilt.tilt >= -162000 && panTilt.tilt <= 162000)) {
        await camera.setParam('pan', panTilt.pan);
        await camera.setParam('tilt', panTilt.tilt);
        ctx.body = {"message": "New Pan/Tilt Values have been set!"}
    } else {
      ctx.body = { "message": `Pan or Tilt Value is out of range! Pan [-216000, 216000], Tilt [-162000, 162000]` }
    }
  } catch (e) {
    if (e instanceof camera.SDK.CameraNotFoundError) {
      ctx.throw(404, {
        error_message: e.message
      });
    } else {
      throw e;
    }
  }
});

router.post('/zoom', async (ctx) => {
  try {
    const zoom = ctx.request.body.zoom
    if (zoom >= 1000 && zoom <= 4000) {
      ctx.body = await camera.setParam('zoom', ctx.request.body.zoom)
    } else {
      ctx.body = {"error": `Zoom level ${zoom} is out of range [1000, 4000]`}
    }
  } catch (e) {
    if (e instanceof camera.SDK.CameraNotFoundError) {
      ctx.throw(404, {
        error_message: e.message
      });
    } else {
      throw e;
    }
  }
});

router.post('/saturation', async (ctx) => {
  try {
    const saturation = ctx.request.body.saturation
    if (saturation >= 1 && saturation <= 255) {
      ctx.body = await camera.setParam('saturation', saturation)
    } else {
      ctx.body = { "error": `Saturation level ${saturation} is out of range [1, 255]` }
    }
  } catch (e) {
    if (e instanceof camera.SDK.CameraNotFoundError) {
      ctx.throw(404, {
        error_message: e.message
      });
    } else {
      throw e;
    }
  }
});

router.post('/brightness', async (ctx) => {
  try {
    const brightness = ctx.request.body.brightness
    if (brightness >= -600 && brightness <= 600) {
      ctx.body = await camera.setParam('brightness', brightness)
    } else {
      ctx.body = { "error": `Brightness level ${brightness} is out of range [-600, 600]` }
    }
  } catch (e) {
    if (e instanceof camera.SDK.CameraNotFoundError) {
      ctx.throw(404, {
        error_message: e.message
      });
    } else {
      throw e;
    }
  }
});

router.put('/startGF', async (ctx) => {
  try {
    ctx.body = await camera.startAutozoom();
  } catch (e) {
    if (e instanceof camera.SDK.CameraNotFoundError) {
      ctx.throw(404, {
        error_message: e.message
      });
    } else {
      throw e;
    }
  }
});


router.put('/stopGF', async (ctx) => {
  try {
    ctx.body = await camera.stopAutozoom();
  } catch (e) {
    if (e instanceof camera.SDK.CameraNotFoundError) {
      ctx.throw(404, {
        error_message: e.message
      });
    } else {
      throw e;
    }
  }
});

router.get('/detector/detections', async (ctx) => {
  try {
    ctx.body = await camera.detect();
  } catch (e) {
    if (e instanceof camera.SDK.CameraNotFoundError) {
      ctx.throw(404, {
        error_message: e.message
      });
    } else {
      throw e;
    }
  }
});

router.post('/upgrade', async (ctx) => {
  try {
    const { file } = ctx.request.files;
    if (!file) {
      throw new Error('No file uploaded');
    }
    const fileBuffer = fs.readFileSync(file.path);
    camera.upgrade({
      file: fileBuffer
    });
    ctx.body = {
      message: "Upgrading in progress",
      links: {
        "progress": {
          url: "upgrade/status"
        }
      }
    }
  } catch (e) {
    if (e instanceof camera.SDK.CameraNotFoundError) {
      ctx.throw(404, {
        error_message: e.message
      });
    } else if (e instanceof RangeError){
      ctx.throw(400, {
        error_message: e.message
      });
    } else {
      throw e;
    }
  }
});

router.get('/upgrade/status', async (ctx) => {
  try {
    ctx.body = camera.getUpgradeStatus();
  } catch (e) {
    if (e instanceof camera.SDK.CameraNotFoundError) {
      ctx.throw(404, {
        error_message: e.message
      });
    } else {
      throw e;
    }
  }
});

export default router;
