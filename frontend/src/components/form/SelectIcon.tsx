import React, { JSX } from "react";
import {
  BadgeIcon, CctvIcon, ChairIcon, CheckroomIcon, ClimateIcon,
  CookingIcon, CurtainIcon, DeskIcon, DishwasherIcon, DoorSlideIcon,
  DoubleBedIcon, ElectricityIcon, FanIcon, GuardianIcon, KeyIcon,
  KitchenIcon, LaundryIcon, ManIcon, MosqueIcon, ParkingIcon,
  PrayerIcon, ShowerIcon, SingleBedIcon, SmokeIcon, SmokingRoomIcon,
  TvIcon, WaterIcon, WaterHeaterIcon, WcIcon, WifiIcon, WomanIcon,
  BikeIcon, CarIcon
} from "@/icons";

type IconItem = {
  render: JSX.Element;
  value: string;
};

type SelectIconProps = {
  onSelection: (icon: string) => void;
  className?: string;
  defaultValue: string;
  id: string;
  name: string;
  disabled?: boolean;
};

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
  { render: <WifiIcon />, value: "wifi" },
  { render: <WcIcon />, value: "wc" },
  { render: <ManIcon />, value: "man" },
  { render: <WomanIcon />, value: "woman" },
  { render: <BikeIcon />, value: "bike" },
  { render: <CarIcon />, value: "car" },
];

const SelectIcon: React.FC<SelectIconProps> = ({
  onSelection,
  className = "",
  defaultValue,
  id,
  name,
  disabled = false,
}) => {
  return (
    <div
      id={id}
      className={`flex flex-wrap gap-4 justify-between ${className}`}
    >
      {iconList
        .map(({ render, value }) => {
          const isSelected = value === defaultValue;
          return (
            <button
              key={value}
              name={name}
              onClick={() => !disabled && onSelection(value)}
              disabled={disabled}
              className={`rounded-xl border-2 h-12 w-12 flex items-center justify-center transition-all
                ${
                  isSelected
                    ? "border-primary1 bg-primary1-50"
                    : "border-gray-300 hover:border-primary1-300"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
              `}
              type="button"
            >
              {render}
            </button>
          );
        })}
        <div className="flex-grow-1"></div>
    </div>
  );
};

export default SelectIcon;
