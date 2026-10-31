import { photo, footage, MEDIA } from './media.js';

/** Hero captions follow whichever real media is on screen. */
const heroVideo = MEDIA.hero.video;
export const HERO = heroVideo
  ? {
      kind: 'Real footage',
      place: heroVideo.place || 'Pripyat, Ukraine',
      coords: heroVideo.coords || ['51.4026° N', '30.0558° E'],
      mark: heroVideo.mark || ['Empty', 'since', '1986'],
      credit: heroVideo.credit,
    }
  : {
      kind: 'Real photograph',
      place: 'Pripyat, Ukraine',
      coords: ['51.4026° N', '30.0558° E'],
      mark: ['Empty', 'since', '1986'],
      credit: MEDIA.hero.photo?.credit,
    };

export const ERAS = [
  { key: '10', years: 10, label: '10 years later', short: '10 yrs' },
  { key: '100', years: 100, label: '100 years later', short: '100 yrs' },
  { key: '1000', years: 1000, label: '1,000 years later', short: '1,000 yrs' },
];

/**
 * Each chapter pairs an imagined era with a real place where nature has already
 * begun the work. The photographs are real; the narratives are speculative.
 */
export const CHAPTERS = [
  {
    id: 'last-light',
    number: '01',
    title: 'The last light',
    era: '10',
    tagline: ['Cities fall silent,', 'but life listens.'],
    location: 'Tskaltubo, Georgia',
    coords: ['42.3220° N', '42.5921° E'],
    seen: 'Photograph: a former Soviet-era sanatorium in the spa town of Tskaltubo, Georgia, its courtyard grown into a grove.',
    image: photo('ch01-tskaltubo', 'Photograph of a colonnaded sanatorium in Tskaltubo, Georgia, with trees filling its courtyard.'),
    video: footage('ch01-loop', ''),
    offset: '0%',
    clip: 'polygon(1% 12%, 100% 0%, 99% 100%, 0% 94%)',
    focus: '50% 45%',
    narrative: {
      10: 'A decade without timetables. Rain finds every gap in the roof and stays. Seedlings root in the cracks of the terraces, swallows nest in the cornices, and the courtyard fountains become ponds. The buildings still look like ours — for now.',
      100: 'By the century mark the roofs have fallen in and the courtyards have closed into canopy. Roots split the stairs; owls hunt the long corridors. Only the colonnades still trace where people once walked.',
      1000: 'Ten centuries on, the walls are low mounds under the forest floor. A line of columns survives as stones in a clearing, and nobody is left to wonder what they held up.',
    },
  },
  {
    id: 'green-takeover',
    number: '02',
    title: 'The green takeover',
    era: '100',
    tagline: ['Nature builds', 'a new skyline.'],
    location: 'Houtouwan, China',
    coords: ['30.7263° N', '122.8270° E'],
    seen: 'Photograph: Houtouwan, a fishing village on Shengshan Island, China. Residents moved away from the 1990s onward; climbing plants have since wrapped the houses.',
    image: photo('ch02-houtouwan', 'Photograph of Houtouwan village on a misty hillside, its stone houses almost entirely covered in green vines.'),
    video: footage('ch02-loop', ''),
    offset: '3.5%',
    clip: 'polygon(1% 5%, 100% 0%, 100% 90%, 0% 100%)',
    focus: '50% 60%',
    narrative: {
      10: 'Ten years in, ivy reaches the windowsills and gardens go feral. Paths narrow to animal tracks, and the first saplings rise from the steps between houses.',
      100: 'A century later the hillside wears the village like a coat. Vines have climbed every wall and knitted roof to roof; birds nest in the chimneys, and the streets are tunnels of green. From the sea it looks less like a town than a forest with windows.',
      1000: 'After a thousand years the houses have slumped into terraces of soil and stone. Forest covers the slope to the waterline, and the harbour wall is a reef.',
    },
  },
  {
    id: 'different-planet',
    number: '03',
    title: 'A different planet',
    era: '1000',
    tagline: ['The forest writes', 'a new map.'],
    location: 'Tikal, Guatemala',
    coords: ['17.2214° N', '89.6220° W'],
    seen: 'Photograph: rainforest around Tikal, a Maya city abandoned more than a thousand years ago. Its temples still rise above the canopy.',
    image: photo('ch03-tikal', 'Photograph of unbroken rainforest canopy around Tikal, Guatemala, with the top of a stone temple rising above the trees under a cloudy sky.'),
    video: footage('ch03-loop', ''),
    offset: '1.5%',
    clip: 'polygon(0.5% 14%, 100% 0%, 98.5% 100%, 0% 96%)',
    focus: '50% 50%',
    narrative: {
      10: 'A decade after the last people leave, the plazas are already green. Roots lift the paving and the forest edge steps inward a little every season.',
      100: 'By the hundredth year the city is a forest with hills in it. Fig trees crown the pyramids, and the causeways are corridors of shade.',
      1000: 'A thousand years on, it takes a trained eye to see the city at all. Only the tallest temples break the canopy — grey peaks in a green sea, as close to a different planet as Earth gets.',
    },
  },
];
