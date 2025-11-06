// Centralized constants for the app
// Events can be imported and fed directly into the EventCard component
// EventCard expects: { title, image, slug, location, date, time }

export type EventItem = {
  title: string;
  image: string; // path under public/images (e.g., "/images/nextjs-conf.jpg")
  slug: string; // URL-friendly identifier
  location: string; // City, Country or "Online"
  date: string; // Human-friendly date (kept as string for display)
  time: string; // Local start time (kept as string for display)
};

export const events: EventItem[] = [
  {
    title: 'AWS re:Invent 2025',
    image: '/images/event1.png',
    slug: 'aws-reinvent-2025',
    location: 'Las Vegas, USA',
    date: 'Dec 1–5, 2025',
    time: '09:00',
  },
  {
    title: 'KubeCon + CloudNativeCon Europe 2026',
    image: '/images/event2.png',
    slug: 'kubecon-cloudnativecon-europe-2026',
    location: 'Vienna, Austria',
    date: 'Mar 31–Apr 3, 2026',
    time: '09:00',
  },
  {
    title: 'Google I/O 2026',
    image: '/images/event3.png',
    slug: 'google-io-2026',
    location: 'Mountain View, USA + Online',
    date: 'May 2026 (TBA)',
    time: '10:00',
  },
  {
    title: 'Microsoft Build 2026',
    image: '/images/event4.png',
    slug: 'microsoft-build-2026',
    location: 'Seattle, USA + Online',
    date: 'May 2026 (TBA)',
    time: '09:00',
  },
  {
    title: 'WWDC 2026',
    image: '/images/event5.png',
    slug: 'wwdc-2026',
    location: 'Cupertino, USA + Online',
    date: 'June 2026 (TBA)',
    time: '10:00',
  },
  {
    title: 'Next.js Conf 2026',
    image: '/images/event6.png',
    slug: 'nextjs-conf-2026',
    location: 'Online',
    date: 'Oct 2026 (TBA)',
    time: '09:00',
  },
  {
    title: 'React Summit 2026',
    image: '/images/event-full.png',
    slug: 'react-summit-2026',
    location: 'Amsterdam, Netherlands + Online',
    date: 'June 2026 (TBA)',
    time: '09:00',
  },
  {
    title: 'JSConf Budapest 2026',
    image: '/images/event1.png',
    slug: 'jsconf-budapest-2026',
    location: 'Budapest, Hungary',
    date: 'Sept 2026 (TBA)',
    time: '09:30',
  },
  {
    title: 'ETHGlobal Hackathon: San Francisco 2026',
    image: '/images/event2.png',
    slug: 'ethglobal-san-francisco-2026',
    location: 'San Francisco, USA',
    date: 'Apr 24–26, 2026',
    time: '08:00',
  },
  {
    title: 'NASA Space Apps Challenge 2026',
    image: '/images/event3.png',
    slug: 'nasa-space-apps-2026',
    location: 'Global + Online',
    date: 'Oct 2026 (Weekend, TBA)',
    time: '09:00',
  },
  {
    title: 'Open Source Summit North America 2026',
    image: '/images/event4.png',
    slug: 'open-source-summit-na-2026',
    location: 'Vancouver, Canada',
    date: 'June 2026 (TBA)',
    time: '09:00',
  },
  {
    title: 'FullStack Europe 2026',
    image: '/images/event5.png',
    slug: 'fullstack-europe-2026',
    location: 'Antwerp, Belgium',
    date: 'Oct 2026 (TBA)',
    time: '09:00',
  },
]
