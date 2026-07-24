import { useMemo, useRef, useState } from 'react';
import { Play, ChevronLeft, ChevronRight, ImageOff, ExternalLink } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';
import PageSEO from '../components/PageSEO';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { wrapGallery, type WrapMediaItem } from '../data/wrapGallery';
import { websiteGallery, type WebsiteMediaItem } from '../data/websiteGallery';

type Tab = 'wraps' | 'websites';
type WrapFilter = 'all' | 'image' | 'video';
type WebsiteFilter = 'all' | 'website' | 'funnel';

const PAGE_SIZE = 24;

function WrapThumbnail({
  item,
  onClick,
  aspectClassName = 'aspect-square',
  alt,
}: {
  item: WrapMediaItem;
  onClick: () => void;
  aspectClassName?: string;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const playPreview = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  const stopPreview = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={item.type === 'video' ? playPreview : undefined}
      onMouseLeave={item.type === 'video' ? stopPreview : undefined}
      className={`group relative ${aspectClassName} rounded-xl transition-transform duration-300 ease-out hover:scale-125 hover:z-20 hover:shadow-2xl hover:shadow-black/60`}
    >
      <div className="absolute inset-0 rounded-xl overflow-hidden bg-charcoal-light border border-white/10 group-hover:border-mint/40 transition-colors">
        {item.type === 'image' ? (
          <img src={item.src} alt={alt} loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              src={item.src}
              preload="metadata"
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:opacity-0 transition-opacity pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-mint/90 flex items-center justify-center">
                <Play className="w-4 h-4 text-charcoal fill-charcoal ml-0.5" />
              </div>
            </div>
          </>
        )}
      </div>
    </button>
  );
}

function WebsiteThumbnail({ item, onPreview }: { item: WebsiteMediaItem; onPreview: () => void }) {
  const cardClassName =
    'group relative aspect-video rounded-xl transition-transform duration-300 ease-out hover:scale-125 hover:z-20 hover:shadow-2xl hover:shadow-black/60 text-left';

  const content = (
    <>
      <div className="absolute inset-0 rounded-xl overflow-hidden bg-charcoal-light border border-white/10 group-hover:border-mint/40 transition-colors">
        <img
          src={item.src}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal via-charcoal/85 to-transparent p-4 pt-8">
          <p className="text-offwhite font-semibold text-sm">{item.title}</p>
          <p className="text-offwhite-dark text-xs mt-1 line-clamp-2">{item.description}</p>
        </div>
      </div>
      {item.url && (
        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-charcoal/80 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-4 h-4 text-mint" />
        </div>
      )}
    </>
  );

  if (item.url) {
    return (
      <a href={item.url} target="_blank" rel="noopener noreferrer" className={cardClassName}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onPreview} className={cardClassName}>
      {content}
    </button>
  );
}

export default function Gallery() {
  const [tab, setTab] = useState<Tab>('wraps');
  const [wrapFilter, setWrapFilter] = useState<WrapFilter>('all');
  const [websiteFilter, setWebsiteFilter] = useState<WebsiteFilter>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [lightboxItems, setLightboxItems] = useState<WrapMediaItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredWraps = useMemo(() => {
    if (wrapFilter === 'all') return wrapGallery;
    return wrapGallery.filter((item) => item.type === wrapFilter);
  }, [wrapFilter]);

  const visibleWraps = filteredWraps.slice(0, visibleCount);

  const filteredWebsites = useMemo(() => {
    if (websiteFilter === 'all') return websiteGallery;
    return websiteGallery.filter((item) => item.category === websiteFilter);
  }, [websiteFilter]);

  // Only items without a live URL are previewable in the lightbox — items with a
  // URL route out to the real site instead (see WebsiteThumbnail).
  const previewableWebsites = useMemo(
    () => filteredWebsites.filter((item) => !item.url),
    [filteredWebsites]
  );

  const previewableWebsiteMedia: WrapMediaItem[] = useMemo(
    () => previewableWebsites.map((item) => ({ id: item.id, type: 'image', src: item.src })),
    [previewableWebsites]
  );

  const openLightbox = (items: WrapMediaItem[], index: number) => {
    setLightboxItems(items);
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const showPrev = () => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + lightboxItems.length) % lightboxItems.length));
  };

  const showNext = () => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % lightboxItems.length));
  };

  const activeItem = lightboxIndex !== null ? lightboxItems[lightboxIndex] : null;

  return (
    <div className="relative bg-charcoal min-h-screen">
      <PageSEO
        title="Vehicle Wrap Gallery | Ikonic Marketing"
        description="Browse Ikonic Marketing's client vehicle wrap gallery — real photos and videos of completed fleet, truck, and car wraps, plus our website marketing project showcase."
        canonical="/gallery"
      />
      <MatrixBackground />
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-12 px-[6vw] relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">OUR WORK</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6 leading-tight">
            Client Wraps &amp;<br />
            <span className="text-mint">Marketing Showcase</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto">
            Real vehicle wraps we've designed and installed for our clients — plus a look at
            the websites we've built to grow their businesses.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <section className="px-[6vw] relative z-10">
        <div className="max-w-6xl mx-auto flex justify-center gap-3 mb-10">
          <button
            onClick={() => setTab('wraps')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              tab === 'wraps'
                ? 'bg-mint text-charcoal border-mint'
                : 'border-white/10 text-offwhite-dark hover:border-mint/30 hover:text-mint'
            }`}
          >
            Vehicle Wraps
          </button>
          <button
            onClick={() => setTab('websites')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              tab === 'websites'
                ? 'bg-mint text-charcoal border-mint'
                : 'border-white/10 text-offwhite-dark hover:border-mint/30 hover:text-mint'
            }`}
          >
            Website Projects
          </button>
        </div>
      </section>

      {/* Vehicle Wraps */}
      {tab === 'wraps' && (
        <section className="px-[6vw] pb-24 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center gap-2 mb-8">
              {(['all', 'image', 'video'] as WrapFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setWrapFilter(f);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    wrapFilter === f
                      ? 'border-mint text-mint bg-mint/10'
                      : 'border-white/10 text-offwhite-dark hover:border-mint/30'
                  }`}
                >
                  {f === 'all' ? 'All' : f === 'image' ? 'Photos' : 'Videos'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleWraps.map((item, index) => (
                <WrapThumbnail
                  key={item.id}
                  item={item}
                  alt="Client vehicle wrap"
                  onClick={() => openLightbox(filteredWraps, index)}
                />
              ))}
            </div>

            {visibleWraps.length === 0 && (
              <div className="text-center py-20 text-offwhite-dark">
                <ImageOff className="w-10 h-10 mx-auto mb-4 opacity-40" />
                No {wrapFilter === 'video' ? 'videos' : 'photos'} to show.
              </div>
            )}

            {visibleCount < filteredWraps.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="btn-primary px-8 py-3"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Website Projects */}
      {tab === 'websites' && (
        <section className="px-[6vw] pb-24 relative z-10">
          <div className="max-w-6xl mx-auto">
            {websiteGallery.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-white/15 rounded-2xl">
                <p className="font-display text-xl text-offwhite mb-2">Coming Soon</p>
                <p className="text-offwhite-dark max-w-md mx-auto">
                  We're putting together our website marketing showcase. Check back soon to see
                  the sites we've built for clients.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-center gap-2 mb-8">
                  {(['all', 'website', 'funnel'] as WebsiteFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setWebsiteFilter(f)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        websiteFilter === f
                          ? 'border-mint text-mint bg-mint/10'
                          : 'border-white/10 text-offwhite-dark hover:border-mint/30'
                      }`}
                    >
                      {f === 'all' ? 'All' : f === 'website' ? 'Websites' : 'Funnels'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWebsites.map((item) => (
                    <WebsiteThumbnail
                      key={item.id}
                      item={item}
                      onPreview={() =>
                        openLightbox(
                          previewableWebsiteMedia,
                          previewableWebsites.findIndex((w) => w.id === item.id)
                        )
                      }
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-6">
            Want Your Vehicle Wrapped Like This?
          </h2>
          <p className="text-offwhite-dark mb-8">
            Let's design a wrap that turns your fleet into a lead-generating machine.
          </p>
          <a href="/contact" className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
            Get Started
          </a>
        </div>
      </section>

      <Footer />

      {/* Lightbox */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => !open && closeLightbox()}>
        <DialogContent
          showCloseButton
          className="bg-charcoal border-white/10 text-offwhite max-w-4xl w-full p-2 sm:p-4"
        >
          <DialogTitle className="sr-only">Gallery media preview</DialogTitle>
          {activeItem && (
            <div className="relative flex items-center justify-center">
              {activeItem.type === 'image' ? (
                <img
                  src={activeItem.src}
                  alt="Client vehicle wrap"
                  className="max-h-[80vh] w-auto mx-auto rounded-lg"
                />
              ) : (
                <video
                  src={activeItem.src}
                  controls
                  autoPlay
                  className="max-h-[80vh] w-auto mx-auto rounded-lg"
                />
              )}

              {lightboxItems.length > 1 && (
                <>
                  <button
                    onClick={showPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-charcoal/80 border border-white/10 flex items-center justify-center hover:border-mint/40 hover:text-mint"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={showNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-charcoal/80 border border-white/10 flex items-center justify-center hover:border-mint/40 hover:text-mint"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
