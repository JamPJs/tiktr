import React, { useState } from 'react';
import { ethers } from 'ethers';
import { createEvent, connectWallet } from '../blockchain';
import { uploadFileToIPFS } from "../blockchain";
import { useNavigate } from 'react-router-dom';

function ShowLister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    price: '',
    description: '',
    maxTickets: '',
  });
  const [imageFile, setImageFile] = useState(null); 
  const [uploadedImageUrl, setUploadedImageUrl] = useState(''); // URL returned from IPFS
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const signer = await connectWallet();
      const ticketPriceWei = ethers.parseEther(formData.price);

      // First, if an image file was selected, upload it to IPFS
      let imageUrl = uploadedImageUrl;
      if (imageFile && !uploadedImageUrl) {
        imageUrl = await uploadFileToIPFS(imageFile);
        setUploadedImageUrl(imageUrl);
      }
      
      const metadataURI = `https://ipfs.io/ipfs/bafkreie7otemlkqhhemy2ul7z2bcgrdm3v4l4n7ewmyul7rnpt3nchqljy?title=${encodeURIComponent(formData.title)}&desc=${encodeURIComponent(formData.description)}&date=${encodeURIComponent(formData.date)}&location=${encodeURIComponent(formData.location)}&image=${encodeURIComponent(imageUrl)}`;

      const eventId = await createEvent(signer, metadataURI, ticketPriceWei, formData.maxTickets);
      
      alert("Event listed successfully! Event ID: " + eventId);
      setFormData({
        title: '',
        date: '',
        location: '',
        price: '',
        description: '',
        maxTickets: '',
      });
      setImageFile(null);
      setUploadedImageUrl('');
      navigate('/findshows');
    } catch (error) {
      console.error("Error listing event:", error);
      alert("Error listing event. Check console for details.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-black via-black to-[#c2410c] p-8">
      <div className="max-w-4xl mx-auto bg-gray-700 rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">
          Host Your Event with Tiktr
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Title */}
          <div>
            <label htmlFor="title" className="block text-white font-medium mb-2">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2"
              required
            />
          </div>
          {/* Event Date */}
          <div>
            <label htmlFor="date" className="block text-white font-medium mb-2">
              Event Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2"
              required
            />
          </div>
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-white font-medium mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2"
              required
            />
          </div>
          {/* File Input for Image Upload */}
          <div>
            <label htmlFor="imageFile" className="block text-white font-medium mb-2">
              Event Image Upload
            </label>
            <input
              type="file"
              name="imageFile"
              id="imageFile"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2"
              required
            />
          </div>
          {/* Ticket Price in ETH */}
          <div>
            <label htmlFor="price" className="block text-white font-medium mb-2">
              Ticket Price (in ETH)
            </label>
            <input
              type="number"
              name="price"
              id="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2"
              step="any"
              required
            />
          </div>
          {/* Max Tickets */}
          <div>
            <label htmlFor="maxTickets" className="block text-white font-medium mb-2">
              Max Tickets
            </label>
            <input
              type="number"
              name="maxTickets"
              id="maxTickets"
              value={formData.maxTickets}
              onChange={handleChange}
              className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2"
              required
            />
          </div>
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-white font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full bg-gray-600 text-white border border-gray-500 rounded px-3 py-2"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-700 text-white font-bold py-2 px-6 rounded hover:bg-blue-800 transition-colors"
          >
            {loading ? "Listing Event..." : "List Event"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ShowLister;
