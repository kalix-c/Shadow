import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const imagePaths = Object.freeze({
  avatar: path.join(projectRoot, "assets", "shadow", "shadow-avatar.png"),
  banner: path.join(projectRoot, "assets", "shadow", "shadow-banner.png"),
  sticker: path.join(projectRoot, "assets", "shadow-sticker.png"),
});

export default Object.freeze({
  imagePaths,
  shadow_main: imagePaths.avatar,
  atomic_gif: imagePaths.sticker,
  garden_members: [imagePaths.avatar, imagePaths.banner, imagePaths.sticker],
  quotes: [
    "أنا الشخص الذي يتبرعم في الظلال ليصطاد الظلال...",
    "أنا أتذوق طعم القوة في أن أكون Eminence in Shadow الحقيقي!",
    "I AM ATOMIC.",
    "البعوض قد يأتي بأسراب، لكن الأسد لا يسقط أبداً!",
    "منظمتنا لم تسقط أبداً في طريق الشر المطلق، ولا نسير في طريق البريء... نحن نسير في طريقنا الخاص.",
    "إذا تطلب الأمر حفر الأعماق حتى نهاية العالم... فسأفعل.",
    "هل اعتقدت حقاً أنه يمكنك الهرب مني؟",
  ],
});
