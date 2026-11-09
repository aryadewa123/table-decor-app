'use client'

import { useEffect, useId, useRef, useState } from 'react'

export interface FloralSelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface FloralSelectProps {
  value: string
  options: FloralSelectOption[]
  onChange: (value: string) => void
  ariaLabel?: string
  ariaLabelledBy?: string
  placeholder?: string
  className?: string
  disabled?: boolean
  required?: boolean
}

export default function FloralSelect({
  value,
  options,
  onChange,
  ariaLabel,
  ariaLabelledBy,
  placeholder,
  className = '',
  disabled = false,
  required = false,
}: FloralSelectProps) {
  const id = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedIndex = options.findIndex((option) => option.value === value)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(Math.max(0, selectedIndex))
  const selectedOption = options[selectedIndex]

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const moveActiveOption = (direction: 1 | -1) => {
    let nextIndex = activeIndex
    for (let count = 0; count < options.length; count += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length
      if (!options[nextIndex].disabled) {
        setActiveIndex(nextIndex)
        return
      }
    }
  }

  const selectActiveOption = () => {
    const option = options[activeIndex]
    if (!option || option.disabled) return
    onChange(option.value)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={`floral-select ${className}`}>
      <button
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-controls={`${id}-options`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-required={required || undefined}
        aria-activedescendant={isOpen ? `${id}-option-${activeIndex}` : undefined}
        disabled={disabled}
        onClick={() => {
          setActiveIndex(Math.max(0, selectedIndex))
          setIsOpen((open) => !open)
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const direction = event.key === 'ArrowDown' ? 1 : -1
            if (!isOpen) {
              setActiveIndex(Math.max(0, selectedIndex))
              setIsOpen(true)
            } else {
              moveActiveOption(direction)
            }
          } else if (isOpen && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            selectActiveOption()
          } else if (isOpen && event.key === 'Home') {
            event.preventDefault()
            const firstEnabled = options.findIndex((option) => !option.disabled)
            if (firstEnabled >= 0) setActiveIndex(firstEnabled)
          } else if (isOpen && event.key === 'End') {
            event.preventDefault()
            let lastEnabled = -1
            for (let index = options.length - 1; index >= 0; index -= 1) {
              if (!options[index].disabled) {
                lastEnabled = index
                break
              }
            }
            if (lastEnabled >= 0) setActiveIndex(lastEnabled)
          }
        }}
        className={`floral-select__trigger${isOpen ? ' is-open' : ''}`}
      >
        <span className={!selectedOption ? 'floral-select__placeholder' : ''}>
          {selectedOption?.label ?? placeholder ?? ''}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`floral-select__chevron${isOpen ? ' is-open' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div
          id={`${id}-options`}
          role="listbox"
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          className="floral-select__menu"
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={value === option.value}
              aria-disabled={option.disabled || undefined}
              onMouseEnter={() => !option.disabled && setActiveIndex(index)}
              onClick={() => {
                if (option.disabled) return
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`floral-select__option${activeIndex === index ? ' is-active' : ''}${
                value === option.value ? ' is-selected' : ''
              }${option.disabled ? ' is-disabled' : ''}`}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
