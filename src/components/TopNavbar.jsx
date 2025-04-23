import Link from "next/link";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { MdOutlineLogin } from "react-icons/md";

export default function TopNavbar() {
  return (
    <div className="border-b-[1px] border-gray-100 ">
      <div className="flex items-center gap-4 py-4 w-[90%] mx-auto ">
        <section>
          <img
            src="/assets/logo/application-logo.png"
            alt=""
            className="aspect-square w-[40px] rounded-full  border-2"
          />
        </section>
        <section className="bg-gray-100 flex rounded-full items-center gap-2 px-4 py-2 flex-1 focus-within:bg-white transition-all duration-300 ease-in-out focus-within:border-2 focus-within:border-gray-100">
          <input
            type="text"
            className="bg-transparent h-[24px] focus:outline-none flex-1"
            placeholder="Search..."
          />
          <FaMagnifyingGlass className="cursor-pointer" />
        </section>
        <section>
          <Link href={"/login"}>
            <button className="aspect-square w-[40px] rounded-md shadow flex items-center justify-center bg-hijau-tua">
              <MdOutlineLogin className="text-2xl text-white" />
            </button>
          </Link>
        </section>
      </div>
    </div>
  );
}