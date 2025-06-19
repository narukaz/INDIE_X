import React from "react";
import Carousal_with_One_button from "./containers/Carousal_with_One_button";
import Game_Show_case from "./Game_ShowCase/Game_Show_case";
import NFT_show_case from "./NFT_showcase/NFT_show_case";
import News_ShowCase from "./News_showcase/News_ShowCase";

function Home_Screen(url) {
  function Carousal_redirect_page() {
    return;
  }
  return (
    <>
      <Carousal_with_One_button
        carousal_background_image={
          "https://cdna.artstation.com/p/assets/images/images/088/803/420/large/sam-white-shotgun-pretty-3-1.jpg?1749209022"
        }
        carousal_description={`
    Gear up in a high-octane battlefield where every trigger pull counts.
    Customize your arsenal with epic gun skins that scream firepower.
    Dive into fast-paced action with explosive gunfights and strategy.
    Only the sharpest shooters survive—are you ready to dominate?
  `}
        carousal_logo={
          "https://cdn-icons-png.flaticon.com/512/5322/5322198.png "
        }
        buttonText={"PLAY NOW"}
        buttonfunction={Carousal_redirect_page}
      />
      <NFT_show_case />
      <Game_Show_case />
      <News_ShowCase />
    </>
  );
}

export default Home_Screen;
