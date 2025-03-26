import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { connectWallet, getContractInstance, getAllEventIds } from "../blockchain";
import { Link } from "react-router-dom";
import EventCard from "./EventCard";

function MyEvents() {
  const [myCreatedEvents, setMyCreatedEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [myAddress, setMyAddress] = useState("");

  useEffect(() => {
    async function fetchMyEvents() {
      setLoading(true);
      try {
        const signer = await connectWallet();
        const address = (await signer.getAddress()).toLowerCase();
        setMyAddress(address);
        const contract = getContractInstance(signer);

        const ids = await getAllEventIds(signer);
        const allEvents = await Promise.all(
          ids.map(async (id) => {
            const ev = await contract.events(id);
            return {
              id: id.toString(),
              creator: ev.creator.toLowerCase(),
              ticketPrice: ev.ticketPrice.toString(),
              metadataURI: ev.metadataURI,
              maxTickets: ev.maxTickets.toString(),
              ticketsSold: ev.ticketsSold.toString(),
            };
          })
        );
        const createdEvents = allEvents.filter(ev => ev.creator === address);
        setMyCreatedEvents(createdEvents);

        const ticketCounter = await contract.ticketCounter();
        const ownedTickets = [];

        for (let tokenId = 0; tokenId < ticketCounter; tokenId++) {
          try {
            const owner = await contract.ownerOf(tokenId);
            if (owner.toLowerCase() === address) {
              const eventId = await contract.tokenEventId(tokenId); // Assuming contract has token -> eventId mapping
              ownedTickets.push({
                eventId: eventId.toString(),
                tokenId: tokenId.toString(),
              });
            }
          } catch (error) {
            continue; 
          }
        }

        setMyTickets(ownedTickets);
      } catch (error) {
        console.error("Error fetching my events:", error);
      }
      setLoading(false);
    }
    fetchMyEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-800 pt-20 p-8 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">My Events</h1>
      {loading ? (
        <p className="text-center">Loading your events...</p>
      ) : (
        <>
          {/* Created Events */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Events You Created</h2>
            {myCreatedEvents.length === 0 ? (
              <p>You haven't created any events yet.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {myCreatedEvents.map((event, index) => {
                  const urlObj = new URL(event.metadataURI);
                  const title = urlObj.searchParams.get("title") || "Untitled Event";
                  const date = urlObj.searchParams.get("date") || "N/A";
                  const location = urlObj.searchParams.get("location") || "N/A";
                  const image = urlObj.searchParams.get("image") || "fallback.jpg";
                  return (
                    <Link key={index} to="/tickets" state={{ event }}>
                      <EventCard
                        title={title}
                        image={image}
                        date={date}
                        location={location}
                        price={ethers.formatEther(event.ticketPrice)}
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Booked Tickets */}
          <section>
            <h2 className="text-3xl font-bold mb-4">Tickets You Booked</h2>
            {myTickets.length === 0 ? (
              <p>You haven't booked any tickets yet.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {myTickets.map((ticket, index) => (
                  <div key={index} className="p-4 border border-gray-500 rounded">
                    <p>Event ID: {ticket.eventId}</p>
                    <p>Ticket ID: {ticket.tokenId}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default MyEvents;
