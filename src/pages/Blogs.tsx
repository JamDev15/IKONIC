import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Calendar, User } from 'lucide-react';
import Navigation from '../components/Navigation';
import MatrixBackground from '../components/MatrixBackground';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

// Sample blog posts
const blogPosts = [
  {
    title: 'How to Automate Your Lead Follow-Up in 2025',
    excerpt: 'Discover the latest automation strategies that can help you respond to leads faster and convert more prospects into paying customers.',
    author: 'Ikonic Team',
    date: 'Jan 15, 2025',
    category: 'Automation',
    image: '/plan_workspace.jpg'
  },
  {
    title: 'The Complete Guide to Local SEO for Small Businesses',
    excerpt: 'Learn how to optimize your Google Business Profile and dominate local search results in your service area.',
    author: 'Ikonic Team',
    date: 'Jan 10, 2025',
    category: 'SEO',
    image: '/grow_top.jpg'
  },
  {
    title: 'Why Your Business Needs a Sales Funnel (Not Just a Website)',
    excerpt: 'Understand the difference between a static website and a high-converting sales funnel that turns visitors into customers.',
    author: 'Ikonic Team',
    date: 'Jan 5, 2025',
    category: 'Marketing',
    image: '/innovate_team.jpg'
  },
  {
    title: '5 CRM Workflows Every Service Business Should Have',
    excerpt: 'Streamline your operations with these essential CRM automations that save time and increase customer satisfaction.',
    author: 'Ikonic Team',
    date: 'Dec 28, 2024',
    category: 'CRM',
    image: '/collab_top.jpg'
  },
  {
    title: 'The Power of Vehicle Wraps: Mobile Marketing That Works',
    excerpt: 'Explore how commercial vinyl wraps can turn your fleet into 24/7 marketing assets that generate leads while you drive.',
    author: 'Ikonic Team',
    date: 'Dec 20, 2024',
    category: 'Branding',
    image: '/build_top.jpg'
  },
  {
    title: 'AI Chatbots vs. Human Support: Finding the Right Balance',
    excerpt: 'Learn how to implement AI-powered chat support without losing the personal touch your customers expect.',
    author: 'Ikonic Team',
    date: 'Dec 15, 2024',
    category: 'AI',
    image: '/engage_portrait.jpg'
  }
];

export default function Blogs() {
  const heroRef = useRef<HTMLDivElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
      );

      const posts = postsRef.current?.querySelectorAll('.blog-card');
      if (posts) {
        gsap.fromTo(posts,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: postsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative bg-charcoal min-h-screen">
      <MatrixBackground />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-[6vw] relative z-10">
        <div ref={heroRef} className="max-w-4xl mx-auto text-center">
          <p className="text-micro text-mint mb-4">INSIGHTS AND UPDATES</p>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-offwhite mb-6">
            Our <span className="text-mint">Blog</span>
          </h1>
          <p className="text-lg text-offwhite-dark max-w-2xl mx-auto mb-10">
            Get business growth tips, marketing strategies, and automation insights 
            straight from the Ikonic team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/#contact" className="btn-primary inline-flex items-center gap-2">
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/#services" className="btn-outline">
              View Services
            </a>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 px-[6vw] bg-charcoal-light/80 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto">
          <div ref={postsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article 
                key={index}
                className="blog-card group bg-charcoal border border-white/10 rounded-xl overflow-hidden hover:border-mint/30 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-mint text-charcoal text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h2 className="font-display text-lg font-bold text-offwhite mb-3 line-clamp-2 group-hover:text-mint transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-offwhite-dark text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-offwhite-dark">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-[6vw] relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold text-offwhite mb-4">
            Stay Connected
          </h2>
          <p className="text-offwhite-dark mb-8">
            Subscribe to our newsletter and get business growth tips and strategies 
            straight to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 bg-charcoal-light border border-white/20 rounded-lg text-offwhite focus:outline-none focus:border-mint transition-colors"
            />
            <button className="btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
