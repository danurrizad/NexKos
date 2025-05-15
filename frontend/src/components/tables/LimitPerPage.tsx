import React from "react"
import Select from "../form/Select";

type LimitPerPageProps = {
    limit: number;
    onChangeLimit: (limitPage: number) => void;
    options: number[]
}

const LimitPerPage: React.FC<LimitPerPageProps> = ({
    limit,
    onChangeLimit,
    options
}) => {
    const optionsLimit = options.map((opt)=>{
        return{
            label: opt.toString(),
            value: opt.toString(),
        }
    })
    return(
        <div className="w-[75px] py-0">
            <Select
                defaultValue={limit.toString()}
                options={optionsLimit}
                onChange={(e)=>onChangeLimit(Number(e))}
                showPlaceholder={false}
                className="py-0"
            />
        </div>
    )
}

export default LimitPerPage