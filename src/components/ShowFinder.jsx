import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';
import { connectWallet, getContractInstance, getAllEventIds } from '../blockchain';
import { ethers } from 'ethers';

/**
 * Parse various query parameters (title, desc, date, location, image) from metadataURI
 * Example: https://ipfs.io/ipfs/hash?title=Coldplay&desc=Big%20Show&date=2025-03-13&location=Mumbai&image=https://ipfs.io/ipfs/someImageHash
 */
function parseMetadata(metadataURI) {
  try {
    const url = new URL(metadataURI);
    return {
      title: url.searchParams.get("title") || "No Title",
      desc: url.searchParams.get("desc") || "No Description",
      date: url.searchParams.get("date") || "N/A",
      location: url.searchParams.get("location") || "N/A",
      image: url.searchParams.get("image") || ""
    };
  } catch (error) {
    // If metadataURI isn't a valid URL or something goes wrong, return defaults
    return {
      title: "No Title",
      desc: "No Description",
      date: "N/A",
      location: "N/A",
      image: ""
    };
  }
}

function ShowFinder() {
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [onChainEvents, setOnChainEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const eventsPerPage = 6; // Number of events to load at once
  const [visibleCount, setVisibleCount] = useState(eventsPerPage);
  const loadMoreRef = useRef(null);

  // Fetch on-chain events from the contract when the component mounts
  useEffect(() => {
    async function fetchEvents() {
      setLoadingEvents(true);
      try {
        const signer = await connectWallet();
        const contract = getContractInstance(signer);
        const ids = await getAllEventIds(signer);

        // For each event id, fetch its details from the public mapping
        const eventsArr = await Promise.all(
          ids.map(async (id) => {
            const ev = await contract.events(id);
            return {
              id: id.toString(),
              creator: ev.creator,
              ticketPrice: ev.ticketPrice.toString(),
              metadataURI: ev.metadataURI,
              maxTickets: ev.maxTickets.toString(),
              ticketsSold: ev.ticketsSold.toString(),
            };
          })
        );
        setOnChainEvents(eventsArr);
      } catch (error) {
        console.error("Error fetching on-chain events:", error);
      }
      setLoadingEvents(false);
    }
    fetchEvents();
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Reset visibleCount when query changes
  useEffect(() => {
    setVisibleCount(eventsPerPage);
  }, [query]);

  const searchqueryfunc = (e) => {
    setQuery(e.target.value);
    console.log(e.target.value);
  };

  // Hardcoded carousel data
  const horizontalCards = [
    { id: 1, title: '', image: 'findshowscard1.jpg', link: '#' },
    { id: 2, title: '', image: 'findshowscard2.jpg', link: '#' },
    { id: 3, title: '', image: 'findshowscard3.jpg', link: '#' },
    { id: 4, title: '', image: 'findshowscard4.jpg', link: '#' },
    { id: 5, title: '', image: 'findshowscard5.jpg', link: '#' },
    { id: 6, title: '', image: 'findshowscard6.jpg', link: '#' },
  ];

  // Filter onChainEvents by searching metadataURI
  // (In production, you might parse the 'title' from metadata and search that)
  const filteredEvents = onChainEvents.filter(event =>
    event.metadataURI.toLowerCase().includes(query.toLowerCase())
  );

  const currentEvents = filteredEvents.slice(0, visibleCount);

  // Infinite scroll to load more
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredEvents.length) {
          setVisibleCount(prev => prev + eventsPerPage);
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

  // Slick carousel settings
  const sliderSettings = {
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
      { breakpoint: 768, settings: { slidesToShow: 1, centerMode: false } }
    ],
  };

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
            xmlns="http://www.w3.org/2000/svg"
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
        <Slider {...sliderSettings}>
          {horizontalCards.map((card) => (
            <div key={card.id} className="px-2 custom-card">
              <a href={card.link} className="block rounded-lg shadow-lg overflow-hidden relative transition-all duration-300">
                <img src={card.image} alt={card.title} className="w-full h-[370px] object-cover" />
              </a>
            </div>
          ))}
        </Slider>
      </div>
      
      <div className="flex items-center gap-4 px-8 mt-8 w-full justify-center pt-[100px]">
        <button className="bg-[#103628] text-gray-400 bg-opacity-60 text-[16px] hover:scale-105 hover:bg-gray-500 hover:text-black focus:outline-1 outline-slate-300 px-4 py-2 rounded-3xl transition-transform font-[Poppins]">
          Movies
        </button>
        <button className="bg-[#103628] text-gray-400 bg-opacity-60 text-[16px] hover:scale-105 hover:bg-gray-500 hover:text-black focus:outline-1 outline-slate-300 px-4 py-2 rounded-3xl transition-transform font-[Poppins]">
          Concerts
        </button>
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

      <div className="cards-container">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto pb-8 mt-8 px-4">
          {loadingEvents ? (
            <p className="text-white text-center">Loading events...</p>
          ) : (
            currentEvents.map((event, index) => {
              // Parse out all metadata from the URI
              const urlObj = new URL(event.metadataURI);
              const title = urlObj.searchParams.get("title") || "Untitled Event";
              const desc = urlObj.searchParams.get("desc") || "No Description";
              const date = urlObj.searchParams.get("date") || "N/A";
              const location = urlObj.searchParams.get("location") || "N/A";
              const imageUrl = urlObj.searchParams.get("image") || "";

              return (
                <Link key={index} to="/tickets" state={{ event }}>
                  <EventCard
                    title={title}
                    image={imageUrl || "fallback.jpg"}
                    date={date}
                    location={location}
                    price={ethers.formatEther(event.ticketPrice)}
                  />
                </Link>
              );
            })
          )}
        </div>
        <div ref={loadMoreRef} className="h-10"></div>
      </div>
    </div>
  );
}

export default ShowFinder;
