import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })
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

  // Filtrar opciones según lo que el usuario escribe (búsqueda flexible)
  useEffect(() => {
    if (!value || value.trim() === '') {
      // Si está vacío, mostrar todas las opciones
      setFilteredOptions(options)
    } else {
      // Si hay texto, filtrar las que contengan el texto (case-insensitive)
      const searchText = value.toLowerCase().trim()
      const filtered = options.filter(opt => 
        opt.toLowerCase().includes(searchText)
      )
      setFilteredOptions(filtered.length > 0 ? filtered : options)
    }
    setHighlightedIndex(-1)
  }, [options, value, type])

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

  // Calcular posición del dropdown cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      })
    }
  }, [isOpen])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    // Abrir dropdown solo si hay opciones disponibles
    if (options.length > 0) {
      setIsOpen(true)
    }
  }

  const handleInputFocus = () => {
    // Abrir dropdown solo si hay opciones disponibles
    if (options.length > 0) {
      setIsOpen(true)
    }
  }

  const handleInputClick = () => {
    // Abrir dropdown solo si hay opciones disponibles
    if (options.length > 0) {
      setIsOpen(true)
    }
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
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

  const dropdownContent = showDropdown && (
    <motion.div
      ref={dropdownRef}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 9999
      }}
      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
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
  )

  return (
    <>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full border border-gray-300 dark:border-gray-600 p-2 rounded focus:outline-none focus:ring-2 focus:ring-brand ${className}`}
          autoComplete="off"
        />
      </div>
      
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {dropdownContent}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

export default ExpenseAutocomplete