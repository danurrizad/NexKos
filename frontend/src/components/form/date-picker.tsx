import { useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';
const MonthSelectPlugin = monthSelectPlugin as Partial<Plugin> as {
  new (config: {
    shorthand?: boolean;
    dateFormat?: string;
    theme?: string;
  }): Plugin;
};
import 'flatpickr/dist/plugins/monthSelect/style.css';
import Label from './Label';
import { CalenderIcon } from '../../icons';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;
import { Plugin } from 'flatpickr/dist/types/options';

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time" | "month";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  error?: boolean,
  dateFormat?: string,
  disabled?: boolean
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  error,
  dateFormat,
  disabled
}: PropsType) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (!inputRef.current) return;

    const isMonthMode = mode === 'month';
    const flatPickr = flatpickr(`#${id}`, {
      mode: isMonthMode ? "single" : mode || "single",
      // static: true,
      monthSelectorType: isMonthMode ? "static" : "dropdown",
      dateFormat: dateFormat || "Y-m-d",
      defaultDate,
      onChange,
      autoFillDefaultTime: false,
      // minDate: 'today',
      disableMobile: true,
      position: 'above right',
      ...(isMonthMode && {
        plugins: [new MonthSelectPlugin({
          shorthand: true,
          dateFormat: "Y-m",
        })]
      }),
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate]);

  const errorClass = " text-error-800 border-error-500 focus:ring-3 focus:ring-error-500/10  dark:text-error-400 dark:border-error-500"

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          ref={inputRef}
          disabled={disabled}
          className={`${error ? errorClass : "text-gray-800 pr-10 border-gray-300 focus:border-primary1-300 focus:ring-primary1/30"} disabled:cursor-not-allowed! disabled:bg-gray-100 h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent dark:border-gray-700  dark:focus:border-brand-800`}
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
