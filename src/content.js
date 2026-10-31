import { MEDIA } from './media.js';

export const ERAS = [
  { key: '10', years: 10, label: '10 years later', short: '10 yrs' },
  { key: '100', years: 100, label: '100 years later', short: '100 yrs' },
  { key: '1000', years: 1000, label: '1,000 years later', short: '1,000 yrs' },
];

export const CHAPTERS = [
  {
    id: 'last-light',
    number: '01',
    title: 'The last light',
    era: '10',
    tagline: ['Cities fall silent,', 'but life listens.'],
    location: 'Bangkok, Thailand',
    coords: ['13.7563° N', '100.5018° E'],
    media: MEDIA.chapters.bangkok,
    offset: '0%',
    clip: 'polygon(1% 12%, 100% 0%, 99% 100%, 0% 94%)',
    narrative: {
      10: 'A decade without timetables. Monsoon rain finds every gap in the station roof and stays, settling into a shallow lake across the platforms. Ferns root in the expansion joints, swallows nest in the signal housings, and the last train becomes a trellis.',
      100: 'By the century mark the glass is gone and fig roots have split the platforms. The hall is an open courtyard of standing water and shade, loud with frogs at dusk. Only the iron ribs of the roof still trace where travellers once waited.',
      1000: 'Ten centuries on, the rail hall survives as a line of stone footings beneath a freshwater marsh. River sediment has buried the tracks; herons hunt where the departure boards hung.',
    },
  },
  {
    id: 'green-takeover',
    number: '02',
    title: 'The green takeover',
    era: '100',
    tagline: ['Nature builds', 'a new skyline.'],
    location: 'Singapore',
    coords: ['1.3521° N', '103.8198° E'],
    media: MEDIA.chapters.singapore,
    offset: '3.5%',
    clip: 'polygon(1% 5%, 100% 0%, 100% 90%, 0% 100%)',
    narrative: {
      10: 'Ten years in, rooftop gardens have gone feral and seed the streets below. Drains choke with leaves, and the first saplings rise from cracked expressways.',
      100: 'A century later the canopy has climbed the towers. Rooftop gardens became seed banks; birds and wind carried them floor by floor. Deer graze terraces forty storeys up, and the skyline is measured in trees rather than steel.',
      1000: 'After a thousand years, the towers have weathered into green hills of rubble and root. A rainforest closes over the island, its ridges following the ghost grid of old streets.',
    },
  },
  {
    id: 'different-planet',
    number: '03',
    title: 'A different planet',
    era: '1000',
    tagline: ['The coastline writes', 'a new map.'],
    location: 'Miami, USA',
    coords: ['25.7617° N', '80.1918° W'],
    media: MEDIA.chapters.miami,
    offset: '1.5%',
    clip: 'polygon(0.5% 14%, 100% 0%, 98.5% 100%, 0% 96%)',
    narrative: {
      10: 'A decade on, king tides reach further each year. Salt crusts the lower floors, and mangrove seedlings take hold along flooded boulevards.',
      100: 'By the hundredth year the barrier islands have slipped beneath the waves. Streets are tidal channels; reef fish shelter in parking garages.',
      1000: 'A thousand years on, the sea has rewritten the coast. Causeways run into open water, and the last towers stand as reefs, crowned with mangroves, schooling with fish, warm and clear and wholly unmapped.',
    },
  },
];
