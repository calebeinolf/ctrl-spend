import { useRef, useEffect } from "react";

const AnimatedAmountDisplay = ({
  displayAmount,
  fullEquation,
  step,
  className = "",
}) => {
  const amountDisplayRef = useRef(null);

  // Auto-scroll to the right when displayAmount changes
  useEffect(() => {
    if (amountDisplayRef.current) {
      amountDisplayRef.current.scrollLeft =
        amountDisplayRef.current.scrollWidth;
    }
  }, [displayAmount]);

  return (
    <div className={`${className}`}>
      {fullEquation && (
        <div 
          className={`
            text-xl font-medium text-gray-400 mb-2 overflow-x-auto whitespace-nowrap scrollbar-hide
            transition-all duration-500 ease-in-out
            ${step === 2 ? "opacity-50 text-base" : ""}
          `}
        >
          {fullEquation}
        </div>
      )}
      <div 
        className={`
          flex w-full items-center relative
          transition-all duration-500 ease-in-out
          ${step === 1 ? "text-8xl" : "text-5xl"}
        `}
      >
        <div className="text-gray-400 flex-shrink-0">
          <span>$</span>
        </div>
        <div
          ref={amountDisplayRef}
          className="flex-1 overflow-x-auto scrollbar-hide overflow-hidden"
        >
          <div className="text-gray-800 text-right whitespace-nowrap min-w-full">
            {displayAmount}
          </div>
        </div>
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10 ml-[1ch]"></div>
      </div>
    </div>
  );
};

export default AnimatedAmountDisplay;
