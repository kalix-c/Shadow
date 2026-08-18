import { ShadowResponseEngine } from "../shadow/ShadowResponseEngine.js";

/**
 * توافق مؤقت للاستدعاءات القديمة: لم يعد هذا الملف يبني CommandHandler.
 * يُفضّل إنشاء محرك واحد في نقطة التشغيل واستدعاء dispatch مباشرة.
 */
const listen = async ({ api, event, client = global.client }) => {
  const engine = new ShadowResponseEngine({ api, client });
  return engine.dispatch(event);
};

export { listen };
