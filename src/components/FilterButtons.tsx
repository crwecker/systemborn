interface FilterButtonProps {
  options: readonly { value: any; label: string; color?: string }[]
  currentValue: any
  onChange: (value: any) => void
  className?: string
}

export const FilterButtons = ({ options, currentValue, onChange, className = '' }: FilterButtonProps) => (
  <div className={`flex flex-wrap gap-2 ${className}`}>
    {options.map(option => (
      <button
        key={option.value}
        onClick={() => onChange(option.value)}
        className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
          currentValue === option.value
            ? option.color ? `${option.color} text-white` : 'bg-copper text-dark-blue'
            : 'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'
        }`}>
        {option.label}
      </button>
    ))}
  </div>
) 