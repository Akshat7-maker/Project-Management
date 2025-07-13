import React, { useState } from 'react';

const Accordion = ({ title, content }: { title: string; content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="border rounded mb-4">
      <button
        onClick={toggleAccordion}
        className="w-full text-left px-4 py-2 bg-gray-200 hover:bg-gray-300 font-semibold text-black"
      >
        {title}
      </button>
      {isOpen && (
        <div className="px-4 py-2 bg-white border-t text-black">
          {content}
        </div>
      )}
    </div>
  );
};

export default Accordion;


// "use client";
// import Accordion from "@/components/accordion";
// import { useState } from "react";

// export default function Home() {

//   let content  = [
//     {
//       id: "Accordion 1",
//       title: "Accordion 1",
//       content: "Content 1"
//     },
//     {
//       id: "Accordion 2",
//       title: "Accordion 2",
//       content: "Content 2"
//     },
//     {
//       id: "Accordion 3",
//       title: "Accordion 3",
//       content: "Content 3"
//     }
//   ]

//   let [active, setactive] = useState("");

//   const toggleAccordion = (itemId: string) => {
//     if (active === itemId) {
//       setactive("");
//     } else {
//       setactive(itemId);
//     }
//   };
//   return (
//     <main className="flex min-h-screen flex-col items-center  ">
//       {content.map((item, index) => (
//         <div key={index}>
//           <button
//             className="w-full text-left px-4 py-2 bg-gray-200 hover:bg-gray-300 font-semibold text-black"
//             onClick={() => toggleAccordion(item.id)}
//           >
//             {item.title}
//           </button>

//           {active === item.id && (
//             <div className="px-4 py-2 bg-white border-t text-black">
//               {item.content}
//             </div>
//           )}
//         </div>
        
//       ))}
//     </main>
//   );
// }