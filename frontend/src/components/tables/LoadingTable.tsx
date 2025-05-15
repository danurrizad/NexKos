import Spinner from "../ui/spinner/Spinner";

export default function LoadingTable(){
    return(
        <div className="w-full h-full flex justify-center items-center gap-2">
            <Spinner/>
            Memuat data
        </div>
    )
}