import React from "react";
import Carousal_with_One_button from "./containers/Carousal_with_One_button";
import Game_Show_case from "./Game_ShowCase/Game_Show_case";
import NFT_show_case from "./NFT_showcase/NFT_show_case";
import News_ShowCase from "./News_showcase/News_ShowCase";
import LootBoxCarousel from "./Lootbox_carousal";

function Home_Screen(url) {
  // function Carousal_redirect_page() {
  //   return;
  // }
  return (
    <>
      <LootBoxCarousel />
      <NFT_show_case />
      <Game_Show_case />
      <News_ShowCase />
    </>
  );
}

export default Home_Screen;
