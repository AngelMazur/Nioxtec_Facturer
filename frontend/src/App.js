import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  // Estado para clientes e invoices
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  // Formulario de clientes
  const [clientForm, setClientForm] = useState({
    name: '',
    cif: '',
    address: '',
    email: '',
    phone: '',
    iban: ''
  });
  // Formulario de facturas/proformas
  const [invoiceForm, setInvoiceForm] = useState({
    number: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'factura',
    client_id: '',
    items: [ { description: '', units: 1, unit_price: 0, tax_rate: 21 } ]
  });
  // Mensaje de estado para mostrar notificaciones simples
  const [message, setMessage] = useState('');

  // La URL base se deja vacía para que las peticiones se resuelvan
  // respecto al dominio actual.  Esto evita problemas de CORS
  // cuando la aplicación se sirve desde Flask (http://localhost:5000)
  // o desde Vite (http://localhost:5173) con proxy.
  const API_BASE = '';

  // Cargar clientes e invoices al montar el componente
  useEffect(() => {
    fetchClients();
    fetchInvoices();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get(`${API_BASE}/clients`);
      setClients(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get(`${API_BASE}/invoices`);
      setInvoices(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClientChange = (e) => {
    setClientForm({ ...clientForm, [e.target.name]: e.target.value });
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/clients`, clientForm);
      setMessage('Cliente creado correctamente');
      setClientForm({ name: '', cif: '', address: '', email: '', phone: '', iban: '' });
      fetchClients();
    } catch (err) {
      console.error(err);
      setMessage('Error al crear cliente');
    }
  };

  const handleInvoiceChange = (e) => {
    setInvoiceForm({ ...invoiceForm, [e.target.name]: e.target.value });
  };

  const handleItemChange = (idx, field, value) => {
    const newItems = invoiceForm.items.map((item, i) => {
      if (i !== idx) return item;
      return { ...item, [field]: field === 'units' || field === 'unit_price' || field === 'tax_rate' ? Number(value) : value };
    });
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const addItemRow = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: '', units: 1, unit_price: 0, tax_rate: 21 }]
    });
  };

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    // Ensure client_id is integer
    const payload = {
      ...invoiceForm,
      client_id: Number(invoiceForm.client_id),
    };
    try {
      await axios.post(`${API_BASE}/invoices`, payload);
      setMessage('Factura/Proforma creada correctamente');
      // Reset invoice form
      setInvoiceForm({
        number: '',
        date: new Date().toISOString().slice(0, 10),
        type: 'factura',
        client_id: '',
        items: [ { description: '', units: 1, unit_price: 0, tax_rate: 21 } ]
      });
      fetchInvoices();
    } catch (err) {
      console.error(err);
      setMessage('Error al crear factura');
    }
  };

  const downloadInvoice = async (id, number) => {
    try {
      const response = await axios.get(`${API_BASE}/invoices/${id}/pdf`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      setMessage('Error al descargar PDF');
    }
  };

  return (
    <div className="container">
      <h1>Nioxtec Facturer</h1>
      {message && <p className="message">{message}</p>}

      {/* Sección de clientes */}
      <h2>Crear cliente</h2>
      <form onSubmit={handleClientSubmit}>
        <input name="name" placeholder="Nombre" value={clientForm.name} onChange={handleClientChange} required />
        <input name="cif" placeholder="CIF" value={clientForm.cif} onChange={handleClientChange} required />
        <input name="address" placeholder="Dirección" value={clientForm.address} onChange={handleClientChange} required />
        <input type="email" name="email" placeholder="Email" value={clientForm.email} onChange={handleClientChange} required />
        <input name="phone" placeholder="Teléfono" value={clientForm.phone} onChange={handleClientChange} required />
        <input name="iban" placeholder="IBAN" value={clientForm.iban} onChange={handleClientChange} />
        <div className="actions">
          <button type="submit" className="primary">Guardar cliente</button>
        </div>
      </form>

      {/* Sección de facturas/proformas */}
      <h2>Crear factura/proforma</h2>
      <form onSubmit={handleInvoiceSubmit}>
        <input name="number" placeholder="Número" value={invoiceForm.number} onChange={handleInvoiceChange} required />
        <input type="date" name="date" value={invoiceForm.date} onChange={handleInvoiceChange} required />
        <select name="type" value={invoiceForm.type} onChange={handleInvoiceChange}>
          <option value="factura">Factura</option>
          <option value="proforma">Proforma</option>
        </select>
        <select name="client_id" value={invoiceForm.client_id} onChange={handleInvoiceChange} required>
          <option value="">Selecciona cliente</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <h3>Líneas</h3>
        {invoiceForm.items.map((item, idx) => (
          <div key={idx} className="invoice-item">
            <input
              placeholder="Descripción"
              value={item.description}
              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
              required
            />
            <input
              type="number"
              min="1"
              placeholder="Unidades"
              value={item.units}
              onChange={(e) => handleItemChange(idx, 'units', e.target.value)}
              required
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Precio unitario"
              value={item.unit_price}
              onChange={(e) => handleItemChange(idx, 'unit_price', e.target.value)}
              required
            />
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="IVA (%)"
              value={item.tax_rate}
              onChange={(e) => handleItemChange(idx, 'tax_rate', e.target.value)}
              required
            />
          </div>
        ))}
        <div className="actions">
          <button type="button" className="secondary" onClick={addItemRow}>Añadir línea</button>
          <button type="submit" className="primary">Guardar factura/proforma</button>
        </div>
      </form>

      {/* Tabla de facturas/proformas */}
      <h2>Facturas y proformas</h2>
      <table>
        <thead>
          <tr>
            <th>Número</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Tipo</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.number}</td>
              <td>{inv.date}</td>
              <td>{(clients.find(c => c.id === inv.client_id) || {}).name}</td>
              <td>{inv.type}</td>
              <td>{inv.total.toFixed(2)}</td>
              <td>
                <button className="secondary" onClick={() => downloadInvoice(inv.id, inv.number)}>Descargar PDF</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;