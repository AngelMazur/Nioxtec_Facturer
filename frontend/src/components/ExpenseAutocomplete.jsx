import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiGet } from '../lib/api'
import { useStore } from '../store/store'

const ExpenseAutocomplete = ({ 
  value, 
  onChange, 
  type = 'categories', // 'categories' or 'suppliers'
  placeholder = "Escribe o selecciona...", 
  className = "",
  disabled = false 
}) => {
  const { token } = useStore()
  const [options, setOptions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Determinar endpoint y campo basado en el tipo
  const endpoint = type === 'suppliers' ? '/expenses/suppliers' : '/expenses/categories'
  const fieldKey = type === 'suppliers' ? 'suppliers' : 'categories'

  // Cargar opciones del backend
  useEffect(() => {
    const loadOptions = async () => {
      if (!token) return
      try {
        const response = await apiGet(endpoint, token)
        const rawOptions = response[fieldKey] || []
        
        // Filtrar opciones válidas en el frontend también
        const validOptions = rawOptions.filter(option => {
          if (!option || typeof option !== 'string') return false
          const trimmed = option.trim()
          
          // Para categorías: mínimo 2 caracteres, debe contener al menos una letra
          if (type === 'categories') {
            return trimmed.length >= 2 && /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmed)
          }
          
          // Para proveedores: mínimo 2 caracteres
          return trimmed.length >= 2
        })
        
        setOptions(validOptions)
      } catch (error) {
        console.warn(`Error loading ${type}:`, error)
        setOptions([])
      }
    }
    loadOptions()
  }, [token, endpoint, fieldKey, type])

  // Mostrar todas las opciones disponibles
  useEffect(() => {
    setFilteredOptions(options)
    setHighlightedIndex(-1)
  }, [options])

  // Manejar clics fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputClick = () => {
    setIsOpen(!isOpen)
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        )
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          onChange(filteredOptions[highlightedIndex])
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
      case 'Tab':
        setIsOpen(false)
        break
      default:
        break
    }
  }

  const selectOption = (option) => {
    onChange(option)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const showDropdown = isOpen && filteredOptions.length > 0

  return (
    <div className="relative">
      <div
        ref={inputRef}
        onClick={handleInputClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        className={`w-full border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer flex items-center justify-between ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
          {value || placeholder}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {filteredOptions.map((option, index) => (
              <motion.div
                key={option}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => selectOption(option)}
                className={`
                  px-3 py-2 cursor-pointer transition-colors duration-150 text-sm
                  ${index === highlightedIndex 
                    ? 'bg-brand text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }
                  ${index === 0 ? 'rounded-t-md' : ''}
                  ${index === filteredOptions.length - 1 ? 'rounded-b-md' : ''}
                `}
              >
                {option}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExpenseAutocomplete