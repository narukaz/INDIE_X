import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * NFTGamesCard Component
 *
 * This component displays a single game card with its image, name, and other details.
 * It receives a single 'game' object as a prop, which contains all the necessary
 * information fetched from the smart contract and IPFS.
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.game - The game data object.
 * @param {string} props.game.imageUrl - The URL for the game's cover image.
 * @param {string} props.game.name - The name of the game.
 * @param {string} props.game.contractAddress - The game's unique smart contract address.
 * @param {Array<object>} [props.game.attributes] - Optional attributes, like genre or tags.
 */
function NFTGamesCard({ game }) {
  const navigate = useNavigate();

  // If the game data or its metadata hasn't loaded, we can render a placeholder or nothing.
  // This prevents errors if an incomplete game object is passed.
  if (!game || !game.isMetadataLoaded) {
    // You could return a loading skeleton card here if you want.
    return null;
  }

  // --- Dynamic Navigation ---
  // When a card is clicked, navigate to a unique URL for that specific game.
  const handleCardClick = () => {
    navigate(`/collect-game-nft/game/${game.contractAddress}`);
  };

  // --- Extract Game Genres/Types ---
  // We'll look inside the metadata's 'attributes' array for the game's genre.
  // This is a common pattern for NFT metadata.
  const gameGenres = game.attributes
    ?.filter((attr) => attr.trait_type === "Genre")
    .map((attr) => attr.value);

  return (
    <div
      onClick={handleCardClick}
      className="
        relative group transform transition-transform duration-300 ease-out
        hover:scale-105 hover:-translate-y-3
        bg-gradient-to-b from-[#647da0] to-[#253141]
        px-[2px] py-[2px]
        w-[250px] min-w-[250px] aspect-[7/9] rounded-2xl cursor-pointer
      "
    >
      <div className="bg-[#1F2937] w-full h-full rounded-2xl px-2 py-2 flex flex-col gap-4 items-center">
        {/* --- Game Image --- */}
        {/* We use the `game.imageUrl` from the props for the image source. */}
        <img
          className="object-cover rounded-xl overflow-hidden aspect-square group-hover:scale-105 transition-all"
          src={game.imageUrl}
          alt={`${game.name} Cover Art`} // Added alt text for accessibility
        />

        <div className="flex flex-col justify-center items-center group-hover:scale-110 transition-all text-center">
          {/* --- Game Name --- */}
          {/* The game's name is read from `game.name`. */}
          <h3 className="font-bold text-xl text-white select-none">
            {game.name}
          </h3>

          {/* --- Game Genres --- */}
          {/* We map over the genres we found in the metadata. */}
          {gameGenres && gameGenres.length > 0 && (
            <div className="flex gap-1 text-[#8485be]">
              {gameGenres.map((genre, index) => (
                <p
                  className="font-light text-[10px] hover:underline hover:text-[#cacaca]"
                  key={index}
                >
                  {genre}
                  {index < gameGenres.length - 1 ? "," : ""}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NFTGamesCard;
