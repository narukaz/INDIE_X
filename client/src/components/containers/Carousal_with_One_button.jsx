function Carousal_with_One_button({
  carousal_background_image,
  carousal_title,
  carousal_description,
  buttonText,
  buttonfunction,
  carousal_logo,
}) {
  return (
    <div className=" w-full h-[85%]  ">
      {/* Background Image */}
      <img
        src={carousal_background_image}
        alt="Hero"
        className="inset-0 w-full h-[650px] object-cover "
      />

      {/* Gradient Overlay + Content */}
      <div className="absolute left-0 top-0 bg-gradient-to-r from-black to-transparent px-10  max-w-[40%]  h-[650px] flex flex-col justify-center items-start gap-2 overflow-hidden z-1">
        {carousal_logo && (
          <img
            src={carousal_logo}
            className="max-w-[15%] aspect-square mb-4 select-none"
            alt="Logo"
          />
        )}

        {carousal_title && (
          <h1 className="text-3xl font-bold text-white leading-tight">
            {carousal_title}
          </h1>
        )}

        {carousal_description && (
          <p className="text-xl font-light text-gray-300 leading-relaxed select-none">
            {carousal_description?.slice(0, 200) + "...."}
          </p>
        )}
        <div className="mt-2 flex gap-4 w-full">
          {buttonfunction && (
            <button
              onClick={buttonfunction}
              className="cursor-pointer hover:scale-105  w-auto
              mt-4 px-12 py-3 bg-white  text-black font-semibold text-xl bg-opacity-60 rounded-md hover:bg-opacity-80 transition"
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Carousal_with_One_button;
