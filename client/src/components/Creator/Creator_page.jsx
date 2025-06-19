import React, { useState } from "react";
import { Vault } from "lucide-react";

export default function GameFormCard() {
  const [items, setItems] = useState([
    { heading: "", description: "", imageUrl: "" },
  ]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  const addNewItem = () => {
    setItems([...items, { heading: "", description: "", imageUrl: "" }]);
  };

  return (
    <div className="bg-gray-900 text-white w-full rounded-2xl p-6 flex flex-col gap-6 mt-25">
      {/* Top Section: Vault + Form */}
      <div className="flex gap-6 w-full ">
        <div className="flex-shrink-0 flex flex-col  items-center justify-center h-[200px] bg-gray-700 rounded-2xl">
          <Vault size={50} color="#a5a9b0" />
          <button className="flex">LOCK 1 USDT</button>
        </div>

        <div className="flex flex-col gap-3 ">
          <input
            type="text"
            placeholder="Game Name"
            className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none"
          />
          <select className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none">
            <option value="">Select Game Type</option>
            <option value="mmorpg">MMORPG</option>
            <option value="action">Action</option>
            <option value="adventure">Adventure</option>
            <option value="strategy">Strategy</option>
          </select>
        </div>
      </div>

      {/* Items Section */}
      <div className="flex flex-col gap-6">
        {items.map((item, index) => (
          <div key={index} className="p-4 bg-gray-800 rounded-lg">
            <input
              type="text"
              placeholder="Item Heading"
              value={item.heading}
              onChange={(e) =>
                handleItemChange(index, "heading", e.target.value)
              }
              className="w-full mb-2 px-3 py-2 rounded bg-gray-700 border border-gray-600"
            />
            <textarea
              placeholder="Item Description (optional)"
              value={item.description}
              onChange={(e) =>
                handleItemChange(index, "description", e.target.value)
              }
              className="w-full mb-2 px-3 py-2 rounded bg-gray-700 border border-gray-600"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={item.imageUrl}
              onChange={(e) =>
                handleItemChange(index, "imageUrl", e.target.value)
              }
              className="w-full px-3 py-2 rounded bg-gray-700 border border-gray-600"
            />

            {item.imageUrl && (
              <div className="mt-3">
                <img
                  src={item.imageUrl}
                  alt="Preview"
                  className="rounded-lg max-w-full max-h-[200px]"
                />
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addNewItem}
          className="self-start px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
        >
          + Add New Item
        </button>
      </div>
    </div>
  );
}
