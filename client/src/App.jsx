import Footer from "./components/Footer/Footer";
import Navigation from "./components/Header/Navigation";
import { Route, Routes } from "react-router-dom";
import Home_Screen from "./components/Home_Screen.jsx";
import Collect_games_nft from "./components/collect_games_nft/Collect_games_nft.jsx";
import COLLECT_SKIN_NFT from "./components/collect_skin_nft/COLLECT_SKIN_NFT.jsx";
import Rent_and_Lend from "./components/Rent_and_lend/Rent_and_Lend.jsx";
import NFT_explorer from "./components/Rent_and_lend/NFT_explorer.jsx";
import Game_screen from "./components/game_screen/Game_screen.jsx";
import Game_NFT_Collect_Explorer from "./components/collect_games_nft/Game_NFT_Collect_Explorer.jsx";
import NFT_SKIN_ORIGIN_SCREEN from "./components/NFT_Skin_screen/NFT_SKIN_ORIGIN_SCREEN.jsx";

import GameDashboard from "./components/Creator/Creator_page";

// home
//collect games -> popular card banner , below that an explorer, when click it will open a game page -> game page will have a explorer only for game related nft's
//collect nft's -> game banner , overlapped by nft, with nft image, BUY button , review button, below some carousal of NFT, clicked on banner it will take us to game page

function App() {
  return (
    <div className="w-full h-full flex flex-col gap-5 bg-black">
      <Navigation />
      <Routes>
        <Route index element={<Home_Screen />} />
        <Route path="/home" element={<Home_Screen />} />
        <Route
          path="/home/trending_game_nft"
          element={
            <div className="mt-25">
              <Game_NFT_Collect_Explorer />
            </div>
          }
        />
        <Route
          path="/home/explore_trending_game_nft"
          element={<Collect_games_nft />}
        />

        <Route path="/collect-game-nft" element={<Collect_games_nft />} />
        <Route
          path="/collect-game-nft/game/:contractAddress"
          element={<Game_screen />}
        />
        <Route path="/collect-skin-nft" element={<COLLECT_SKIN_NFT />} />
        <Route
          path="/collect-skin-nft/nft"
          element={<NFT_SKIN_ORIGIN_SCREEN />}
        />

        <Route path="/trade-nft" element={<NFT_explorer />} />
        {/* <Route path="/trade-nft/details" element={<Rent_and_Lend />} /> */}
        <Route
          path="/trade-nft/details/:contractAddress/:tokenId"
          element={<Rent_and_Lend />}
        />

        <Route path="/creator" element={<GameDashboard />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
