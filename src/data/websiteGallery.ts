export interface WebsiteMediaItem {
  id: string;
  category: 'website' | 'funnel';
  src: string;
  title: string;
  description: string;
  /** External live URL. When present, clicking the card routes here instead of opening the lightbox. */
  url?: string;
}

export const websiteGallery: WebsiteMediaItem[] = [
  {
    id: 'website-2',
    category: 'website',
    src: '/website-gallery/website/website-02.jpg',
    title: 'Moon River Construction',
    description: 'Concrete, landscaping, remodeling & full home renovations for Brighton, CO homeowners.',
    url: 'https://www.moonriverconstructionco.com/',
  },
  {
    id: 'website-3',
    category: 'website',
    src: '/website-gallery/website/website-03.png',
    title: 'Denco Rooter',
    description: 'Expert plumbing, drain & sewer line services for Denver-area homeowners.',
    url: 'https://dencorooterdrain.com/',
  },
  {
    id: 'funnel-1',
    category: 'funnel',
    src: '/website-gallery/funnel/funnel-01.jpg',
    title: 'Bugs Towing',
    description: '24/7 local towing lead-gen funnel for Colorado Springs with fast quote capture and click-to-call.',
    url: 'https://towcoloradosprings.com/',
  },
  {
    id: 'funnel-2',
    category: 'funnel',
    src: '/website-gallery/funnel/funnel-02.jpg',
    title: 'Quick Pick Towing & Recovery',
    description: 'Ikonic-built demo funnel for 24/7 emergency towing with rapid-response messaging and click-to-call CTAs.',
  },
  {
    id: 'funnel-3',
    category: 'funnel',
    src: '/website-gallery/funnel/funnel-03.png',
    title: 'Colorado Springs Tow Trucks',
    description: 'High-converting towing funnel with a fast-arrival promise and instant call CTA.',
    url: 'https://www.coloradospringstowtrucks.com/',
  },
];
