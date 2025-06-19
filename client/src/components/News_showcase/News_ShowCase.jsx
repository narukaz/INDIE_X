import { ChevronRight, Newspaper } from "lucide-react";
import React from "react";
import News_card from "../News_card/News_card";

function News_ShowCase() {
  return (
    <div className="h-[500px]  flex flex-col gap-9 px-6 py-8 relative  ">
      {/* title */}
      <h1 className="pl-12 hover:pl-20 pr-5 bg-white  w-max py-3 rounded-3xl  text-2xl  text-black font-bold flex items-center gap-3 hover:text-blue-400 cursor-pointer select-none group transition-all">
        <Newspaper
          size={30}
          className=" text-black transition-all ease-out group-hover:text-blue-500"
        />{" "}
        Game articles
        <span>
          <ChevronRight size={20} className="group-hover:ml-7 transition-all" />
        </span>
      </h1>
      <div className="flex gap-4 w-full overflow-x-auto">
        <News_card
          news_title={"new game release"}
          news_description={
            "this is a testing paragraph to test out some stuff"
          }
        />
        <News_card
          news_title={"new game release"}
          news_description={
            "this is a testing paragraph to test out some stuff"
          }
        />
        <News_card
          news_title={"new game release"}
          news_description={
            "this is a testing paragraph to test out some stuff"
          }
        />
        <News_card
          news_title={"new game release"}
          news_description={
            "this is a testing paragraph to test out some stuff"
          }
        />
      </div>
    </div>
  );
}

export default News_ShowCase;
