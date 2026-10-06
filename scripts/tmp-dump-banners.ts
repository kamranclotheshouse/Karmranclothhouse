import './env';
import { readHeroSlidesFresh, readPromoBannerFresh } from '../src/lib/db/banners';

async function main() {
  const slides = await readHeroSlidesFresh();
  console.log('=== HERO SLIDES ===');
  for (const s of slides) {
    console.log(JSON.stringify(s, null, 2));
  }
  const promo = await readPromoBannerFresh();
  console.log('=== PROMO ===');
  console.log(JSON.stringify(promo, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
