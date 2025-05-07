import Spinner from "../ui/spinner/Spinner";

export default function Loading(){
    return(
        <div className="h-screen w-screen flex flex-col gap-2 justify-center items-center bg-white dark:bg-gray-700 fixed z-999999 overflow-hidden ">
            <div className="text-black dark:text-white">
                NEXKOS
            </div>
            <div className="text-gray-600 font-light -mt-2">
                Memuat halaman
            </div>
            <div className="">
                <Spinner className="h-10 w-10 text-gray-400 fill-blue-500"/>
            </div>
        </div>
    )
}