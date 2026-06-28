import { WEEK_VIEW_FILTER_OPTIONS, type WeekViewFilterMode } from "@task-manager/shared";

type Props = {
  mode: WeekViewFilterMode;
  onChange: (mode: WeekViewFilterMode) => void;
};

export function WeekViewFilter({ mode, onChange }: Props) {
  return (
    <div className="week-screen-only flex flex-wrap gap-2 mb-4 print:hidden">
      {WEEK_VIEW_FILTER_OPTIONS.map((option) => {
        const active = mode === option.mode;
        return (
          <button
            key={option.mode}
            type="button"
            onClick={() => onChange(option.mode)}
            className={
              active
                ? "px-4 py-2 rounded-full text-label-md font-semibold bg-primary-container text-on-primary-container"
                : "px-4 py-2 rounded-full text-label-md font-semibold border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
