import React from "react";

function News_card({ news_description, news_title }) {
  return (
    <div className="group relative min-w-1/2 max-w-[40%] h-[200px] p-1 border border-blue-300 overflow-hidden rounded-2xl cursor-pointer">
      {/* Image: use transform+transition for smooth zoom */}
      <img
        src="https://cdna.artstation.com/p/assets/images/images/089/047/752/large/y-zhou-snowscene-0.jpg?1749891090"
        className="
          w-full h-full object-cover rounded-2xl
          transform transition-transform duration-300 ease-out
          group-hover:scale-110
        "
        alt={news_title}
      />

      {/* Dark overlay on hover */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-r from-black to-transparent
          opacity-0 transition-opacity duration-300
          group-hover:opacity-70
        "
      />

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col justify-end px-5 py-12 w-[80%] text-white">
        <h1 className="font-bold text-2xl">{news_title}</h1>
        <p className="font-light">{news_description}</p>
      </div>
    </div>
  );
}

export default News_card;
