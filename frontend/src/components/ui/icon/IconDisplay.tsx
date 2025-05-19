import {
    BadgeIcon, CctvIcon, ChairIcon, CheckroomIcon, ClimateIcon,
    CookingIcon, CurtainIcon, DeskIcon, DishwasherIcon, DoorSlideIcon,
    DoubleBedIcon, ElectricityIcon, FanIcon, GuardianIcon, KeyIcon,
    KitchenIcon, LaundryIcon, ManIcon, MosqueIcon, ParkingIcon,
    PrayerIcon, ShowerIcon, SingleBedIcon, SmokeIcon, SmokingRoomIcon,
    TvIcon, WaterIcon, WaterHeaterIcon, WcIcon, WifiIcon, WomanIcon,
    BikeIcon, CarIcon
  } from "@/icons";
import { JSX } from "react";

  type IconItem = {
    render: JSX.Element;
    value: string;
  };

  interface IconDisplayProps{
    iconName: string,
    className?: string
  }
  
const IconDisplay: React.FC<IconDisplayProps> = ({
    iconName,
    className
}) => {
    const iconList: IconItem[] = [
        { render: <BadgeIcon />, value: "badge" },
        { render: <CctvIcon />, value: "cctv" },
        { render: <ChairIcon />, value: "chair" },
        { render: <CheckroomIcon />, value: "checkroom" },
        { render: <ClimateIcon />, value: "climate" },
        { render: <CookingIcon />, value: "cooking" },
        { render: <CurtainIcon />, value: "curtain" },
        { render: <DeskIcon />, value: "desk" },
        { render: <DishwasherIcon />, value: "dishwasher" },
        { render: <DoorSlideIcon />, value: "door-sliding" },
        { render: <DoubleBedIcon />, value: "double-bed" },
        { render: <ElectricityIcon />, value: "electricity" },
        { render: <FanIcon />, value: "fan" },
        { render: <GuardianIcon />, value: "guardian" },
        { render: <KeyIcon />, value: "key" },
        { render: <KitchenIcon />, value: "kitchen" },
        { render: <LaundryIcon />, value: "laundry" },
        { render: <ManIcon />, value: "man" },
        { render: <MosqueIcon />, value: "mosque" },
        { render: <ParkingIcon />, value: "parking" },
        { render: <PrayerIcon />, value: "prayer" },
        { render: <ShowerIcon />, value: "shower" },
        { render: <SingleBedIcon />, value: "single-bed" },
        { render: <SmokeIcon />, value: "smoke" },
        { render: <SmokingRoomIcon />, value: "smoking-room" },
        { render: <TvIcon />, value: "tv" },
        { render: <WaterIcon />, value: "water" },
        { render: <WaterHeaterIcon />, value: "water-heater" },
        { render: <WcIcon />, value: "wc" },
        { render: <WifiIcon />, value: "wifi" },
        { render: <WomanIcon />, value: "woman" },
        { render: <BikeIcon />, value: "bike" },
        { render: <CarIcon />, value: "car" },
      ];

    return(
        <div className={`${className}`}>
            { iconList.find((data)=>data.value === iconName)?.render }
        </div>
    )
}

export default IconDisplay