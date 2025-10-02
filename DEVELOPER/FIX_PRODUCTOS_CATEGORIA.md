# 🔧 FIX: Productos se Creaban Fuera de la Categoría

**Fecha:** 2 de octubre de 2025  
**Estado:** ✅ RESUELTO  
**Archivos Modificados:**
- `frontend/src/components/ProductModal.jsx`
- `frontend/src/pages/Productos.jsx`

---

## 🐛 **Problema Identificado**

### Síntoma
Cuando el usuario hacía clic en una tarjeta de categoría (ej: "TPVs") y creaba un producto:
```
1. Usuario hace clic en tarjeta "TPVs"
2. Se abre el modal
3. Usuario rellena: Modelo "TPV-18""
4. Guarda
5. ❌ Se crea una NUEVA CATEGORÍA "TPV-18"" en lugar de un producto dentro de "TPVs"
```

### Causa Raíz
```javascript
// ANTES - Problema:
// 1. Modal abría con initialCategory = 'TPVs'
// 2. Usuario cambiaba category a 'TPV-18"' (pensando que era el modelo)
// 3. Se guardaba con category='TPV-18"' ❌
```

**Confusión de terminología:**
- El campo se llamaba "Categoría" pero el usuario pensaba que era para el nombre del producto
- No había indicación clara de que la categoría debía mantenerse fija
- El formulario permitía cambiar la categoría libremente

---

## ✅ **Solución Implementada**

### 1. **Bloqueo de Categoría Pre-seleccionada** 🔒

Cuando el modal se abre desde una tarjeta de categoría:
- La categoría se **bloquea** (campo deshabilitado)
- Aparece un icono de candado 🔒
- Se muestra mensaje: "Los productos se crearán en la categoría seleccionada"

```javascript
// NUEVO:
const categoryLocked = Boolean(initialCategory && !editingProduct)

<input
  value={productForm.category}
  disabled={categoryLocked}  // ← Bloqueado si viene de tarjeta
  className={categoryLocked ? 'opacity-70 cursor-not-allowed' : ''}
/>
```

### 2. **Labels Mejorados** 📝

**ANTES:**
```
Categoría: [______]
Modelo:    [______]
```

**AHORA:**
```
Categoría (TPVs, Pantallas...) 🔒 Bloqueada
[TPVs                                     ] ← Deshabilitado
          ↑ Gris, no editable

Modelo del Producto *
[TPV-18, Samsung 55 UHD                   ]
```

### 3. **Título Dinámico del Modal** 📄

**ANTES:**
```
┌────────────────────────┐
│ ➕ Crear Producto      │
│ Completa información   │
└────────────────────────┘
```

**AHORA:**
```
┌─────────────────────────────────┐
│ ➕ Nuevo Producto en TPVs       │ ← Menciona la categoría
│ Añade un nuevo modelo a TPVs    │
└─────────────────────────────────┘
```

### 4. **Reseteo Automático del Formulario** 🔄

```javascript
// useEffect que resetea el form cuando se abre
useEffect(() => {
  if (isOpen) {
    setProductForm({
      category: editingProduct?.category || initialCategory || '',
      model: editingProduct?.model || initialModel || '',
      // ... resto de campos
    })
    setActiveTab('general')
  }
}, [isOpen, editingProduct, initialCategory, initialModel])
```

**Beneficio:** Cada vez que abres el modal, los valores se cargan correctamente según el contexto.

### 5. **Limpieza de Estado al Cerrar** 🧹

```javascript
onClose={() => {
  setShowProductModal(false)
  setEditingProduct(null)
  // Limpiar contexto si se cancela
  if (!editingProduct) {
    setSelectedCategory(null)
    setSelectedModel(null)
  }
}}
```

---

## 📊 **Flujo Corregido**

### **Caso A: Crear desde Tarjeta de Categoría**

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario hace clic en tarjeta "TPVs"                 │
│    ↓                                                     │
│ 2. handleCreateForCategory('TPVs')                      │
│    - setSelectedCategory('TPVs')                        │
│    - setShowProductModal(true)                          │
│    ↓                                                     │
│ 3. Modal se abre con:                                   │
│    - initialCategory = 'TPVs'                           │
│    - categoryLocked = true ✅                           │
│    ↓                                                     │
│ 4. Campo "Categoría":                                   │
│    [TPVs] 🔒 Bloqueada                                  │
│    ↑ Gris, deshabilitado, no se puede cambiar          │
│    ↓                                                     │
│ 5. Usuario rellena:                                     │
│    Modelo: "TPV-18""                                    │
│    SKU: "MITPV18"                                       │
│    Stock: 10                                            │
│    ↓                                                     │
│ 6. Guarda → Payload enviado:                            │
│    {                                                     │
│      category: 'TPVs',        ← CORRECTO ✅             │
│      model: 'TPV-18"',                                  │
│      sku: 'MITPV18',                                    │
│      ...                                                 │
│    }                                                     │
│    ↓                                                     │
│ 7. Backend crea producto dentro de TPVs ✅             │
└─────────────────────────────────────────────────────────┘
```

### **Caso B: Crear desde Botón Principal**

```
┌─────────────────────────────────────────────────────────┐
│ 1. Usuario hace clic en "Crear Producto" (botón)       │
│    ↓                                                     │
│ 2. handleCreateProduct()                                │
│    - setSelectedCategory(null)  ← Limpia contexto       │
│    - setShowProductModal(true)                          │
│    ↓                                                     │
│ 3. Modal se abre con:                                   │
│    - initialCategory = null                             │
│    - categoryLocked = false                             │
│    ↓                                                     │
│ 4. Campo "Categoría":                                   │
│    [____________] ← Editable, el usuario elige          │
│    ↓                                                     │
│ 5. Usuario rellena TODO manualmente:                    │
│    Categoría: "Pantallas"                               │
│    Modelo: "Samsung 55 UHD"                             │
│    ...                                                   │
│    ↓                                                     │
│ 6. Guarda → Se crea correctamente ✅                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 **Resultado Visual**

### **Modal desde Tarjeta de Categoría:**

```
┌──────────────────────────────────────────────────────────┐
│ ➕ Nuevo Producto en TPVs                        [X]     │
│ Añade un nuevo modelo a la categoría TPVs               │
├──────────────────────────────────────────────────────────┤
│ 📋 General │ ⚙️ Características │ 🖼️ Imágenes            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Categoría (TPVs, Pantallas...) * 🔒 Bloqueada           │
│ ┌────────────────────────────────────────────┐          │
│ │ TPVs                                       │ ← Gris   │
│ └────────────────────────────────────────────┘          │
│ Los productos se crearán en la categoría seleccionada   │
│                                                          │
│ Modelo del Producto *                                    │
│ ┌────────────────────────────────────────────┐          │
│ │ TPV-18, Samsung 55 UHD                     │          │
│ └────────────────────────────────────────────┘          │
│                                                          │
│ SKU / Código Interno (opcional)                         │
│ ┌────────────────────────────────────────────┐          │
│ │ MITPV18                                    │          │
│ └────────────────────────────────────────────┘          │
│ Código único para identificar esta variante             │
│                                                          │
│ ... (resto de campos) ...                                │
│                                                          │
├──────────────────────────────────────────────────────────┤
│              [Cancelar]  [Crear Producto]                │
└──────────────────────────────────────────────────────────┘
```

---

## 📚 **Estructura de Datos Clarificada**

### **Terminología Correcta:**

```
CATEGORÍA (Category)
  └── MODELO (Model)
       └── PRODUCTO/VARIANTE (Product/SKU)

Ejemplo Real:
TPVs (Categoría)
  └── TPV-18" (Modelo)
       ├── MITPV18 (Producto 1 - Stock: 10, Precio: 500€)
       └── TPV18-PRO (Producto 2 - Stock: 5, Precio: 600€)
  └── TPV-15" (Modelo)
       └── MITPV15 (Producto 3 - Stock: 8, Precio: 400€)

Pantallas (Categoría)
  └── Samsung 55 UHD (Modelo)
       └── SAM55-001 (Producto - Stock: 3, Precio: 800€)
```

### **Campos del Formulario:**

| Campo | Qué Representa | Ejemplo |
|-------|----------------|---------|
| **Categoría** | Tipo de producto | TPVs, Pantallas |
| **Modelo** | Nombre comercial del producto | TPV-18", Samsung 55 UHD |
| **SKU** | Código interno único | MITPV18, SAM55-001 |
| **Stock** | Unidades disponibles | 10, 5, 3 |
| **Precio** | Precio neto sin IVA | 500€ |

---

## 🧪 **Cómo Probar el Fix**

### **Test 1: Crear desde Tarjeta**
```
1. Ir a /productos
2. Hacer clic en tarjeta "TPVs"
3. Verificar que aparece: "Nuevo Producto en TPVs"
4. Verificar que campo "Categoría" está bloqueado (gris)
5. Rellenar Modelo: "TPV-18""
6. Rellenar SKU: "MITPV18"
7. Guardar
8. ✅ Verificar que aparece dentro de "TPVs" (no como nueva categoría)
```

### **Test 2: Crear desde Botón Principal**
```
1. Ir a /productos
2. Hacer clic en botón "Crear Producto"
3. Verificar que título es "Crear Producto" (genérico)
4. Verificar que campo "Categoría" está habilitado (editable)
5. Rellenar todo manualmente
6. Guardar
7. ✅ Verificar que se crea correctamente
```

### **Test 3: Cancelar Modal**
```
1. Abrir modal desde tarjeta
2. Rellenar algo
3. Hacer clic en "Cancelar" o [X]
4. Volver a abrir desde otra tarjeta
5. ✅ Verificar que formulario está limpio y con nueva categoría
```

---

## ✅ **Cambios en el Código**

### **ProductModal.jsx:**
```diff
+ import { useState, useEffect } from 'react'

+ const categoryLocked = Boolean(initialCategory && !editingProduct)

+ // Reseteo automático cuando se abre
+ useEffect(() => {
+   if (isOpen) {
+     setProductForm({
+       category: editingProduct?.category || initialCategory || '',
+       // ...
+     })
+   }
+ }, [isOpen, editingProduct, initialCategory, initialModel])

  <input
    value={productForm.category}
+   disabled={categoryLocked}
+   className={categoryLocked ? 'bg-gray-800/30 cursor-not-allowed opacity-70' : 'bg-gray-800/50'}
  />

+ {categoryLocked && (
+   <span className="text-xs text-brand">🔒 Bloqueada</span>
+ )}
```

### **Productos.jsx:**
```diff
  const handleCreateProduct = () => {
    setEditingProduct(null)
+   setSelectedCategory(null)  // Limpiar para permitir selección libre
+   setSelectedModel(null)
    setShowProductModal(true)
  }

  onClose={() => {
    setShowProductModal(false)
    setEditingProduct(null)
+   // Limpiar contexto si se cancela
+   if (!editingProduct) {
+     setSelectedCategory(null)
+     setSelectedModel(null)
+   }
  }}
```

---

## 🎉 **Resultado Final**

✅ **Los productos se crean DENTRO de la categoría correcta**  
✅ **No se pueden crear categorías accidentalmente**  
✅ **La UX es más clara con campos bloqueados e iconos**  
✅ **El formulario se resetea correctamente entre aperturas**  
✅ **Los títulos son dinámicos y contextuales**  

---

## 🔮 **Mejoras Futuras Sugeridas**

1. **Selector visual de categorías** (en lugar de input libre)
   ```jsx
   <select>
     <option value="TPVs">📺 TPVs</option>
     <option value="Pantallas">🖥️ Pantallas</option>
   </select>
   ```

2. **Autocompletar modelo** basado en modelos existentes

3. **Plantillas de productos** (cargar características predefinidas)

4. **Vista previa** del producto antes de guardar

---

**Estado:** ✅ **RESUELTO Y TESTEADO**  
**Próximo paso:** Probar en producción y observar comportamiento del usuario
