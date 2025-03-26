import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import EventCard from './EventCard';
import { connectWallet, getContractInstance, getAllEventIds } from '../blockchain';
import { ethers } from 'ethers';

function parseMetadata(metadataURI) {
  try {
    const url = new URL(metadataURI);
    return {
      title: url.searchParams.get("title") || "Untitled Event",
      desc: url.searchParams.get("desc") || "No Description",
      date: url.searchParams.get("date") || "N/A",
      location: url.searchParams.get("location") || "N/A",
      image: url.searchParams.get("image") || ""
    };
  } catch (error) {
    return {
      title: "Untitled Event",
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
  const eventsPerPage = 6;
  const [visibleCount, setVisibleCount] = useState(eventsPerPage);
  const loadMoreRef = useRef(null);

  // Fetch on-chain events on mount
  useEffect(() => {
    async function fetchEvents() {
      setLoadingEvents(true);
      try {
        const signer = await connectWallet();
        const contract = getContractInstance(signer);
        const ids = await getAllEventIds(signer);

        const eventsArr = await Promise.all(
          ids.map(async (id) => {
            const ev = await contract.events(id);
            return {
              id: id.toString(),
              creator: ev.creator,
              ticketPrice: ev.ticketPrice.toString(),
              metadataURI: ev.metadataURI,
              maxTickets: ev.maxTickets.toString(),
              ticketsSold: ev.ticketsSold.toString()
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

  // Filter events based on search query (searching metadataURI)
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black to-gray-800">
      {/* Main Content Container */}
      <div className="flex-grow pt-[100px]">

        {/* Search + Buttons */}
        <div className="flex items-center gap-4 px-8 mt-8 w-full justify-center">
          <button className="bg-[#103628] text-gray-400 bg-opacity-60 text-[16px]
                     hover:scale-105 hover:bg-gray-500 hover:text-black
                     focus:outline-1 outline-slate-300 px-4 py-2 rounded-3xl
                     transition-transform font-[Poppins]">
            Movies
          </button>
          <button className="bg-[#103628] text-gray-400 bg-opacity-60 text-[16px]
                     hover:scale-105 hover:bg-gray-500 hover:text-black
                     focus:outline-1 outline-slate-300 px-4 py-2 rounded-3xl
                     transition-transform font-[Poppins]">
            Concerts
          </button>
          <motion.div
            initial={{ width: 40 }}
            animate={{ width: isSearchOpen ? 300 : 40 }}
            transition={{ duration: 0.3 }}
            style={{ height: 40, transformOrigin: 'right center' }}
            className="flex items-center bg-[#103628] bg-opacity-60
                       rounded-full overflow-hidden"
          >
            {isSearchOpen && (
              <input
                type="text"
                placeholder="Search for events..."
                className="flex-1 px-4 py-2 text-gray-200 bg-transparent
                           focus:outline-none font-[Poppins]"
                value={query}
                onChange={searchqueryfunc}
              />
            )}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex items-center justify-center w-10 h-10 hover:scale-105
                         text-gray-400 hover:bg-gray-500 hover:text-black
                         focus:outline-1 outline-slate-300 transition-transform"
            >
              <Search size={20} color="currentColor" />
            </button>
          </motion.div>
        </div>

        {/* On-Chain Events Listing */}
        <div className="cards-container max-w-6xl mx-auto pb-8 mt-8 px-4">
          {loadingEvents ? (
            <p className="text-white text-center">Loading events...</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {currentEvents.map((event, index) => {
                // Parse metadata
                const urlObj = new URL(event.metadataURI);
                const title = urlObj.searchParams.get("title") || "Untitled Event";
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
              })}
            </div>
          )}
          <div ref={loadMoreRef} className="h-10"></div>
        </div>
      </div>
    </div>
  );
}

export default ShowFinder;
