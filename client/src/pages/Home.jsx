import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { generateInvoicePdf } from '../utils/generateInvoicePdf.js'
import { fetchInvoiceNumber, createInvoice } from '../feature/invoiceSlice.js'

export default function Home() {


  const [formData, setFormData] = useState({
    customerName: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    items: '',
    quantity: '',
    price: '',
    units: 'sqft',
    gst: '',
    discount: '',
    dueDate: '',
    total: ''
  });

  const dispatch = useDispatch()
  const { invoiceNumber } = useSelector((state) => state.invoice)

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTotal = () => {
    const { quantity, price, gst, discount } = formData;
    if (quantity && price) {
      const subtotal = parseFloat(quantity) * parseFloat(price);
      const gstAmount = subtotal * (parseFloat(gst || 0) / 100);
      const discountAmount = subtotal * (parseFloat(discount || 0) / 100);
      const total = subtotal + gstAmount - discountAmount;
      setFormData(prev => ({ ...prev, total: total.toFixed(2) }));
    }
  };

  useEffect(() => {
    dispatch(fetchInvoiceNumber())
  }, [dispatch])

  useEffect(() => {
    if (invoiceNumber) {
      setFormData((prev) => ({ ...prev, invoiceNumber }))
    }
  }, [invoiceNumber])

  useEffect(() => {
    calculateTotal();
  }, [formData.quantity, formData.price, formData.gst, formData.discount]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSend = {
        ...formData,
        invoiceDate: new Date(formData.invoiceDate).toISOString(),
        dueDate: new Date(formData.dueDate).toISOString(),
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        gst: parseFloat(formData.gst || 0),
        discount: parseFloat(formData.discount || 0),
        total: parseFloat(formData.total)
      };

      // dispatch invoice creation through Redux
      const resultAction = await dispatch(createInvoice(dataToSend));
      if (createInvoice.fulfilled.match(resultAction)) {
        const pdfItems = [
          {
            desc: formData.items,
            qty: formData.quantity,
            price: formData.price
          }
        ];

        await generateInvoicePdf({
          customerName: formData.customerName,
          invoiceNumber: resultAction.payload.invoiceNumber || formData.invoiceNumber,
          invoiceDate: formData.invoiceDate,
          items: pdfItems
        });

        alert('Invoice created & PDF downloaded!');
      } else {
        throw new Error(resultAction.payload || resultAction.error.message)
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create invoice');
    }
  };

  const inputStyle =
    "w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-2xl font-bold text-center mb-6 text-gray-700">
          Invoice Generator
        </h1>

        <form onSubmit={handleSubmit}>
          <table className="w-full border-separate border-spacing-y-4 border-spacing-x-6">
            <tbody>

              <tr>
                <td className="font-medium text-gray-600 pr-4 py-2">Customer Name</td>
                <td className="py-2">
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                  />
                </td>

                <td className="font-medium text-gray-600 pr-4 py-2">Invoice #</td>
                <td className="py-2">
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    className={inputStyle}
                    readOnly
                    required
                  />
                </td>

                <td className="font-medium text-gray-600 pr-4 py-2">Invoice Date</td>
                <td className="py-2">
                  <input
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate}
                    onChange={handleChange}
                    readOnly
                    className={inputStyle}
                    required
                  />
                </td>
              </tr>

              <tr>
                <td className="font-medium text-gray-600 pr-4 py-2">Description</td>
                <td colSpan="5" className="py-2">
                  <textarea
                    name="items"
                    value={formData.items}
                    onChange={handleChange}
                    className={inputStyle}
                    rows="3"
                    required
                  />
                </td>
              </tr>

              <tr>
                <td className="font-medium text-gray-600 pr-4 py-2">Quantity</td>
                <td className="py-2">
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                  />
                </td>

                <td className="font-medium text-gray-600 pr-4 py-2">Price</td>
                <td className="py-2">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                  />
                </td>

                <td className="font-medium text-gray-600 pr-4 py-2">Units</td>
                <td className="py-2">
                  <select
                    name="units"
                    value={formData.units}
                    onChange={handleChange}
                    className={inputStyle}
                  >
                    <option value="sqft">Sqft</option>
                    <option value="dismil">Dismil</option>
                    <option value="khata">Khata</option>
                    <option value="sqyrd">Sqyrd</option>
                    <option value="acre">Acre</option>
                  </select>
                </td>
              </tr>

              <tr>
                <td className="font-medium text-gray-600 pr-4 py-2">GST (%)</td>
                <td className="py-2">
                  <input
                    type="number"
                    name="gst"
                    value={formData.gst}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </td>

                <td className="font-medium text-gray-600 pr-4 py-2">Discount (%)</td>
                <td className="py-2">
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    className={inputStyle}
                  />
                </td>

                <td className="font-medium text-gray-600 pr-4 py-2">Due Date</td>
                <td className="py-2">
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className={inputStyle}
                    required
                  />
                </td>
              </tr>

              <tr>
                <td className="font-medium text-gray-600 pr-4 py-2">Total</td>
                <td className="py-2">
                  <input
                    type="text"
                    name="total"
                    value={formData.total}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-200 text-gray-700"
                  />
                </td>

                <td colSpan="4" className="py-2">
                  <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold shadow-md transition duration-200 ease-in-out hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Save & Download PDF
                  </button>
                </td>
              </tr>

            </tbody>
          </table>
        </form>

      </div>
    </div>
  )
}