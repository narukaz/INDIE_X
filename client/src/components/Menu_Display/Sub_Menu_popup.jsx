import React from "react";

function Sub_Menu_popup({ sub_menu_items }) {
  return (
    <div className="w-3xs p-6 border-white border flex flex-col gap-3 absolute top-8 rounded-2xl mt-6">
      {sub_menu_items?.map((sub_menu, index) => (
        <div className="flex gap-2" key={index}>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold">{sub_menu?.name}</h2>
            <p>{sub_menu?.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Sub_Menu_popup;
