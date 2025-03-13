import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import EventCard from './EventCard';
import { Link } from 'react-router-dom';

function ShowFinder() {
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const eventsPerPage = 6; // Number of events to load at once
  const [visibleCount, setVisibleCount] = useState(eventsPerPage);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // When the search query changes, reset the visible count
  useEffect(() => {
    setVisibleCount(eventsPerPage);
  }, [query]);

  const searchqueryfunc = (e) => {
    setQuery(e.target.value);
    console.log(e.target.value);
  };

  const horizontalCards = [
    { id: 1, title: '', image: 'findshowscard1.jpg', link: '#' },
    { id: 2, title: '', image: 'findshowscard2.jpg', link: '#' },
    { id: 3, title: '', image: 'findshowscard3.jpg', link: '#' },
    { id: 4, title: '', image: 'findshowscard4.jpg', link: '#' },
    { id: 5, title: '', image: 'findshowscard5.jpg', link: '#' },
    { id: 6, title: '', image: 'findshowscard6.jpg', link: '#' },
  ];

  // Settings for the carousel
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: '0px',
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: false,
        },
      },
    ],
  };

  const events = [
    {
      title: 'Coldplay Concert',
      date: 'June 25, 2025',
      location: 'Mumbai, IND',
      image: 'coldplayconcert.jpg',
      price: '0.016',
      description: 'Experience an unforgettable night with Coldplay live in concert, featuring mesmerizing light shows and spectacular performances.'
    },
    {
      title: 'Captain America: Brave New World',
      date: 'July 5, 2025',
      location: 'Delhi, IND',
      image: 'captainamerica.jpg',
      price: '0.0021',
      description: 'Join Captain America for an action-packed event that celebrates heroism and adventure.'
    },
    {
      title: 'Interstellar',
      date: 'August 10, 2025',
      location: 'Pune, IND',
      image: 'findshowscard1.jpg',
      price: '0.0015',
      description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.'
    },
    {
      title: 'Comedy Night',
      date: 'September 15, 2025',
      location: 'Kolkata, IND',
      image: 'https://habs.uq.edu.au/files/2777/concert-crowd.jpg',
      price: '0.01',
      description: 'Laugh out loud with top comedians at a night filled with humor, fun, and surprises.'
    },
    {
      title: 'Indie Music Fest',
      date: 'October 20, 2025',
      location: 'Chennai, IND',
      image: 'https://habs.uq.edu.au/files/2777/concert-crowd.jpg',
      price: '0.01',
      description: 'Enjoy the eclectic sounds of indie music and discover new artists at the Indie Music Fest.'
    },
    {
      title: 'Jazz Night Extravaganza',
      date: 'November 15, 2025',
      location: 'New Orleans, USA',
      image: 'https://example.com/jazz-night.jpg',
      price: '0.02',
      description: 'Experience the soulful sounds of jazz in the heart of New Orleans. Enjoy smooth melodies and vibrant improvisations.'
    },
    {
      title: 'Rock and Roll Reunion',
      date: 'December 5, 2025',
      location: 'Los Angeles, USA',
      image: 'https://example.com/rock-reunion.jpg',
      price: '0.03',
      description: 'Join legendary rock bands for an electrifying night of live performances and timeless anthems.'
    },
    {
      title: 'Classical Symphony Evening',
      date: 'January 10, 2026',
      location: 'Vienna, AUT',
      image: 'https://example.com/symphony-evening.jpg',
      price: '0.015',
      description: 'Immerse yourself in an evening of timeless classical symphonies performed by world-renowned musicians in Vienna.'
    },
    {
      title: 'EDM Festival',
      date: 'February 20, 2026',
      location: 'Ibiza, ESP',
      image: 'https://example.com/edm-festival.jpg',
      price: '0.025',
      description: 'Dance the night away at Ibiza’s premier EDM festival featuring top DJs, mesmerizing light shows, and an electric atmosphere.'
    },
    {
      title: 'Art & Wine Evening',
      date: 'March 15, 2026',
      location: 'Paris, FRA',
      image: 'wine.jpg',
      price: '0.012',
      description: 'Enjoy an elegant evening of fine art and exquisite wines in Paris. Explore stunning art pieces while savoring a variety of wines.'
    },     
    // You can add more demo events here as needed.
  ];

  // Filter events based on the search query
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(query.toLowerCase())
  );

  // Slice the filtered events according to the visible count
  const currentEvents = filteredEvents.slice(0, visibleCount);

  // Use an IntersectionObserver to load more events when the sentinel comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredEvents.length) {
          setVisibleCount((prev) => prev + eventsPerPage);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMoreRef, filteredEvents, visibleCount, eventsPerPage]);

  return (
    <div className="bg-gradient-to-b from-black to-gray-800 pt-[100px]">
      <style>{`
        .slick-dots li button:before {
          font-size: 12px;
          color: #ffffff;
        }
        .slick-dots li.slick-active button:before {
          color: #ffa500;
        }
        .custom-card {
          width: 500px;
        }
      `}</style>

      <h1 className="text-orange-200 text-opacity-90 text-2xl font-bold drop-shadow-lg leading-snug text-center pb-8 pt-4">
        <span className="inline-flex items-center">
          <svg
            xmlns="public/trending-up-outline-svgrepo-com.svg"
            className="w-8 h-8 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 17l6-6 4 4 8-8" />
          </svg>
          TRENDING
        </span>
      </h1>

      {/* Carousel */}
      <div className="w-full px-8">
        <Slider {...settings}>
          {horizontalCards.map((card) => (
            <div key={card.id} className="px-2 custom-card">
              <a
                href={card.link}
                className="block rounded-lg shadow-lg overflow-hidden relative transition-all duration-300"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-[370px] object-cover"
                />
              </a>
            </div>
          ))}
        </Slider>
      </div>

      <div className="flex items-center gap-4 px-8 mt-8 w-full justify-center pt-[100px]">
        {/* Movies Button */}
        <button
          className="bg-[#103628] text-gray-400 bg-opacity-60 text-[16px]
                     hover:scale-105 hover:bg-gray-500 hover:text-black
                     focus:outline-1 outline-slate-300 px-4 py-2 
                     rounded-3xl transition-transform font-[Poppins]"
        >
          Movies
        </button>

        {/* Concerts Button */}
        <button
          className="bg-[#103628] text-gray-400 bg-opacity-60 text-[16px]
                     hover:scale-105 hover:bg-gray-500 hover:text-black
                     focus:outline-1 outline-slate-300 px-4 py-2
                     rounded-3xl transition-transform font-[Poppins]"
        >
          Concerts
        </button>

        {/* Search Icon + Expanding Bar */}
        <motion.div
          initial={{ width: 40 }}
          animate={{ width: isSearchOpen ? 300 : 40 }}
          transition={{ duration: 0.3 }}
          style={{ height: 40, transformOrigin: 'right center' }}
          className="flex items-center bg-[#103628] bg-opacity-60 rounded-full overflow-hidden"
        >
          {isSearchOpen && (
            <input
              type="text"
              placeholder="Search for events..."
              className="flex-1 px-4 py-2 text-gray-200 bg-transparent focus:outline-none font-[Poppins]"
              value={query}
              onChange={searchqueryfunc}
            />
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex items-center justify-center w-10 h-10 hover:scale-105 text-gray-400 hover:bg-gray-500 hover:text-black focus:outline-1 outline-slate-300 transition-transform"
          >
            <Search size={20} color="currentColor" />
          </button>
        </motion.div>
      </div>

      {/* Cards Container */}
      <div className="cards-container">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto pb-8 mt-8 px-4">
          {currentEvents.map((event, index) => (
            <Link key={index} to="/tickets" state={{ event }}>
              <EventCard
                title={event.title}
                image={event.image}
                date={event.date}
                location={event.location}
                price={event.price}
              />
            </Link>
          ))}
        </div>
        {/* Sentinel element for triggering infinite scroll */}
        <div ref={loadMoreRef} className="h-10"></div>
      </div>
    </div>
  );
}

export default ShowFinder;
